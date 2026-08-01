import { Injectable } from '@nestjs/common';
import { Prisma, PurchaseOrderStatus } from '@prisma/client';

import { PrismaService } from '../database/prisma.service';

export const purchaseOrderInclude = {
  vendor: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
  issuedBy: {
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
    },
  },
  items: { orderBy: { createdAt: 'asc' as const } },
} satisfies Prisma.PurchaseOrderInclude;

export type PurchaseOrderWithRelations = Prisma.PurchaseOrderGetPayload<{
  include: typeof purchaseOrderInclude;
}>;

export type PurchaseOrderFilterInput = {
  status?: PurchaseOrderStatus;
  vendorId?: string;
};

export type PurchaseOrderPaginationInput = {
  page: number;
  limit: number;
};

@Injectable()
export class PurchaseOrderRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(
    data: Prisma.PurchaseOrderCreateInput,
  ): Promise<PurchaseOrderWithRelations> {
    return this.prisma.purchaseOrder.create({
      data,
      include: purchaseOrderInclude,
    });
  }

  createWithItems(
    purchaseOrderData: Omit<
      Prisma.PurchaseOrderCreateInput,
      'items' | 'totalAmount'
    >,
    items: Array<{
      description: string;
      quantity: number;
      unitPrice: Prisma.Decimal;
      totalPrice: Prisma.Decimal;
    }>,
    totalAmount: Prisma.Decimal,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const purchaseOrder = await tx.purchaseOrder.create({
        data: {
          ...purchaseOrderData,
          totalAmount,
          items: {
            create: items,
          },
        },
        include: purchaseOrderInclude,
      });

      return purchaseOrder;
    });
  }

  findById(
    id: string,
    organisationId: string,
  ): Promise<PurchaseOrderWithRelations | null> {
    return this.prisma.purchaseOrder.findFirst({
      where: { id, organisationId },
      include: purchaseOrderInclude,
    });
  }

  findAll(organisationId: string): Promise<PurchaseOrderWithRelations[]> {
    return this.prisma.purchaseOrder.findMany({
      where: { organisationId },
      include: purchaseOrderInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  update(
    id: string,
    data: Prisma.PurchaseOrderUpdateInput,
  ): Promise<PurchaseOrderWithRelations> {
    return this.prisma.purchaseOrder.update({
      where: { id },
      data,
      include: purchaseOrderInclude,
    });
  }

  delete(id: string) {
    return this.prisma.purchaseOrder.delete({ where: { id } });
  }

  issue(
    id: string,
    issueDate: Date,
    notes?: string,
  ): Promise<PurchaseOrderWithRelations> {
    return this.prisma.purchaseOrder.update({
      where: { id },
      data: {
        status: PurchaseOrderStatus.ISSUED,
        issueDate,
        ...(notes !== undefined ? { notes } : {}),
      },
      include: purchaseOrderInclude,
    });
  }

  acknowledge(id: string, notes?: string): Promise<PurchaseOrderWithRelations> {
    return this.prisma.purchaseOrder.update({
      where: { id },
      data: {
        status: PurchaseOrderStatus.ACKNOWLEDGED,
        ...(notes !== undefined ? { notes } : {}),
      },
      include: purchaseOrderInclude,
    });
  }

  cancel(id: string): Promise<PurchaseOrderWithRelations> {
    return this.prisma.purchaseOrder.update({
      where: { id },
      data: { status: PurchaseOrderStatus.CANCELLED },
      include: purchaseOrderInclude,
    });
  }

  findByVendor(vendorId: string, organisationId: string) {
    return this.prisma.purchaseOrder.findMany({
      where: { vendorId, organisationId },
      include: purchaseOrderInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  findByOrganisation(organisationId: string) {
    return this.findAll(organisationId);
  }

  countByOrganisation(organisationId: string) {
    return this.prisma.purchaseOrder.count({
      where: { organisationId },
    });
  }

  findActiveByAward(awardId: string) {
    return this.prisma.purchaseOrder.findFirst({
      where: {
        awardId,
        status: { not: PurchaseOrderStatus.CANCELLED },
      },
    });
  }

  paginate(
    organisationId: string,
    filters: PurchaseOrderFilterInput,
    pagination: PurchaseOrderPaginationInput,
  ) {
    const where = this.buildWhereClause(organisationId, filters);

    return this.executePaginate(where, pagination);
  }

  search(
    organisationId: string,
    query: string,
    filters: PurchaseOrderFilterInput,
    pagination: PurchaseOrderPaginationInput,
  ) {
    const where = this.buildWhereClause(organisationId, filters, query);

    return this.executePaginate(where, pagination);
  }

  private executePaginate(
    where: Prisma.PurchaseOrderWhereInput,
    pagination: PurchaseOrderPaginationInput,
  ) {
    const skip = (pagination.page - 1) * pagination.limit;

    return Promise.all([
      this.prisma.purchaseOrder.findMany({
        where,
        skip,
        take: pagination.limit,
        orderBy: { createdAt: 'desc' },
        include: purchaseOrderInclude,
      }),
      this.prisma.purchaseOrder.count({ where }),
    ]);
  }

  private buildWhereClause(
    organisationId: string,
    filters: PurchaseOrderFilterInput,
    query?: string,
  ): Prisma.PurchaseOrderWhereInput {
    const where: Prisma.PurchaseOrderWhereInput = { organisationId };

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.vendorId) {
      where.vendorId = filters.vendorId;
    }

    if (query) {
      where.OR = [
        { poNumber: { contains: query, mode: 'insensitive' } },
        { notes: { contains: query, mode: 'insensitive' } },
        { vendor: { name: { contains: query, mode: 'insensitive' } } },
      ];
    }

    return where;
  }
}
