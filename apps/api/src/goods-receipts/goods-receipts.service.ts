import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { GoodsReceiptStatus, PurchaseOrderStatus, Role } from '@prisma/client';

import { PurchaseOrderRepository } from '../purchase-orders/purchase-order.repository';
import {
  GRN_COMPLETE_ROLES,
  GRN_RECEIVE_ROLES,
  GRN_VIEW_ROLES,
} from './constants/grn-role.constants';
import { CreateGoodsReceiptDto } from './dto/create-goods-receipt.dto';
import { ListGoodsReceiptQueryDto } from './dto/list-goods-receipt-query.dto';
import { ReceiveGoodsDto } from './dto/receive-goods.dto';
import { RejectGoodsDto } from './dto/reject-goods.dto';
import { UpdateGoodsReceiptDto } from './dto/update-goods-receipt.dto';
import {
  GoodsReceiptRepository,
  GoodsReceiptWithRelations,
} from './goods-receipt.repository';

const ELIGIBLE_PO_STATUSES: PurchaseOrderStatus[] = [
  PurchaseOrderStatus.ISSUED,
  PurchaseOrderStatus.ACKNOWLEDGED,
  PurchaseOrderStatus.PARTIALLY_DELIVERED,
];

@Injectable()
export class GoodsReceiptsService {
  constructor(
    private readonly goodsReceiptRepository: GoodsReceiptRepository,
    private readonly purchaseOrderRepository: PurchaseOrderRepository,
  ) {}

  async create(
    organisationId: string,
    userId: string,
    dto: CreateGoodsReceiptDto,
  ) {
    const purchaseOrder = await this.purchaseOrderRepository.findById(
      dto.purchaseOrderId,
      organisationId,
    );

    if (!purchaseOrder) {
      throw new NotFoundException('Purchase order not found');
    }

    this.assertPurchaseOrderEligible(purchaseOrder.status);

    if (!purchaseOrder.items.length) {
      throw new BadRequestException(
        'Purchase order must contain at least one line item',
      );
    }

    const cumulativeReceived =
      await this.goodsReceiptRepository.getCumulativeReceivedByPurchaseOrder(
        purchaseOrder.id,
      );
    const receivedByItem = this.buildCumulativeMap(cumulativeReceived);

    const receiptItems = purchaseOrder.items
      .map((item) => {
        const alreadyReceived = receivedByItem.get(item.id) ?? 0;
        const remaining = item.quantity - alreadyReceived;

        return {
          purchaseOrderItemId: item.id,
          quantityOrdered: remaining,
        };
      })
      .filter((item) => item.quantityOrdered > 0);

    if (!receiptItems.length) {
      throw new BadRequestException(
        'All purchase order items have already been fully received',
      );
    }

    const receiptNumber = await this.generateReceiptNumber(organisationId);

    const goodsReceipt = await this.goodsReceiptRepository.createWithItems(
      {
        receiptNumber,
        status: GoodsReceiptStatus.DRAFT,
        receiptDate: new Date(dto.receiptDate),
        warehouse: dto.warehouse,
        notes: dto.notes,
        organisation: { connect: { id: organisationId } },
        purchaseOrder: { connect: { id: purchaseOrder.id } },
        receivedBy: { connect: { id: userId } },
      },
      receiptItems,
    );

    return this.mapGoodsReceipt(goodsReceipt);
  }

  async findAll(
    organisationId: string,
    userRole: Role,
    query: ListGoodsReceiptQueryDto,
  ) {
    this.assertCanView(userRole);

    const pagination = this.resolvePagination(query);
    const filters = {
      status: query.status,
      purchaseOrderId: query.purchaseOrderId,
    };
    const searchTerm = query.search?.trim();

    const [goodsReceipts, total] = searchTerm
      ? await this.goodsReceiptRepository.search(
          organisationId,
          searchTerm,
          filters,
          pagination,
        )
      : await this.goodsReceiptRepository.paginate(
          organisationId,
          filters,
          pagination,
        );

    return this.buildPaginatedResponse(goodsReceipts, total, pagination);
  }

  async findOne(organisationId: string, userRole: Role, id: string) {
    this.assertCanView(userRole);

    const goodsReceipt = await this.getGoodsReceiptOrThrow(organisationId, id);

    return this.mapGoodsReceipt(goodsReceipt);
  }

  async update(
    organisationId: string,
    userRole: Role,
    id: string,
    dto: UpdateGoodsReceiptDto,
  ) {
    this.assertCanReceive(userRole);

    const goodsReceipt = await this.getGoodsReceiptOrThrow(organisationId, id);

    this.assertDraft(goodsReceipt);

    const updated = await this.goodsReceiptRepository.update(id, {
      ...(dto.receiptDate !== undefined
        ? { receiptDate: new Date(dto.receiptDate) }
        : {}),
      ...(dto.warehouse !== undefined ? { warehouse: dto.warehouse } : {}),
      ...(dto.notes !== undefined ? { notes: dto.notes } : {}),
    });

    return this.mapGoodsReceipt(updated);
  }

  async delete(organisationId: string, userRole: Role, id: string) {
    this.assertCanReceive(userRole);

    const goodsReceipt = await this.getGoodsReceiptOrThrow(organisationId, id);

    this.assertDraft(goodsReceipt);

    await this.goodsReceiptRepository.delete(id);

    return { message: 'Goods receipt deleted successfully' };
  }

  async receive(
    organisationId: string,
    userRole: Role,
    id: string,
    dto: ReceiveGoodsDto,
  ) {
    this.assertCanReceive(userRole);

    const goodsReceipt = await this.getGoodsReceiptOrThrow(organisationId, id);

    this.assertReceivable(goodsReceipt);

    const purchaseOrder = await this.purchaseOrderRepository.findById(
      goodsReceipt.purchaseOrderId,
      organisationId,
    );

    if (!purchaseOrder) {
      throw new NotFoundException('Purchase order not found');
    }

    this.assertPurchaseOrderEligible(purchaseOrder.status);

    const itemMap = new Map(goodsReceipt.items.map((item) => [item.id, item]));

    const cumulativeReceived =
      await this.goodsReceiptRepository.getCumulativeReceivedByPurchaseOrder(
        goodsReceipt.purchaseOrderId,
      );
    const receivedByPoItem = this.buildCumulativeMap(cumulativeReceived);

    const poItemMap = new Map(
      purchaseOrder.items.map((item) => [item.id, item]),
    );

    const itemUpdates: Array<{ id: string; quantityReceived: number }> = [];

    for (const entry of dto.items) {
      const receiptItem = itemMap.get(entry.goodsReceiptItemId);

      if (!receiptItem) {
        throw new BadRequestException(
          `Goods receipt item ${entry.goodsReceiptItemId} not found on this receipt`,
        );
      }

      const poItem = poItemMap.get(receiptItem.purchaseOrderItemId);

      if (!poItem) {
        throw new BadRequestException('Purchase order item not found');
      }

      const otherReceiptsReceived =
        (receivedByPoItem.get(receiptItem.purchaseOrderItemId) ?? 0) -
        receiptItem.quantityReceived;
      const maxReceivableOnLine =
        receiptItem.quantityOrdered - receiptItem.quantityRejected;

      if (entry.quantityReceived > maxReceivableOnLine) {
        throw new BadRequestException(
          `Received quantity cannot exceed remaining receivable quantity for item ${receiptItem.id}`,
        );
      }

      const totalReceivedAfter = otherReceiptsReceived + entry.quantityReceived;

      if (totalReceivedAfter > poItem.quantity) {
        throw new BadRequestException(
          `Received quantity cannot exceed ordered quantity for purchase order item ${poItem.id}`,
        );
      }

      if (
        entry.quantityReceived + receiptItem.quantityRejected >
        receiptItem.quantityOrdered
      ) {
        throw new BadRequestException(
          `Received and rejected quantities cannot exceed ordered quantity on this receipt line`,
        );
      }

      itemUpdates.push({
        id: receiptItem.id,
        quantityReceived: entry.quantityReceived,
      });
    }

    const updatedItems = goodsReceipt.items.map((item) => {
      const update = itemUpdates.find((entry) => entry.id === item.id);

      return {
        ...item,
        quantityReceived: update?.quantityReceived ?? item.quantityReceived,
      };
    });

    const status = this.resolveReceiptProgressStatus(updatedItems);

    const received = await this.goodsReceiptRepository.receive(
      id,
      itemUpdates,
      status,
    );

    await this.syncPurchaseOrderDeliveryStatus(
      goodsReceipt.purchaseOrderId,
      organisationId,
    );

    return this.mapGoodsReceipt(received);
  }

  async reject(
    organisationId: string,
    userRole: Role,
    id: string,
    dto: RejectGoodsDto,
  ) {
    this.assertCanReceive(userRole);

    const goodsReceipt = await this.getGoodsReceiptOrThrow(organisationId, id);

    this.assertReceivable(goodsReceipt);

    const purchaseOrder = await this.purchaseOrderRepository.findById(
      goodsReceipt.purchaseOrderId,
      organisationId,
    );

    if (!purchaseOrder) {
      throw new NotFoundException('Purchase order not found');
    }

    this.assertPurchaseOrderEligible(purchaseOrder.status);

    const itemMap = new Map(goodsReceipt.items.map((item) => [item.id, item]));

    const itemUpdates: Array<{
      id: string;
      quantityRejected: number;
      remarks: string;
    }> = [];

    for (const entry of dto.items) {
      const receiptItem = itemMap.get(entry.goodsReceiptItemId);

      if (!receiptItem) {
        throw new BadRequestException(
          `Goods receipt item ${entry.goodsReceiptItemId} not found on this receipt`,
        );
      }

      if (entry.quantityRejected > 0 && !entry.remarks?.trim()) {
        throw new BadRequestException(
          'Rejected quantities must include remarks',
        );
      }

      if (
        entry.quantityRejected + receiptItem.quantityReceived >
        receiptItem.quantityOrdered
      ) {
        throw new BadRequestException(
          `Rejected quantity cannot exceed remaining quantity on receipt line ${receiptItem.id}`,
        );
      }

      itemUpdates.push({
        id: receiptItem.id,
        quantityRejected: entry.quantityRejected,
        remarks: entry.remarks,
      });
    }

    const updatedItems = goodsReceipt.items.map((item) => {
      const update = itemUpdates.find((entry) => entry.id === item.id);

      return {
        ...item,
        quantityRejected: update?.quantityRejected ?? item.quantityRejected,
        remarks: update?.remarks ?? item.remarks,
      };
    });

    const status = this.resolveReceiptProgressStatus(updatedItems, true);

    const rejected = await this.goodsReceiptRepository.reject(
      id,
      itemUpdates,
      status,
    );

    await this.syncPurchaseOrderDeliveryStatus(
      goodsReceipt.purchaseOrderId,
      organisationId,
    );

    return this.mapGoodsReceipt(rejected);
  }

  async complete(organisationId: string, userRole: Role, id: string) {
    if (!GRN_COMPLETE_ROLES.includes(userRole)) {
      throw new ForbiddenException(
        'Only admins may mark goods receipts as completed',
      );
    }

    const goodsReceipt = await this.getGoodsReceiptOrThrow(organisationId, id);

    if (goodsReceipt.status === GoodsReceiptStatus.DRAFT) {
      throw new BadRequestException(
        'Draft goods receipts must be received before completion',
      );
    }

    if (goodsReceipt.status === GoodsReceiptStatus.COMPLETED) {
      throw new BadRequestException('Goods receipt is already completed');
    }

    if (goodsReceipt.status === GoodsReceiptStatus.REJECTED) {
      throw new BadRequestException(
        'Rejected goods receipts cannot be marked as completed',
      );
    }

    const hasProgress = goodsReceipt.items.some(
      (item) => item.quantityReceived > 0 || item.quantityRejected > 0,
    );

    if (!hasProgress) {
      throw new BadRequestException(
        'Goods receipt must have received or rejected quantities before completion',
      );
    }

    const completed = await this.goodsReceiptRepository.complete(id);

    await this.syncPurchaseOrderDeliveryStatus(
      goodsReceipt.purchaseOrderId,
      organisationId,
    );

    return this.mapGoodsReceipt(completed);
  }

  async findByPurchaseOrder(
    organisationId: string,
    userRole: Role,
    purchaseOrderId: string,
  ) {
    this.assertCanView(userRole);

    const purchaseOrder = await this.purchaseOrderRepository.findById(
      purchaseOrderId,
      organisationId,
    );

    if (!purchaseOrder) {
      throw new NotFoundException('Purchase order not found');
    }

    const goodsReceipts = await this.goodsReceiptRepository.findByPurchaseOrder(
      purchaseOrderId,
      organisationId,
    );

    return {
      goodsReceipts: goodsReceipts.map((receipt) =>
        this.mapGoodsReceipt(receipt),
      ),
    };
  }

  private async getGoodsReceiptOrThrow(organisationId: string, id: string) {
    const goodsReceipt = await this.goodsReceiptRepository.findById(
      id,
      organisationId,
    );

    if (!goodsReceipt) {
      throw new NotFoundException('Goods receipt not found');
    }

    return goodsReceipt;
  }

  private assertCanReceive(userRole: Role) {
    if (!GRN_RECEIVE_ROLES.includes(userRole)) {
      throw new ForbiddenException(
        'Insufficient permissions to manage goods receipts',
      );
    }
  }

  private assertCanView(userRole: Role) {
    if (!GRN_VIEW_ROLES.includes(userRole)) {
      throw new ForbiddenException(
        'Insufficient permissions to view goods receipts',
      );
    }
  }

  private assertDraft(goodsReceipt: GoodsReceiptWithRelations) {
    if (goodsReceipt.status !== GoodsReceiptStatus.DRAFT) {
      throw new BadRequestException(
        'Only draft goods receipts can be modified',
      );
    }
  }

  private assertReceivable(goodsReceipt: GoodsReceiptWithRelations) {
    if (
      goodsReceipt.status === GoodsReceiptStatus.COMPLETED ||
      goodsReceipt.status === GoodsReceiptStatus.REJECTED
    ) {
      throw new BadRequestException(
        'Completed or rejected goods receipts cannot be updated',
      );
    }
  }

  private assertPurchaseOrderEligible(status: PurchaseOrderStatus) {
    if (status === PurchaseOrderStatus.CANCELLED) {
      throw new BadRequestException(
        'Cannot receive goods for cancelled purchase orders',
      );
    }

    if (!ELIGIBLE_PO_STATUSES.includes(status)) {
      throw new BadRequestException(
        'Goods receipts can only be created from issued, acknowledged, or partially delivered purchase orders',
      );
    }
  }

  private resolveReceiptProgressStatus(
    items: Array<{
      quantityOrdered: number;
      quantityReceived: number;
      quantityRejected: number;
    }>,
    rejectionContext = false,
  ): GoodsReceiptStatus {
    const allAccountedFor = items.every(
      (item) =>
        item.quantityReceived + item.quantityRejected >= item.quantityOrdered,
    );
    const allRejected = items.every(
      (item) =>
        item.quantityRejected >= item.quantityOrdered &&
        item.quantityReceived === 0,
    );
    const anyReceived = items.some((item) => item.quantityReceived > 0);
    const anyRejected = items.some((item) => item.quantityRejected > 0);

    if (allRejected && (rejectionContext || !anyReceived)) {
      return GoodsReceiptStatus.REJECTED;
    }

    if (allAccountedFor && anyReceived) {
      return GoodsReceiptStatus.RECEIVED;
    }

    if (anyReceived || anyRejected) {
      return GoodsReceiptStatus.PARTIALLY_RECEIVED;
    }

    return GoodsReceiptStatus.DRAFT;
  }

  private buildCumulativeMap(
    items: Array<{
      purchaseOrderItemId: string;
      quantityReceived: number;
    }>,
  ) {
    const map = new Map<string, number>();

    for (const item of items) {
      const current = map.get(item.purchaseOrderItemId) ?? 0;
      map.set(item.purchaseOrderItemId, current + item.quantityReceived);
    }

    return map;
  }

  private async syncPurchaseOrderDeliveryStatus(
    purchaseOrderId: string,
    organisationId: string,
  ) {
    const purchaseOrder = await this.purchaseOrderRepository.findById(
      purchaseOrderId,
      organisationId,
    );

    if (!purchaseOrder) {
      return;
    }

    if (
      purchaseOrder.status === PurchaseOrderStatus.CANCELLED ||
      purchaseOrder.status === PurchaseOrderStatus.DRAFT
    ) {
      return;
    }

    const cumulativeItems =
      await this.goodsReceiptRepository.getCumulativeReceivedByPurchaseOrder(
        purchaseOrderId,
      );
    const receivedByItem = this.buildCumulativeMap(cumulativeItems);

    const allFullyReceived = purchaseOrder.items.every((item) => {
      const received = receivedByItem.get(item.id) ?? 0;

      return received >= item.quantity;
    });
    const anyReceived = purchaseOrder.items.some((item) => {
      const received = receivedByItem.get(item.id) ?? 0;

      return received > 0;
    });

    let nextStatus = purchaseOrder.status;

    if (allFullyReceived) {
      nextStatus = PurchaseOrderStatus.COMPLETED;
    } else if (anyReceived) {
      nextStatus = PurchaseOrderStatus.PARTIALLY_DELIVERED;
    }

    if (nextStatus !== purchaseOrder.status) {
      await this.purchaseOrderRepository.updateStatus(
        purchaseOrderId,
        nextStatus,
      );
    }
  }

  private async generateReceiptNumber(organisationId: string) {
    const count =
      await this.goodsReceiptRepository.countByOrganisation(organisationId);
    const year = new Date().getFullYear();

    return `GRN-${year}-${String(count + 1).padStart(6, '0')}`;
  }

  private resolvePagination(query: ListGoodsReceiptQueryDto) {
    return {
      page: query.page ?? 1,
      limit: query.limit ?? 20,
    };
  }

  private buildPaginatedResponse(
    goodsReceipts: GoodsReceiptWithRelations[],
    total: number,
    pagination: { page: number; limit: number },
  ) {
    return {
      goodsReceipts: goodsReceipts.map((receipt) =>
        this.mapGoodsReceipt(receipt),
      ),
      page: pagination.page,
      limit: pagination.limit,
      total,
      totalPages: Math.ceil(total / pagination.limit) || 0,
    };
  }

  private mapGoodsReceipt(goodsReceipt: GoodsReceiptWithRelations) {
    return {
      id: goodsReceipt.id,
      receiptNumber: goodsReceipt.receiptNumber,
      purchaseOrderId: goodsReceipt.purchaseOrderId,
      organisationId: goodsReceipt.organisationId,
      receivedBy: goodsReceipt.receivedBy,
      receiptDate: goodsReceipt.receiptDate.toISOString(),
      warehouse: goodsReceipt.warehouse,
      notes: goodsReceipt.notes,
      status: goodsReceipt.status,
      items: goodsReceipt.items.map((item) => ({
        id: item.id,
        purchaseOrderItemId: item.purchaseOrderItemId,
        quantityOrdered: item.quantityOrdered,
        quantityReceived: item.quantityReceived,
        quantityRejected: item.quantityRejected,
        remarks: item.remarks,
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
      })),
      createdAt: goodsReceipt.createdAt.toISOString(),
      updatedAt: goodsReceipt.updatedAt.toISOString(),
    };
  }
}
