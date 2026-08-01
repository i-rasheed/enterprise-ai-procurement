import { Injectable } from '@nestjs/common';
import {
  Prisma,
  ProcurementItem,
  ProcurementPriority,
  ProcurementRequest,
  ProcurementStatus,
} from '@prisma/client';

import { PrismaService } from '../database/prisma.service';

export const procurementRequestInclude = {
  items: { orderBy: { createdAt: 'asc' as const } },
  requester: {
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
    },
  },
} satisfies Prisma.ProcurementRequestInclude;

export type ProcurementRequestWithRelations =
  Prisma.ProcurementRequestGetPayload<{
    include: typeof procurementRequestInclude;
  }>;

export type ProcurementFilterInput = {
  status?: ProcurementStatus;
  priority?: ProcurementPriority;
  department?: string;
};

export type ProcurementPaginationInput = {
  page: number;
  limit: number;
};

@Injectable()
export class ProcurementRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(
    data: Prisma.ProcurementRequestCreateInput,
  ): Promise<ProcurementRequestWithRelations> {
    return this.prisma.procurementRequest.create({
      data,
      include: procurementRequestInclude,
    });
  }

  findById(
    id: string,
    organisationId: string,
  ): Promise<ProcurementRequestWithRelations | null> {
    return this.prisma.procurementRequest.findFirst({
      where: { id, organisationId },
      include: procurementRequestInclude,
    });
  }

  findAll(organisationId: string): Promise<ProcurementRequestWithRelations[]> {
    return this.prisma.procurementRequest.findMany({
      where: { organisationId },
      include: procurementRequestInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  update(
    id: string,
    data: Prisma.ProcurementRequestUpdateInput,
  ): Promise<ProcurementRequestWithRelations> {
    return this.prisma.procurementRequest.update({
      where: { id },
      data,
      include: procurementRequestInclude,
    });
  }

  delete(id: string): Promise<ProcurementRequest> {
    return this.prisma.procurementRequest.delete({
      where: { id },
    });
  }

  submit(id: string): Promise<ProcurementRequestWithRelations> {
    return this.prisma.procurementRequest.update({
      where: { id },
      data: { status: ProcurementStatus.SUBMITTED },
      include: procurementRequestInclude,
    });
  }

  findDrafts(
    organisationId: string,
    requesterId?: string,
  ): Promise<ProcurementRequestWithRelations[]> {
    return this.prisma.procurementRequest.findMany({
      where: {
        organisationId,
        status: ProcurementStatus.DRAFT,
        ...(requesterId ? { requesterId } : {}),
      },
      include: procurementRequestInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  paginate(
    organisationId: string,
    filters: ProcurementFilterInput,
    pagination: ProcurementPaginationInput,
  ) {
    const where = this.buildWhereClause(organisationId, filters);

    return this.executePaginate(where, pagination);
  }

  search(
    organisationId: string,
    query: string,
    filters: ProcurementFilterInput,
    pagination: ProcurementPaginationInput,
  ) {
    const where = this.buildWhereClause(organisationId, filters, query);

    return this.executePaginate(where, pagination);
  }

  createItem(
    data: Prisma.ProcurementItemCreateInput,
  ): Promise<ProcurementItem> {
    return this.prisma.procurementItem.create({ data });
  }

  findItemById(
    id: string,
  ): Promise<
    (ProcurementItem & { procurementRequest: ProcurementRequest }) | null
  > {
    return this.prisma.procurementItem.findUnique({
      where: { id },
      include: { procurementRequest: true },
    });
  }

  deleteItem(id: string): Promise<ProcurementItem> {
    return this.prisma.procurementItem.delete({
      where: { id },
    });
  }

  private executePaginate(
    where: Prisma.ProcurementRequestWhereInput,
    pagination: ProcurementPaginationInput,
  ) {
    const skip = (pagination.page - 1) * pagination.limit;

    return Promise.all([
      this.prisma.procurementRequest.findMany({
        where,
        skip,
        take: pagination.limit,
        orderBy: { createdAt: 'desc' },
        include: procurementRequestInclude,
      }),
      this.prisma.procurementRequest.count({ where }),
    ]);
  }

  private buildWhereClause(
    organisationId: string,
    filters: ProcurementFilterInput,
    query?: string,
  ): Prisma.ProcurementRequestWhereInput {
    const where: Prisma.ProcurementRequestWhereInput = { organisationId };

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.priority) {
      where.priority = filters.priority;
    }

    if (filters.department) {
      where.department = { equals: filters.department, mode: 'insensitive' };
    }

    if (query) {
      where.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { department: { contains: query, mode: 'insensitive' } },
        { justification: { contains: query, mode: 'insensitive' } },
      ];
    }

    return where;
  }
}
