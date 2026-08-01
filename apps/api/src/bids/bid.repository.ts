import { Injectable } from '@nestjs/common';
import { BidStatus, Prisma, VendorInvitationStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

import { PrismaService } from '../database/prisma.service';

export const bidInclude = {
  rfq: {
    select: {
      id: true,
      rfqNumber: true,
      title: true,
      closingDate: true,
      status: true,
      procurementRequestId: true,
      procurementRequest: {
        select: { organisationId: true },
      },
    },
  },
  vendor: {
    select: {
      id: true,
      name: true,
      email: true,
      organisationId: true,
    },
  },
  submittedBy: {
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
    },
  },
  items: { orderBy: { createdAt: 'asc' as const } },
  attachments: { orderBy: { uploadedAt: 'asc' as const } },
} satisfies Prisma.BidInclude;

export type BidWithRelations = Prisma.BidGetPayload<{
  include: typeof bidInclude;
}>;

export type BidFilterInput = {
  status?: BidStatus;
  rfqId?: string;
  vendorId?: string;
};

export type BidPaginationInput = {
  page: number;
  limit: number;
};

@Injectable()
export class BidRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.BidCreateInput): Promise<BidWithRelations> {
    return this.prisma.bid.create({
      data,
      include: bidInclude,
    });
  }

  findById(
    id: string,
    organisationId: string,
  ): Promise<BidWithRelations | null> {
    return this.prisma.bid.findFirst({
      where: {
        id,
        rfq: { procurementRequest: { organisationId } },
      },
      include: bidInclude,
    });
  }

  findAll(organisationId: string): Promise<BidWithRelations[]> {
    return this.prisma.bid.findMany({
      where: {
        rfq: { procurementRequest: { organisationId } },
      },
      include: bidInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  update(id: string, data: Prisma.BidUpdateInput): Promise<BidWithRelations> {
    return this.prisma.bid.update({
      where: { id },
      data,
      include: bidInclude,
    });
  }

  delete(id: string) {
    return this.prisma.bid.delete({ where: { id } });
  }

  submit(id: string, totalAmount: Decimal): Promise<BidWithRelations> {
    return this.prisma.$transaction(async (tx) => {
      const bid = await tx.bid.update({
        where: { id },
        data: {
          status: BidStatus.SUBMITTED,
          submittedAt: new Date(),
          totalAmount,
        },
        include: {
          rfq: { select: { id: true } },
          vendor: { select: { id: true } },
        },
      });

      await tx.rFQVendor.updateMany({
        where: {
          rfqId: bid.rfqId,
          vendorId: bid.vendorId,
        },
        data: {
          status: VendorInvitationStatus.RESPONDED,
          respondedAt: new Date(),
        },
      });

      return tx.bid.findUniqueOrThrow({
        where: { id },
        include: bidInclude,
      });
    });
  }

  withdraw(id: string): Promise<BidWithRelations> {
    return this.update(id, { status: BidStatus.WITHDRAWN });
  }

  addItem(data: Prisma.BidItemCreateInput) {
    return this.prisma.bidItem.create({ data });
  }

  findItemById(id: string) {
    return this.prisma.bidItem.findUnique({
      where: { id },
      include: {
        bid: {
          include: {
            rfq: {
              select: {
                procurementRequest: { select: { organisationId: true } },
              },
            },
            vendor: { select: { id: true, email: true } },
          },
        },
      },
    });
  }

  deleteItem(id: string) {
    return this.prisma.bidItem.delete({ where: { id } });
  }

  addAttachment(data: Prisma.BidAttachmentCreateInput) {
    return this.prisma.bidAttachment.create({ data });
  }

  findByVendor(vendorId: string, organisationId: string) {
    return this.prisma.bid.findMany({
      where: {
        vendorId,
        rfq: { procurementRequest: { organisationId } },
      },
      include: bidInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  findByRfq(rfqId: string, organisationId: string) {
    return this.prisma.bid.findMany({
      where: {
        rfqId,
        rfq: { procurementRequest: { organisationId } },
      },
      include: bidInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  findActiveByRfqAndVendor(rfqId: string, vendorId: string) {
    return this.prisma.bid.findFirst({
      where: {
        rfqId,
        vendorId,
        status: { in: [BidStatus.DRAFT, BidStatus.SUBMITTED] },
      },
    });
  }

  countByOrganisation(organisationId: string) {
    return this.prisma.bid.count({
      where: {
        rfq: { procurementRequest: { organisationId } },
      },
    });
  }

  paginate(
    organisationId: string,
    filters: BidFilterInput,
    pagination: BidPaginationInput,
  ) {
    const where = this.buildWhereClause(organisationId, filters);

    return this.executePaginate(where, pagination);
  }

  search(
    organisationId: string,
    query: string,
    filters: BidFilterInput,
    pagination: BidPaginationInput,
  ) {
    const where = this.buildWhereClause(organisationId, filters, query);

    return this.executePaginate(where, pagination);
  }

  recalculateTotal(bidId: string) {
    return this.prisma.$transaction(async (tx) => {
      const items = await tx.bidItem.findMany({ where: { bidId } });
      const total = items.reduce(
        (sum, item) => sum + Number(item.totalPrice.toFixed(2)),
        0,
      );

      return tx.bid.update({
        where: { id: bidId },
        data: { totalAmount: new Decimal(total.toFixed(2)) },
        include: bidInclude,
      });
    });
  }

  private executePaginate(
    where: Prisma.BidWhereInput,
    pagination: BidPaginationInput,
  ) {
    const skip = (pagination.page - 1) * pagination.limit;

    return Promise.all([
      this.prisma.bid.findMany({
        where,
        skip,
        take: pagination.limit,
        orderBy: { createdAt: 'desc' },
        include: bidInclude,
      }),
      this.prisma.bid.count({ where }),
    ]);
  }

  private buildWhereClause(
    organisationId: string,
    filters: BidFilterInput,
    query?: string,
  ): Prisma.BidWhereInput {
    const where: Prisma.BidWhereInput = {
      rfq: { procurementRequest: { organisationId } },
    };

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.rfqId) {
      where.rfqId = filters.rfqId;
    }

    if (filters.vendorId) {
      where.vendorId = filters.vendorId;
    }

    if (query) {
      where.OR = [
        { bidNumber: { contains: query, mode: 'insensitive' } },
        { notes: { contains: query, mode: 'insensitive' } },
      ];
    }

    return where;
  }
}
