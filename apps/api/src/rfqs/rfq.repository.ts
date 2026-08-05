import { Injectable } from '@nestjs/common';
import { Prisma, RFQStatus } from '@prisma/client';

import { PrismaService } from '../database/prisma.service';

export const rfqInclude = {
  createdBy: {
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
    },
  },
  vendors: {
    include: {
      vendor: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: { invitedAt: 'asc' as const },
  },
  procurementRequest: {
    select: {
      id: true,
      organisationId: true,
      status: true,
    },
  },
} satisfies Prisma.RFQInclude;

export type RFQWithRelations = Prisma.RFQGetPayload<{
  include: typeof rfqInclude;
}>;

export type RFQFilterInput = {
  status?: RFQStatus;
};

export type RFQPaginationInput = {
  page: number;
  limit: number;
};

@Injectable()
export class RFQRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.RFQCreateInput): Promise<RFQWithRelations> {
    return this.prisma.rFQ.create({
      data,
      include: rfqInclude,
    });
  }

  findById(
    id: string,
    organisationId: string,
  ): Promise<RFQWithRelations | null> {
    return this.prisma.rFQ.findFirst({
      where: {
        id,
        procurementRequest: { organisationId },
      },
      include: rfqInclude,
    });
  }

  findAll(organisationId: string): Promise<RFQWithRelations[]> {
    return this.prisma.rFQ.findMany({
      where: {
        procurementRequest: { organisationId },
      },
      include: rfqInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  update(id: string, data: Prisma.RFQUpdateInput): Promise<RFQWithRelations> {
    return this.prisma.rFQ.update({
      where: { id },
      data,
      include: rfqInclude,
    });
  }

  delete(id: string) {
    return this.prisma.rFQ.delete({
      where: { id },
    });
  }

  publish(id: string): Promise<RFQWithRelations> {
    return this.update(id, { status: RFQStatus.PUBLISHED });
  }

  close(id: string): Promise<RFQWithRelations> {
    return this.update(id, { status: RFQStatus.CLOSED });
  }

  cancel(id: string): Promise<RFQWithRelations> {
    return this.update(id, { status: RFQStatus.CANCELLED });
  }

  inviteVendor(data: Prisma.RFQVendorCreateInput) {
    return this.prisma.rFQVendor.create({
      data,
      include: {
        vendor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  findVendorInvitation(rfqId: string, vendorId: string) {
    return this.prisma.rFQVendor.findUnique({
      where: {
        rfqId_vendorId: {
          rfqId,
          vendorId,
        },
      },
    });
  }

  listInvitedVendors(rfqId: string) {
    return this.prisma.rFQVendor.findMany({
      where: { rfqId },
      include: {
        vendor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { invitedAt: 'asc' },
    });
  }

  countByOrganisation(organisationId: string) {
    return this.prisma.rFQ.count({
      where: {
        procurementRequest: { organisationId },
      },
    });
  }

  paginate(
    organisationId: string,
    filters: RFQFilterInput,
    pagination: RFQPaginationInput,
  ) {
    const where = this.buildWhereClause(organisationId, filters);

    return this.executePaginate(where, pagination);
  }

  search(
    organisationId: string,
    query: string,
    filters: RFQFilterInput,
    pagination: RFQPaginationInput,
  ) {
    const where = this.buildWhereClause(organisationId, filters, query);

    return this.executePaginate(where, pagination);
  }

  private executePaginate(
    where: Prisma.RFQWhereInput,
    pagination: RFQPaginationInput,
  ) {
    const skip = (pagination.page - 1) * pagination.limit;

    return Promise.all([
      this.prisma.rFQ.findMany({
        where,
        skip,
        take: pagination.limit,
        orderBy: { createdAt: 'desc' },
        include: rfqInclude,
      }),
      this.prisma.rFQ.count({ where }),
    ]);
  }

  private buildWhereClause(
    organisationId: string,
    filters: RFQFilterInput,
    query?: string,
  ): Prisma.RFQWhereInput {
    const where: Prisma.RFQWhereInput = {
      procurementRequest: { organisationId },
    };

    if (filters.status) {
      where.status = filters.status;
    }

    if (query) {
      where.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { rfqNumber: { contains: query, mode: 'insensitive' } },
      ];
    }

    return where;
  }
}
