import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  GoodsReceiptStatus,
  InvoiceStatus,
  MatchStatus,
  PurchaseOrderStatus,
  Role,
} from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

import { GoodsReceiptRepository } from '../goods-receipts/goods-receipt.repository';
import { PurchaseOrderRepository } from '../purchase-orders/purchase-order.repository';
import { VendorRepository } from '../vendors/vendor.repository';
import {
  INVOICE_APPROVE_ROLES,
  INVOICE_CREATE_ROLES,
  INVOICE_PAY_ROLES,
  INVOICE_VIEW_ROLES,
} from './constants/invoice-role.constants';
import { ApproveInvoiceDto } from './dto/approve-invoice.dto';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { CreateInvoiceItemDto } from './dto/create-invoice-item.dto';
import { ListInvoiceQueryDto } from './dto/list-invoice-query.dto';
import { MarkPaidDto } from './dto/mark-paid.dto';
import { RejectInvoiceDto } from './dto/reject-invoice.dto';
import { SubmitInvoiceDto } from './dto/submit-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import {
  InvoiceItemInput,
  InvoiceRepository,
  InvoiceWithRelations,
} from './invoice.repository';

const ELIGIBLE_PO_STATUSES: PurchaseOrderStatus[] = [
  PurchaseOrderStatus.ISSUED,
  PurchaseOrderStatus.ACKNOWLEDGED,
  PurchaseOrderStatus.PARTIALLY_DELIVERED,
  PurchaseOrderStatus.COMPLETED,
];

const ELIGIBLE_GRN_STATUSES: GoodsReceiptStatus[] = [
  GoodsReceiptStatus.RECEIVED,
  GoodsReceiptStatus.PARTIALLY_RECEIVED,
  GoodsReceiptStatus.COMPLETED,
];

const READ_ONLY_STATUSES: InvoiceStatus[] = [
  InvoiceStatus.REJECTED,
  InvoiceStatus.PAID,
];

type Discrepancy = Record<string, unknown>;

@Injectable()
export class InvoicesService {
  constructor(
    private readonly invoiceRepository: InvoiceRepository,
    private readonly purchaseOrderRepository: PurchaseOrderRepository,
    private readonly goodsReceiptRepository: GoodsReceiptRepository,
    private readonly vendorRepository: VendorRepository,
  ) {}

  async create(
    organisationId: string,
    userEmail: string,
    userRole: Role,
    dto: CreateInvoiceDto,
  ) {
    this.assertCanCreate(userRole);

    const vendor = await this.vendorRepository.findById(
      dto.vendorId,
      organisationId,
    );

    if (!vendor) {
      throw new NotFoundException('Vendor not found');
    }

    this.assertVendorAccess(userEmail, userRole, vendor.email);

    const purchaseOrder = await this.purchaseOrderRepository.findById(
      dto.purchaseOrderId,
      organisationId,
    );

    if (!purchaseOrder) {
      throw new NotFoundException('Purchase order not found');
    }

    if (purchaseOrder.vendorId !== dto.vendorId) {
      throw new BadRequestException(
        'Invoice vendor must match the purchase order vendor',
      );
    }

    if (!ELIGIBLE_PO_STATUSES.includes(purchaseOrder.status)) {
      throw new BadRequestException(
        'Invoices can only be created for active purchase orders',
      );
    }

    const goodsReceipt = await this.goodsReceiptRepository.findById(
      dto.goodsReceiptId,
      organisationId,
    );

    if (!goodsReceipt) {
      throw new NotFoundException('Goods receipt not found');
    }

    if (goodsReceipt.purchaseOrderId !== dto.purchaseOrderId) {
      throw new BadRequestException(
        'Goods receipt must belong to the referenced purchase order',
      );
    }

    if (!ELIGIBLE_GRN_STATUSES.includes(goodsReceipt.status)) {
      throw new BadRequestException(
        'Goods receipt must be received before invoicing',
      );
    }

    const items = this.buildInvoiceItems(dto.items, purchaseOrder.items);
    const subtotal = this.calculateItemsSubtotal(items);
    const taxAmount = new Decimal(dto.taxAmount.toFixed(2));
    const totalAmount = new Decimal(
      (dto.taxAmount + Number(subtotal)).toFixed(2),
    );

    this.assertAmountsValid(
      dto.subtotal,
      dto.taxAmount,
      items,
      subtotal,
      totalAmount,
    );

    const invoiceNumber = await this.generateInvoiceNumber(organisationId);

    const invoice = await this.invoiceRepository.createWithItems(
      {
        invoiceNumber,
        status: InvoiceStatus.DRAFT,
        invoiceDate: new Date(dto.invoiceDate),
        dueDate: new Date(dto.dueDate),
        taxAmount,
        currency: dto.currency ?? purchaseOrder.currency,
        paymentTerms: dto.paymentTerms ?? purchaseOrder.paymentTerms,
        notes: dto.notes,
        organisation: { connect: { id: organisationId } },
        vendor: { connect: { id: dto.vendorId } },
        purchaseOrder: { connect: { id: dto.purchaseOrderId } },
        goodsReceipt: { connect: { id: dto.goodsReceiptId } },
      },
      items,
      subtotal,
      totalAmount,
    );

    return this.mapInvoice(invoice);
  }

  async findAll(
    organisationId: string,
    userEmail: string,
    userRole: Role,
    query: ListInvoiceQueryDto,
  ) {
    const pagination = this.resolvePagination(query);
    const filters = {
      status: query.status,
      vendorId: query.vendorId,
    };
    const searchTerm = query.search?.trim();

    const [invoices, total] = searchTerm
      ? await this.invoiceRepository.search(
          organisationId,
          searchTerm,
          filters,
          pagination,
        )
      : await this.invoiceRepository.paginate(
          organisationId,
          filters,
          pagination,
        );

    const filtered = invoices.filter((invoice) =>
      this.canViewInvoice(userEmail, userRole, invoice.vendor.email),
    );

    return this.buildPaginatedResponse(filtered, total, pagination);
  }

  async findOne(
    organisationId: string,
    userEmail: string,
    userRole: Role,
    id: string,
  ) {
    const invoice = await this.getInvoiceOrThrow(organisationId, id);

    this.assertCanViewInvoice(userEmail, userRole, invoice);

    return this.mapInvoice(invoice);
  }

  async update(
    organisationId: string,
    userEmail: string,
    userRole: Role,
    id: string,
    dto: UpdateInvoiceDto,
  ) {
    this.assertCanCreate(userRole);

    const invoice = await this.getInvoiceOrThrow(organisationId, id);

    this.assertCanViewInvoice(userEmail, userRole, invoice);
    this.assertEditable(invoice);

    if (invoice.status !== InvoiceStatus.DRAFT) {
      throw new BadRequestException('Only draft invoices can be updated');
    }

    let items = invoice.items;
    let subtotal = invoice.subtotal;
    let totalAmount = invoice.totalAmount;

    if (dto.items) {
      const purchaseOrder = await this.purchaseOrderRepository.findById(
        invoice.purchaseOrderId,
        organisationId,
      );

      if (!purchaseOrder) {
        throw new NotFoundException('Purchase order not found');
      }

      const builtItems = this.buildInvoiceItems(dto.items, purchaseOrder.items);
      subtotal = this.calculateItemsSubtotal(builtItems);
      items = builtItems as unknown as typeof invoice.items;
    }

    const taxAmount =
      dto.taxAmount !== undefined
        ? new Decimal(dto.taxAmount.toFixed(2))
        : invoice.taxAmount;
    totalAmount = new Decimal(
      (Number(taxAmount) + Number(subtotal)).toFixed(2),
    );

    if (dto.subtotal !== undefined) {
      this.assertAmountsValid(
        dto.subtotal,
        Number(taxAmount),
        items as unknown as InvoiceItemInput[],
        subtotal,
        totalAmount,
      );
    }

    const updated = dto.items
      ? await this.invoiceRepository.replaceItems(
          id,
          {
            ...(dto.invoiceDate !== undefined
              ? { invoiceDate: new Date(dto.invoiceDate) }
              : {}),
            ...(dto.dueDate !== undefined
              ? { dueDate: new Date(dto.dueDate) }
              : {}),
            taxAmount,
            ...(dto.paymentTerms !== undefined
              ? { paymentTerms: dto.paymentTerms }
              : {}),
            ...(dto.notes !== undefined ? { notes: dto.notes } : {}),
          },
          items as unknown as InvoiceItemInput[],
          subtotal,
          totalAmount,
        )
      : await this.invoiceRepository.update(id, {
          ...(dto.invoiceDate !== undefined
            ? { invoiceDate: new Date(dto.invoiceDate) }
            : {}),
          ...(dto.dueDate !== undefined
            ? { dueDate: new Date(dto.dueDate) }
            : {}),
          ...(dto.subtotal !== undefined ? { subtotal } : {}),
          taxAmount,
          totalAmount,
          ...(dto.paymentTerms !== undefined
            ? { paymentTerms: dto.paymentTerms }
            : {}),
          ...(dto.notes !== undefined ? { notes: dto.notes } : {}),
        });

    return this.mapInvoice(updated);
  }

  async delete(
    organisationId: string,
    userEmail: string,
    userRole: Role,
    id: string,
  ) {
    this.assertCanCreate(userRole);

    const invoice = await this.getInvoiceOrThrow(organisationId, id);

    this.assertCanViewInvoice(userEmail, userRole, invoice);

    if (invoice.status !== InvoiceStatus.DRAFT) {
      throw new BadRequestException('Only draft invoices can be deleted');
    }

    await this.invoiceRepository.delete(id);

    return { message: 'Invoice deleted successfully' };
  }

  async submit(
    organisationId: string,
    userEmail: string,
    userRole: Role,
    id: string,
    dto: SubmitInvoiceDto,
  ) {
    this.assertCanCreate(userRole);

    const invoice = await this.getInvoiceOrThrow(organisationId, id);

    this.assertCanViewInvoice(userEmail, userRole, invoice);

    if (invoice.status !== InvoiceStatus.DRAFT) {
      throw new BadRequestException('Only draft invoices can be submitted');
    }

    this.assertInvoiceItemsTotal(invoice);

    const submitted = await this.invoiceRepository.submit(id, dto.notes);

    return this.mapInvoice(submitted);
  }

  async match(
    organisationId: string,
    userRole: Role,
    userId: string,
    id: string,
  ) {
    if (!INVOICE_APPROVE_ROLES.includes(userRole)) {
      throw new ForbiddenException(
        'Insufficient permissions to run three-way matching',
      );
    }

    const invoice = await this.getInvoiceOrThrow(organisationId, id);

    if (invoice.status !== InvoiceStatus.SUBMITTED) {
      throw new BadRequestException('Only submitted invoices can be matched');
    }

    const result = await this.runThreeWayMatch(invoice, organisationId, userId);

    return result;
  }

  async approve(
    organisationId: string,
    userRole: Role,
    id: string,
    dto: ApproveInvoiceDto,
  ) {
    if (!INVOICE_APPROVE_ROLES.includes(userRole)) {
      throw new ForbiddenException(
        'Insufficient permissions to approve invoices',
      );
    }

    const invoice = await this.getInvoiceOrThrow(organisationId, id);

    if (invoice.status !== InvoiceStatus.MATCHED) {
      throw new BadRequestException('Only matched invoices can be approved');
    }

    if (invoice.matchingResult?.matchStatus !== MatchStatus.MATCHED) {
      throw new BadRequestException(
        'Invoice must pass three-way matching before approval',
      );
    }

    const approved = await this.invoiceRepository.approve(id, dto.notes);

    return this.mapInvoice(approved);
  }

  async reject(
    organisationId: string,
    userRole: Role,
    id: string,
    dto: RejectInvoiceDto,
  ) {
    if (!INVOICE_APPROVE_ROLES.includes(userRole)) {
      throw new ForbiddenException(
        'Insufficient permissions to reject invoices',
      );
    }

    const invoice = await this.getInvoiceOrThrow(organisationId, id);

    if (
      invoice.status !== InvoiceStatus.SUBMITTED &&
      invoice.status !== InvoiceStatus.MATCHED
    ) {
      throw new BadRequestException(
        'Only submitted or matched invoices can be rejected',
      );
    }

    const rejected = await this.invoiceRepository.reject(id, dto.reason);

    return this.mapInvoice(rejected);
  }

  async markPaid(
    organisationId: string,
    userRole: Role,
    id: string,
    dto: MarkPaidDto,
  ) {
    if (!INVOICE_PAY_ROLES.includes(userRole)) {
      throw new ForbiddenException(
        'Insufficient permissions to mark invoices as paid',
      );
    }

    const invoice = await this.getInvoiceOrThrow(organisationId, id);

    if (invoice.status !== InvoiceStatus.APPROVED) {
      throw new BadRequestException(
        'Only approved invoices can be marked as paid',
      );
    }

    void dto;

    const paid = await this.invoiceRepository.markPaid(id);

    return this.mapInvoice(paid);
  }

  async getMatchingResult(
    organisationId: string,
    userRole: Role,
    invoiceId: string,
  ) {
    if (!INVOICE_VIEW_ROLES.includes(userRole)) {
      throw new ForbiddenException(
        'Insufficient permissions to view matching results',
      );
    }

    const invoice = await this.getInvoiceOrThrow(organisationId, invoiceId);

    const matchingResult =
      invoice.matchingResult ??
      (await this.invoiceRepository.findMatchingResult(
        invoiceId,
        organisationId,
      ));

    if (!matchingResult) {
      throw new NotFoundException('Matching result not found');
    }

    return this.mapMatchingResult(matchingResult);
  }

  private async runThreeWayMatch(
    invoice: InvoiceWithRelations,
    organisationId: string,
    userId: string,
  ) {
    const purchaseOrder = await this.purchaseOrderRepository.findById(
      invoice.purchaseOrderId,
      organisationId,
    );

    if (!purchaseOrder) {
      const matchingResult = await this.invoiceRepository.upsertMatchingResult(
        invoice.id,
        invoice.purchaseOrderId,
        invoice.goodsReceiptId,
        userId,
        MatchStatus.MISSING_PO,
        [{ field: 'purchaseOrder', message: 'Purchase order not found' }],
      );

      return {
        invoice: this.mapInvoice(invoice),
        matchingResult: this.mapMatchingResult(matchingResult),
      };
    }

    const goodsReceipt = await this.goodsReceiptRepository.findById(
      invoice.goodsReceiptId,
      organisationId,
    );

    if (!goodsReceipt) {
      const matchingResult = await this.invoiceRepository.upsertMatchingResult(
        invoice.id,
        invoice.purchaseOrderId,
        invoice.goodsReceiptId,
        userId,
        MatchStatus.MISSING_GRN,
        [{ field: 'goodsReceipt', message: 'Goods receipt not found' }],
      );

      return {
        invoice: this.mapInvoice(invoice),
        matchingResult: this.mapMatchingResult(matchingResult),
      };
    }

    const discrepancies: Discrepancy[] = [];
    let hasPriceMismatch = false;
    let hasQuantityMismatch = false;

    const poItemMap = new Map(
      purchaseOrder.items.map((item) => [item.id, item]),
    );
    const grnItemMap = new Map(
      goodsReceipt.items.map((item) => [item.purchaseOrderItemId, item]),
    );

    for (const invoiceItem of invoice.items) {
      const poItem = poItemMap.get(invoiceItem.purchaseOrderItemId);
      const grnItem = grnItemMap.get(invoiceItem.purchaseOrderItemId);

      if (!poItem) {
        discrepancies.push({
          field: 'purchaseOrderItem',
          purchaseOrderItemId: invoiceItem.purchaseOrderItemId,
          message: 'Purchase order line item not found',
        });
        continue;
      }

      if (!grnItem) {
        discrepancies.push({
          field: 'goodsReceiptItem',
          purchaseOrderItemId: invoiceItem.purchaseOrderItemId,
          message: 'Goods receipt line item not found',
        });
        hasQuantityMismatch = true;
        continue;
      }

      const poUnitPrice = this.decimalToNumber(poItem.unitPrice);
      const invoiceUnitPrice = this.decimalToNumber(invoiceItem.unitPrice);

      if (poUnitPrice !== invoiceUnitPrice) {
        hasPriceMismatch = true;
        discrepancies.push({
          field: 'unitPrice',
          purchaseOrderItemId: invoiceItem.purchaseOrderItemId,
          expected: poUnitPrice,
          actual: invoiceUnitPrice,
          message: 'Unit price does not match purchase order',
        });
      }

      if (invoiceItem.quantity !== grnItem.quantityReceived) {
        hasQuantityMismatch = true;
        discrepancies.push({
          field: 'quantity',
          purchaseOrderItemId: invoiceItem.purchaseOrderItemId,
          expected: grnItem.quantityReceived,
          actual: invoiceItem.quantity,
          message: 'Invoice quantity does not match goods receipt',
        });
      }

      const invoiceLineTotal = this.decimalToNumber(invoiceItem.totalPrice);
      const expectedLineTotal = Number(
        (invoiceItem.quantity * poUnitPrice).toFixed(2),
      );

      if (invoiceLineTotal !== expectedLineTotal) {
        hasPriceMismatch = true;
        discrepancies.push({
          field: 'lineTotal',
          purchaseOrderItemId: invoiceItem.purchaseOrderItemId,
          expected: expectedLineTotal,
          actual: invoiceLineTotal,
          message: 'Line total does not match quantity × unit price',
        });
      }
    }

    const invoiceSubtotal = this.decimalToNumber(invoice.subtotal);
    const poTotal = this.decimalToNumber(purchaseOrder.totalAmount);

    if (invoiceSubtotal !== poTotal) {
      hasPriceMismatch = true;
      discrepancies.push({
        field: 'subtotal',
        expected: poTotal,
        actual: invoiceSubtotal,
        message: 'Invoice subtotal does not match purchase order total',
      });
    }

    const grnReceivedTotal = goodsReceipt.items.reduce((sum, item) => {
      const poItem = poItemMap.get(item.purchaseOrderItemId);

      if (!poItem) {
        return sum;
      }

      return (
        sum +
        Number(
          (
            item.quantityReceived * this.decimalToNumber(poItem.unitPrice)
          ).toFixed(2),
        )
      );
    }, 0);

    if (invoiceSubtotal !== grnReceivedTotal) {
      hasPriceMismatch = true;
      discrepancies.push({
        field: 'grnValue',
        expected: grnReceivedTotal,
        actual: invoiceSubtotal,
        message: 'Invoice subtotal does not match received goods value',
      });
    }

    let matchStatus: MatchStatus;

    if (discrepancies.length === 0) {
      matchStatus = MatchStatus.MATCHED;
    } else if (hasQuantityMismatch) {
      matchStatus = MatchStatus.QUANTITY_MISMATCH;
    } else if (hasPriceMismatch) {
      matchStatus = MatchStatus.PRICE_MISMATCH;
    } else {
      matchStatus = MatchStatus.FAILED;
    }

    const matchingResult = await this.invoiceRepository.upsertMatchingResult(
      invoice.id,
      invoice.purchaseOrderId,
      invoice.goodsReceiptId,
      userId,
      matchStatus,
      discrepancies.length ? discrepancies : null,
    );

    let updatedInvoice = invoice;

    if (matchStatus === MatchStatus.MATCHED) {
      updatedInvoice = await this.invoiceRepository.setMatchedStatus(
        invoice.id,
      );
    } else {
      updatedInvoice =
        (await this.invoiceRepository.findById(invoice.id, organisationId)) ??
        invoice;
    }

    return {
      invoice: this.mapInvoice(updatedInvoice),
      matchingResult: this.mapMatchingResult(matchingResult),
    };
  }

  private buildInvoiceItems(
    dtoItems: CreateInvoiceItemDto[],
    poItems: Array<{ id: string }>,
  ): InvoiceItemInput[] {
    const poItemIds = new Set(poItems.map((item) => item.id));

    return dtoItems.map((item) => {
      if (!poItemIds.has(item.purchaseOrderItemId)) {
        throw new BadRequestException(
          `Purchase order item ${item.purchaseOrderItemId} not found on purchase order`,
        );
      }

      const totalPrice = new Decimal(
        (item.quantity * item.unitPrice).toFixed(2),
      );

      return {
        purchaseOrderItemId: item.purchaseOrderItemId,
        description: item.description,
        quantity: item.quantity,
        unitPrice: new Decimal(item.unitPrice.toFixed(2)),
        totalPrice,
      };
    });
  }

  private calculateItemsSubtotal(items: InvoiceItemInput[]): Decimal {
    const total = items.reduce(
      (sum, item) => sum + this.decimalToNumber(item.totalPrice),
      0,
    );

    return new Decimal(total.toFixed(2));
  }

  private assertAmountsValid(
    declaredSubtotal: number,
    taxAmount: number,
    items: InvoiceItemInput[],
    calculatedSubtotal: Decimal,
    totalAmount: Decimal,
  ) {
    const itemsTotal = this.decimalToNumber(calculatedSubtotal);

    if (Number(declaredSubtotal.toFixed(2)) !== itemsTotal) {
      throw new BadRequestException(
        'Invoice subtotal must equal the sum of invoice line items',
      );
    }

    const expectedTotal = Number((itemsTotal + taxAmount).toFixed(2));

    if (this.decimalToNumber(totalAmount) !== expectedTotal) {
      throw new BadRequestException(
        'Invoice total amount must equal subtotal plus tax',
      );
    }

    void items;
  }

  private assertInvoiceItemsTotal(invoice: InvoiceWithRelations) {
    const itemsTotal = invoice.items.reduce(
      (sum, item) => sum + this.decimalToNumber(item.totalPrice),
      0,
    );

    if (this.decimalToNumber(invoice.subtotal) !== itemsTotal) {
      throw new BadRequestException(
        'Invoice subtotal must equal the sum of invoice line items',
      );
    }

    const expectedTotal = Number(
      (itemsTotal + this.decimalToNumber(invoice.taxAmount)).toFixed(2),
    );

    if (this.decimalToNumber(invoice.totalAmount) !== expectedTotal) {
      throw new BadRequestException(
        'Invoice total amount must equal subtotal plus tax',
      );
    }
  }

  private async getInvoiceOrThrow(organisationId: string, id: string) {
    const invoice = await this.invoiceRepository.findById(id, organisationId);

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    return invoice;
  }

  private assertCanCreate(userRole: Role) {
    if (!INVOICE_CREATE_ROLES.includes(userRole)) {
      throw new ForbiddenException(
        'Insufficient permissions to manage invoices',
      );
    }
  }

  private assertCanViewInvoice(
    userEmail: string,
    userRole: Role,
    invoice: InvoiceWithRelations,
  ) {
    if (!this.canViewInvoice(userEmail, userRole, invoice.vendor.email)) {
      throw new ForbiddenException('You cannot view this invoice');
    }
  }

  private canViewInvoice(
    userEmail: string,
    userRole: Role,
    vendorEmail: string,
  ) {
    if (
      userRole === Role.ADMIN ||
      userRole === Role.FINANCE ||
      userRole === Role.PROCUREMENT_MANAGER
    ) {
      return true;
    }

    return userEmail.toLowerCase() === vendorEmail.toLowerCase();
  }

  private assertVendorAccess(
    userEmail: string,
    userRole: Role,
    vendorEmail: string,
  ) {
    if (userRole === Role.ADMIN || userRole === Role.FINANCE) {
      return;
    }

    if (userEmail.toLowerCase() !== vendorEmail.toLowerCase()) {
      throw new ForbiddenException(
        'You can only create invoices for your own vendor account',
      );
    }
  }

  private assertEditable(invoice: InvoiceWithRelations) {
    if (READ_ONLY_STATUSES.includes(invoice.status)) {
      throw new BadRequestException(
        'Rejected or paid invoices cannot be edited',
      );
    }
  }

  private decimalToNumber(value: Decimal): number {
    return Number(value.toFixed(2));
  }

  private async generateInvoiceNumber(organisationId: string) {
    const count =
      await this.invoiceRepository.countByOrganisation(organisationId);
    const year = new Date().getFullYear();

    return `INV-${year}-${String(count + 1).padStart(6, '0')}`;
  }

  private resolvePagination(query: ListInvoiceQueryDto) {
    return {
      page: query.page ?? 1,
      limit: query.limit ?? 20,
    };
  }

  private buildPaginatedResponse(
    invoices: InvoiceWithRelations[],
    total: number,
    pagination: { page: number; limit: number },
  ) {
    return {
      invoices: invoices.map((invoice) => this.mapInvoice(invoice)),
      page: pagination.page,
      limit: pagination.limit,
      total,
      totalPages: Math.ceil(total / pagination.limit) || 0,
    };
  }

  private mapMatchingResult(matchingResult: {
    id: string;
    invoiceId: string;
    purchaseOrderId: string;
    goodsReceiptId: string;
    matchStatus: MatchStatus;
    matchedBy: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      role: Role;
    };
    matchedAt: Date;
    discrepancies: unknown;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      id: matchingResult.id,
      invoiceId: matchingResult.invoiceId,
      purchaseOrderId: matchingResult.purchaseOrderId,
      goodsReceiptId: matchingResult.goodsReceiptId,
      matchStatus: matchingResult.matchStatus,
      matchedBy: matchingResult.matchedBy,
      matchedAt: matchingResult.matchedAt.toISOString(),
      discrepancies: matchingResult.discrepancies as
        | Record<string, unknown>[]
        | null,
      createdAt: matchingResult.createdAt.toISOString(),
      updatedAt: matchingResult.updatedAt.toISOString(),
    };
  }

  private mapInvoice(invoice: InvoiceWithRelations) {
    return {
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      vendor: invoice.vendor,
      purchaseOrderId: invoice.purchaseOrderId,
      goodsReceiptId: invoice.goodsReceiptId,
      organisationId: invoice.organisationId,
      invoiceDate: invoice.invoiceDate.toISOString(),
      dueDate: invoice.dueDate.toISOString(),
      subtotal: this.decimalToNumber(invoice.subtotal),
      taxAmount: this.decimalToNumber(invoice.taxAmount),
      totalAmount: this.decimalToNumber(invoice.totalAmount),
      currency: invoice.currency,
      paymentTerms: invoice.paymentTerms,
      status: invoice.status,
      notes: invoice.notes,
      items: invoice.items.map((item) => ({
        id: item.id,
        purchaseOrderItemId: item.purchaseOrderItemId,
        description: item.description,
        quantity: item.quantity,
        unitPrice: this.decimalToNumber(item.unitPrice),
        totalPrice: this.decimalToNumber(item.totalPrice),
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
      })),
      matchingResult: invoice.matchingResult
        ? this.mapMatchingResult(invoice.matchingResult)
        : null,
      createdAt: invoice.createdAt.toISOString(),
      updatedAt: invoice.updatedAt.toISOString(),
    };
  }
}
