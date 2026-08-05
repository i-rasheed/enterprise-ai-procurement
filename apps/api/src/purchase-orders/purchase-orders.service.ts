import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BidStatus, PurchaseOrderStatus, Role } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

import { EvaluationRepository } from '../bid-evaluations/evaluation.repository';
import { VendorRepository } from '../vendors/vendor.repository';
import {
  PO_MANAGEMENT_ROLES,
  PO_VIEW_ROLES,
} from './constants/po-role.constants';
import { AcknowledgePurchaseOrderDto } from './dto/acknowledge-purchase-order.dto';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { IssuePurchaseOrderDto } from './dto/issue-purchase-order.dto';
import { ListPurchaseOrderQueryDto } from './dto/list-purchase-order-query.dto';
import { UpdatePurchaseOrderDto } from './dto/update-purchase-order.dto';
import {
  PurchaseOrderRepository,
  PurchaseOrderWithRelations,
} from './purchase-order.repository';

const READ_ONLY_STATUSES: PurchaseOrderStatus[] = [
  PurchaseOrderStatus.ISSUED,
  PurchaseOrderStatus.ACKNOWLEDGED,
  PurchaseOrderStatus.PARTIALLY_DELIVERED,
  PurchaseOrderStatus.COMPLETED,
];

@Injectable()
export class PurchaseOrdersService {
  constructor(
    private readonly purchaseOrderRepository: PurchaseOrderRepository,
    private readonly evaluationRepository: EvaluationRepository,
    private readonly vendorRepository: VendorRepository,
  ) {}

  async create(
    organisationId: string,
    userId: string,
    dto: CreatePurchaseOrderDto,
  ) {
    const award = await this.evaluationRepository.findAwardWithBidItems(
      dto.awardId,
      organisationId,
    );

    if (!award) {
      throw new NotFoundException('Award not found');
    }

    if (award.bid.status !== BidStatus.AWARDED) {
      throw new BadRequestException(
        'Purchase orders can only be generated from awarded bids',
      );
    }

    if (!award.bid.items.length) {
      throw new BadRequestException(
        'Awarded bid must contain at least one line item',
      );
    }

    const existingActive = await this.purchaseOrderRepository.findActiveByAward(
      dto.awardId,
    );

    if (existingActive) {
      throw new ConflictException(
        'An active purchase order already exists for this award',
      );
    }

    const items = award.bid.items.map((item) => ({
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice,
    }));

    const totalAmount = this.calculateItemsTotal(items);
    const poNumber = await this.generatePoNumber(organisationId);

    const purchaseOrder = await this.purchaseOrderRepository.createWithItems(
      {
        poNumber,
        status: PurchaseOrderStatus.DRAFT,
        currency: award.bid.currency,
        paymentTerms: award.bid.paymentTerms,
        deliveryAddress: dto.deliveryAddress,
        notes: dto.notes,
        expectedDeliveryDate: new Date(dto.expectedDeliveryDate),
        organisation: { connect: { id: organisationId } },
        vendor: { connect: { id: award.bid.vendorId } },
        award: { connect: { id: award.id } },
        procurementRequest: {
          connect: { id: award.procurementRequestId },
        },
        issuedBy: { connect: { id: userId } },
      },
      items,
      new Decimal(totalAmount.toFixed(2)),
    );

    this.assertTotalMatchesItems(purchaseOrder);

    return this.mapPurchaseOrder(purchaseOrder);
  }

  async findAll(
    organisationId: string,
    userRole: Role,
    query: ListPurchaseOrderQueryDto,
  ) {
    this.assertCanViewAll(userRole);

    const pagination = this.resolvePagination(query);
    const filters = {
      status: query.status,
      vendorId: query.vendorId,
    };
    const searchTerm = query.search?.trim();

    const [purchaseOrders, total] = searchTerm
      ? await this.purchaseOrderRepository.search(
          organisationId,
          searchTerm,
          filters,
          pagination,
        )
      : await this.purchaseOrderRepository.paginate(
          organisationId,
          filters,
          pagination,
        );

    return this.buildPaginatedResponse(purchaseOrders, total, pagination);
  }

  async findOne(
    organisationId: string,
    userEmail: string,
    userRole: Role,
    id: string,
  ) {
    const purchaseOrder = await this.getPurchaseOrderOrThrow(
      organisationId,
      id,
    );

    this.assertCanViewPurchaseOrder(userEmail, userRole, purchaseOrder);

    return this.mapPurchaseOrder(purchaseOrder);
  }

  async update(
    organisationId: string,
    userRole: Role,
    id: string,
    dto: UpdatePurchaseOrderDto,
  ) {
    this.assertCanManage(userRole);

    const purchaseOrder = await this.getPurchaseOrderOrThrow(
      organisationId,
      id,
    );

    this.assertEditable(purchaseOrder);

    const updated = await this.purchaseOrderRepository.update(id, {
      ...(dto.expectedDeliveryDate !== undefined
        ? { expectedDeliveryDate: new Date(dto.expectedDeliveryDate) }
        : {}),
      ...(dto.paymentTerms !== undefined
        ? { paymentTerms: dto.paymentTerms }
        : {}),
      ...(dto.deliveryAddress !== undefined
        ? { deliveryAddress: dto.deliveryAddress }
        : {}),
      ...(dto.notes !== undefined ? { notes: dto.notes } : {}),
    });

    this.assertTotalMatchesItems(updated);

    return this.mapPurchaseOrder(updated);
  }

  async delete(organisationId: string, userRole: Role, id: string) {
    this.assertCanManage(userRole);

    const purchaseOrder = await this.getPurchaseOrderOrThrow(
      organisationId,
      id,
    );

    if (purchaseOrder.status !== PurchaseOrderStatus.DRAFT) {
      throw new BadRequestException(
        'Only draft purchase orders can be deleted',
      );
    }

    await this.purchaseOrderRepository.delete(id);

    return { message: 'Purchase order deleted successfully' };
  }

  async issue(
    organisationId: string,
    userRole: Role,
    id: string,
    dto: IssuePurchaseOrderDto,
  ) {
    this.assertCanManage(userRole);

    const purchaseOrder = await this.getPurchaseOrderOrThrow(
      organisationId,
      id,
    );

    if (purchaseOrder.status !== PurchaseOrderStatus.DRAFT) {
      throw new BadRequestException('Only draft purchase orders can be issued');
    }

    this.assertTotalMatchesItems(purchaseOrder);

    const issueDate = dto.issueDate ? new Date(dto.issueDate) : new Date();

    const issued = await this.purchaseOrderRepository.issue(
      id,
      issueDate,
      dto.notes,
    );

    return this.mapPurchaseOrder(issued);
  }

  async acknowledge(
    organisationId: string,
    userEmail: string,
    id: string,
    dto: AcknowledgePurchaseOrderDto,
  ) {
    const purchaseOrder = await this.getPurchaseOrderOrThrow(
      organisationId,
      id,
    );

    this.assertVendorRepresentative(userEmail, purchaseOrder.vendor.email);

    if (purchaseOrder.status !== PurchaseOrderStatus.ISSUED) {
      throw new BadRequestException(
        'Only issued purchase orders can be acknowledged',
      );
    }

    const acknowledged = await this.purchaseOrderRepository.acknowledge(
      id,
      dto.notes,
    );

    return this.mapPurchaseOrder(acknowledged);
  }

  async cancel(organisationId: string, userRole: Role, id: string) {
    this.assertCanManage(userRole);

    const purchaseOrder = await this.getPurchaseOrderOrThrow(
      organisationId,
      id,
    );

    if (purchaseOrder.status === PurchaseOrderStatus.CANCELLED) {
      throw new BadRequestException('Purchase order is already cancelled');
    }

    if (purchaseOrder.status === PurchaseOrderStatus.COMPLETED) {
      throw new BadRequestException(
        'Completed purchase orders cannot be cancelled',
      );
    }

    const cancelled = await this.purchaseOrderRepository.cancel(id);

    return { purchaseOrder: this.mapPurchaseOrder(cancelled) };
  }

  async findByVendor(
    organisationId: string,
    userEmail: string,
    userRole: Role,
    vendorId: string,
  ) {
    const vendor = await this.vendorRepository.findById(
      vendorId,
      organisationId,
    );

    if (!vendor) {
      throw new NotFoundException('Vendor not found');
    }

    if (!this.canViewVendorPurchaseOrders(userEmail, userRole, vendor.email)) {
      throw new ForbiddenException(
        'You cannot view purchase orders for this vendor',
      );
    }

    const purchaseOrders = await this.purchaseOrderRepository.findByVendor(
      vendorId,
      organisationId,
    );

    return {
      purchaseOrders: purchaseOrders.map((po) => this.mapPurchaseOrder(po)),
    };
  }

  private async getPurchaseOrderOrThrow(organisationId: string, id: string) {
    const purchaseOrder = await this.purchaseOrderRepository.findById(
      id,
      organisationId,
    );

    if (!purchaseOrder) {
      throw new NotFoundException('Purchase order not found');
    }

    return purchaseOrder;
  }

  private assertCanManage(userRole: Role) {
    if (!PO_MANAGEMENT_ROLES.includes(userRole)) {
      throw new ForbiddenException(
        'Insufficient permissions to manage purchase orders',
      );
    }
  }

  private assertCanViewAll(userRole: Role) {
    if (!PO_VIEW_ROLES.includes(userRole)) {
      throw new ForbiddenException(
        'Insufficient permissions to view purchase orders',
      );
    }
  }

  private assertCanViewPurchaseOrder(
    userEmail: string,
    userRole: Role,
    purchaseOrder: PurchaseOrderWithRelations,
  ) {
    if (PO_VIEW_ROLES.includes(userRole)) {
      return;
    }

    this.assertVendorRepresentative(userEmail, purchaseOrder.vendor.email);
  }

  private canViewVendorPurchaseOrders(
    userEmail: string,
    userRole: Role,
    vendorEmail: string,
  ) {
    if (PO_VIEW_ROLES.includes(userRole)) {
      return true;
    }

    return userEmail.toLowerCase() === vendorEmail.toLowerCase();
  }

  private assertVendorRepresentative(userEmail: string, vendorEmail: string) {
    if (userEmail.toLowerCase() !== vendorEmail.toLowerCase()) {
      throw new ForbiddenException(
        'Only the assigned vendor representative can perform this action',
      );
    }
  }

  private assertEditable(purchaseOrder: PurchaseOrderWithRelations) {
    if (purchaseOrder.status === PurchaseOrderStatus.CANCELLED) {
      throw new BadRequestException(
        'Cancelled purchase orders cannot be edited',
      );
    }

    if (READ_ONLY_STATUSES.includes(purchaseOrder.status)) {
      throw new BadRequestException(
        'Issued purchase orders are read-only and cannot be edited',
      );
    }
  }

  private assertTotalMatchesItems(purchaseOrder: PurchaseOrderWithRelations) {
    const itemsTotal = purchaseOrder.items.reduce(
      (sum, item) => sum + this.decimalToNumber(item.totalPrice),
      0,
    );
    const totalAmount = this.decimalToNumber(purchaseOrder.totalAmount);

    if (itemsTotal !== totalAmount) {
      throw new BadRequestException(
        'Purchase order total amount must equal the sum of line items',
      );
    }
  }

  private calculateItemsTotal(items: Array<{ totalPrice: Decimal }>): number {
    return items.reduce(
      (sum, item) => sum + this.decimalToNumber(item.totalPrice),
      0,
    );
  }

  private decimalToNumber(value: Decimal): number {
    return Number(value.toFixed(2));
  }

  private async generatePoNumber(organisationId: string) {
    const count =
      await this.purchaseOrderRepository.countByOrganisation(organisationId);
    const year = new Date().getFullYear();

    return `PO-${year}-${String(count + 1).padStart(6, '0')}`;
  }

  private resolvePagination(query: ListPurchaseOrderQueryDto) {
    return {
      page: query.page ?? 1,
      limit: query.limit ?? 20,
    };
  }

  private buildPaginatedResponse(
    purchaseOrders: PurchaseOrderWithRelations[],
    total: number,
    pagination: { page: number; limit: number },
  ) {
    return {
      purchaseOrders: purchaseOrders.map((po) => this.mapPurchaseOrder(po)),
      page: pagination.page,
      limit: pagination.limit,
      total,
      totalPages: Math.ceil(total / pagination.limit) || 0,
    };
  }

  private mapPurchaseOrder(purchaseOrder: PurchaseOrderWithRelations) {
    return {
      id: purchaseOrder.id,
      poNumber: purchaseOrder.poNumber,
      organisationId: purchaseOrder.organisationId,
      vendor: purchaseOrder.vendor,
      awardId: purchaseOrder.awardId,
      procurementRequestId: purchaseOrder.procurementRequestId,
      issuedBy: purchaseOrder.issuedBy,
      issueDate: purchaseOrder.issueDate?.toISOString() ?? null,
      expectedDeliveryDate: purchaseOrder.expectedDeliveryDate.toISOString(),
      totalAmount: this.decimalToNumber(purchaseOrder.totalAmount),
      currency: purchaseOrder.currency,
      paymentTerms: purchaseOrder.paymentTerms,
      deliveryAddress: purchaseOrder.deliveryAddress,
      notes: purchaseOrder.notes,
      status: purchaseOrder.status,
      items: purchaseOrder.items.map((item) => ({
        id: item.id,
        description: item.description,
        quantity: item.quantity,
        unitPrice: this.decimalToNumber(item.unitPrice),
        totalPrice: this.decimalToNumber(item.totalPrice),
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
      })),
      createdAt: purchaseOrder.createdAt.toISOString(),
      updatedAt: purchaseOrder.updatedAt.toISOString(),
    };
  }
}
