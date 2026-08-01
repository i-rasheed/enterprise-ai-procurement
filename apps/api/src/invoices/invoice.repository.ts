import { Injectable } from '@nestjs/common';
import { InvoiceStatus, MatchStatus, Prisma } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

import { PrismaService } from '../database/prisma.service';

export const invoiceInclude = {
  vendor: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
  items: { orderBy: { createdAt: 'asc' as const } },
  matchingResult: {
    include: {
      matchedBy: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
        },
      },
    },
  },
} satisfies Prisma.InvoiceInclude;

export type InvoiceWithRelations = Prisma.InvoiceGetPayload<{
  include: typeof invoiceInclude;
}>;

export type InvoiceFilterInput = {
  status?: InvoiceStatus;
  vendorId?: string;
};

export type InvoicePaginationInput = {
  page: number;
  limit: number;
};

export type InvoiceItemInput = {
  purchaseOrderItemId: string;
  description: string;
  quantity: number;
  unitPrice: Decimal;
  totalPrice: Decimal;
};

@Injectable()
export class InvoiceRepository {
  constructor(private readonly prisma: PrismaService) {}

  createWithItems(
    invoiceData: Omit<
      Prisma.InvoiceCreateInput,
      'items' | 'subtotal' | 'totalAmount'
    >,
    items: InvoiceItemInput[],
    subtotal: Decimal,
    totalAmount: Decimal,
  ): Promise<InvoiceWithRelations> {
    return this.prisma.invoice.create({
      data: {
        ...invoiceData,
        subtotal,
        totalAmount,
        items: { create: items },
      },
      include: invoiceInclude,
    });
  }

  findById(
    id: string,
    organisationId: string,
  ): Promise<InvoiceWithRelations | null> {
    return this.prisma.invoice.findFirst({
      where: { id, organisationId },
      include: invoiceInclude,
    });
  }

  findAll(organisationId: string): Promise<InvoiceWithRelations[]> {
    return this.prisma.invoice.findMany({
      where: { organisationId },
      include: invoiceInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  update(
    id: string,
    data: Prisma.InvoiceUpdateInput,
  ): Promise<InvoiceWithRelations> {
    return this.prisma.invoice.update({
      where: { id },
      data,
      include: invoiceInclude,
    });
  }

  replaceItems(
    id: string,
    data: Prisma.InvoiceUpdateInput,
    items: InvoiceItemInput[],
    subtotal: Decimal,
    totalAmount: Decimal,
  ): Promise<InvoiceWithRelations> {
    return this.prisma.$transaction(async (tx) => {
      await tx.invoiceItem.deleteMany({ where: { invoiceId: id } });

      return tx.invoice.update({
        where: { id },
        data: {
          ...data,
          subtotal,
          totalAmount,
          items: { create: items },
        },
        include: invoiceInclude,
      });
    });
  }

  delete(id: string) {
    return this.prisma.invoice.delete({ where: { id } });
  }

  submit(id: string, notes?: string): Promise<InvoiceWithRelations> {
    return this.prisma.invoice.update({
      where: { id },
      data: {
        status: InvoiceStatus.SUBMITTED,
        ...(notes !== undefined ? { notes } : {}),
      },
      include: invoiceInclude,
    });
  }

  approve(id: string, notes?: string): Promise<InvoiceWithRelations> {
    return this.prisma.invoice.update({
      where: { id },
      data: {
        status: InvoiceStatus.APPROVED,
        ...(notes !== undefined ? { notes } : {}),
      },
      include: invoiceInclude,
    });
  }

  reject(id: string, reason: string): Promise<InvoiceWithRelations> {
    return this.prisma.invoice.update({
      where: { id },
      data: {
        status: InvoiceStatus.REJECTED,
        notes: reason,
      },
      include: invoiceInclude,
    });
  }

  markPaid(id: string): Promise<InvoiceWithRelations> {
    return this.prisma.invoice.update({
      where: { id },
      data: { status: InvoiceStatus.PAID },
      include: invoiceInclude,
    });
  }

  upsertMatchingResult(
    invoiceId: string,
    purchaseOrderId: string,
    goodsReceiptId: string,
    matchedById: string,
    matchStatus: MatchStatus,
    discrepancies: Record<string, unknown>[] | null,
  ) {
    const jsonDiscrepancies = discrepancies as
      | Prisma.InputJsonValue
      | undefined;

    return this.prisma.matchingResult.upsert({
      where: { invoiceId },
      create: {
        invoiceId,
        purchaseOrderId,
        goodsReceiptId,
        matchedById,
        matchStatus,
        discrepancies: jsonDiscrepancies,
      },
      update: {
        matchStatus,
        matchedById,
        matchedAt: new Date(),
        discrepancies: jsonDiscrepancies,
      },
      include: {
        matchedBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });
  }

  setMatchedStatus(id: string): Promise<InvoiceWithRelations> {
    return this.prisma.invoice.update({
      where: { id },
      data: { status: InvoiceStatus.MATCHED },
      include: invoiceInclude,
    });
  }

  findMatchingResult(invoiceId: string, organisationId: string) {
    return this.prisma.matchingResult.findFirst({
      where: {
        invoiceId,
        invoice: { organisationId },
      },
      include: {
        matchedBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });
  }

  findPending(organisationId: string) {
    return this.prisma.invoice.findMany({
      where: {
        organisationId,
        status: InvoiceStatus.SUBMITTED,
      },
      include: invoiceInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  countByOrganisation(organisationId: string) {
    return this.prisma.invoice.count({
      where: { organisationId },
    });
  }

  paginate(
    organisationId: string,
    filters: InvoiceFilterInput,
    pagination: InvoicePaginationInput,
  ) {
    const where = this.buildWhereClause(organisationId, filters);

    return this.executePaginate(where, pagination);
  }

  search(
    organisationId: string,
    query: string,
    filters: InvoiceFilterInput,
    pagination: InvoicePaginationInput,
  ) {
    const where = this.buildWhereClause(organisationId, filters, query);

    return this.executePaginate(where, pagination);
  }

  private executePaginate(
    where: Prisma.InvoiceWhereInput,
    pagination: InvoicePaginationInput,
  ) {
    const skip = (pagination.page - 1) * pagination.limit;

    return Promise.all([
      this.prisma.invoice.findMany({
        where,
        skip,
        take: pagination.limit,
        orderBy: { createdAt: 'desc' },
        include: invoiceInclude,
      }),
      this.prisma.invoice.count({ where }),
    ]);
  }

  private buildWhereClause(
    organisationId: string,
    filters: InvoiceFilterInput,
    query?: string,
  ): Prisma.InvoiceWhereInput {
    const where: Prisma.InvoiceWhereInput = { organisationId };

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.vendorId) {
      where.vendorId = filters.vendorId;
    }

    if (query) {
      where.OR = [
        { invoiceNumber: { contains: query, mode: 'insensitive' } },
        { notes: { contains: query, mode: 'insensitive' } },
        { vendor: { name: { contains: query, mode: 'insensitive' } } },
      ];
    }

    return where;
  }
}
