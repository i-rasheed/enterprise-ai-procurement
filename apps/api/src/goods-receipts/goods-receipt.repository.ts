import { Injectable } from '@nestjs/common';
import { GoodsReceiptStatus, Prisma } from '@prisma/client';

import { PrismaService } from '../database/prisma.service';

export const goodsReceiptInclude = {
  receivedBy: {
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
    },
  },
  items: { orderBy: { createdAt: 'asc' as const } },
} satisfies Prisma.GoodsReceiptInclude;

export type GoodsReceiptWithRelations = Prisma.GoodsReceiptGetPayload<{
  include: typeof goodsReceiptInclude;
}>;

export type GoodsReceiptFilterInput = {
  status?: GoodsReceiptStatus;
  purchaseOrderId?: string;
};

export type GoodsReceiptPaginationInput = {
  page: number;
  limit: number;
};

const PO_PROGRESS_STATUSES: GoodsReceiptStatus[] = [
  GoodsReceiptStatus.RECEIVED,
  GoodsReceiptStatus.PARTIALLY_RECEIVED,
  GoodsReceiptStatus.COMPLETED,
];

@Injectable()
export class GoodsReceiptRepository {
  constructor(private readonly prisma: PrismaService) {}

  createWithItems(
    receiptData: Omit<Prisma.GoodsReceiptCreateInput, 'items'>,
    items: Array<{
      purchaseOrderItemId: string;
      quantityOrdered: number;
    }>,
  ): Promise<GoodsReceiptWithRelations> {
    return this.prisma.goodsReceipt.create({
      data: {
        ...receiptData,
        items: {
          create: items.map((item) => ({
            purchaseOrderItemId: item.purchaseOrderItemId,
            quantityOrdered: item.quantityOrdered,
            quantityReceived: 0,
            quantityRejected: 0,
          })),
        },
      },
      include: goodsReceiptInclude,
    });
  }

  findById(
    id: string,
    organisationId: string,
  ): Promise<GoodsReceiptWithRelations | null> {
    return this.prisma.goodsReceipt.findFirst({
      where: { id, organisationId },
      include: goodsReceiptInclude,
    });
  }

  findAll(organisationId: string): Promise<GoodsReceiptWithRelations[]> {
    return this.prisma.goodsReceipt.findMany({
      where: { organisationId },
      include: goodsReceiptInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  update(
    id: string,
    data: Prisma.GoodsReceiptUpdateInput,
  ): Promise<GoodsReceiptWithRelations> {
    return this.prisma.goodsReceipt.update({
      where: { id },
      data,
      include: goodsReceiptInclude,
    });
  }

  delete(id: string) {
    return this.prisma.goodsReceipt.delete({ where: { id } });
  }

  receive(
    id: string,
    itemUpdates: Array<{ id: string; quantityReceived: number }>,
    status: GoodsReceiptStatus,
  ): Promise<GoodsReceiptWithRelations> {
    return this.prisma.$transaction(async (tx) => {
      for (const item of itemUpdates) {
        await tx.goodsReceiptItem.update({
          where: { id: item.id },
          data: { quantityReceived: item.quantityReceived },
        });
      }

      return tx.goodsReceipt.update({
        where: { id },
        data: { status },
        include: goodsReceiptInclude,
      });
    });
  }

  reject(
    id: string,
    itemUpdates: Array<{
      id: string;
      quantityRejected: number;
      remarks: string;
    }>,
    status: GoodsReceiptStatus,
  ): Promise<GoodsReceiptWithRelations> {
    return this.prisma.$transaction(async (tx) => {
      for (const item of itemUpdates) {
        await tx.goodsReceiptItem.update({
          where: { id: item.id },
          data: {
            quantityRejected: item.quantityRejected,
            remarks: item.remarks,
          },
        });
      }

      return tx.goodsReceipt.update({
        where: { id },
        data: { status },
        include: goodsReceiptInclude,
      });
    });
  }

  complete(id: string): Promise<GoodsReceiptWithRelations> {
    return this.prisma.goodsReceipt.update({
      where: { id },
      data: { status: GoodsReceiptStatus.COMPLETED },
      include: goodsReceiptInclude,
    });
  }

  findByPurchaseOrder(purchaseOrderId: string, organisationId: string) {
    return this.prisma.goodsReceipt.findMany({
      where: { purchaseOrderId, organisationId },
      include: goodsReceiptInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  countByOrganisation(organisationId: string) {
    return this.prisma.goodsReceipt.count({
      where: { organisationId },
    });
  }

  getCumulativeReceivedByPurchaseOrder(purchaseOrderId: string) {
    return this.prisma.goodsReceiptItem.findMany({
      where: {
        goodsReceipt: {
          purchaseOrderId,
          status: { in: PO_PROGRESS_STATUSES },
        },
      },
      select: {
        purchaseOrderItemId: true,
        quantityReceived: true,
        quantityRejected: true,
      },
    });
  }

  paginate(
    organisationId: string,
    filters: GoodsReceiptFilterInput,
    pagination: GoodsReceiptPaginationInput,
  ) {
    const where = this.buildWhereClause(organisationId, filters);

    return this.executePaginate(where, pagination);
  }

  search(
    organisationId: string,
    query: string,
    filters: GoodsReceiptFilterInput,
    pagination: GoodsReceiptPaginationInput,
  ) {
    const where = this.buildWhereClause(organisationId, filters, query);

    return this.executePaginate(where, pagination);
  }

  private executePaginate(
    where: Prisma.GoodsReceiptWhereInput,
    pagination: GoodsReceiptPaginationInput,
  ) {
    const skip = (pagination.page - 1) * pagination.limit;

    return Promise.all([
      this.prisma.goodsReceipt.findMany({
        where,
        skip,
        take: pagination.limit,
        orderBy: { createdAt: 'desc' },
        include: goodsReceiptInclude,
      }),
      this.prisma.goodsReceipt.count({ where }),
    ]);
  }

  private buildWhereClause(
    organisationId: string,
    filters: GoodsReceiptFilterInput,
    query?: string,
  ): Prisma.GoodsReceiptWhereInput {
    const where: Prisma.GoodsReceiptWhereInput = { organisationId };

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.purchaseOrderId) {
      where.purchaseOrderId = filters.purchaseOrderId;
    }

    if (query) {
      where.OR = [
        { receiptNumber: { contains: query, mode: 'insensitive' } },
        { warehouse: { contains: query, mode: 'insensitive' } },
        { notes: { contains: query, mode: 'insensitive' } },
      ];
    }

    return where;
  }
}
