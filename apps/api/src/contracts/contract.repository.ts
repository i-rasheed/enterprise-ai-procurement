import { Injectable } from '@nestjs/common';
import { ContractStatus, ContractType, Prisma } from '@prisma/client';

import { PrismaService } from '../database/prisma.service';

export const contractInclude = {
  vendor: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
  createdBy: {
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
    },
  },
  documents: {
    orderBy: { uploadedAt: 'desc' as const },
    include: {
      uploadedBy: {
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
} satisfies Prisma.ContractInclude;

export const contractVersionInclude = {
  createdBy: {
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
    },
  },
} satisfies Prisma.ContractVersionInclude;

export type ContractWithRelations = Prisma.ContractGetPayload<{
  include: typeof contractInclude;
}>;

export type ContractVersionWithRelations = Prisma.ContractVersionGetPayload<{
  include: typeof contractVersionInclude;
}>;

export type ContractFilterInput = {
  status?: ContractStatus;
  contractType?: ContractType;
  vendorId?: string;
};

export type ContractPaginationInput = {
  page: number;
  limit: number;
};

@Injectable()
export class ContractRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.ContractCreateInput): Promise<ContractWithRelations> {
    return this.prisma.contract.create({
      data,
      include: contractInclude,
    });
  }

  findById(
    id: string,
    organisationId: string,
  ): Promise<ContractWithRelations | null> {
    return this.prisma.contract.findFirst({
      where: { id, organisationId },
      include: contractInclude,
    });
  }

  findAll(organisationId: string): Promise<ContractWithRelations[]> {
    return this.prisma.contract.findMany({
      where: { organisationId },
      include: contractInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  update(
    id: string,
    data: Prisma.ContractUpdateInput,
  ): Promise<ContractWithRelations> {
    return this.prisma.contract.update({
      where: { id },
      data,
      include: contractInclude,
    });
  }

  delete(id: string) {
    return this.prisma.contract.delete({ where: { id } });
  }

  activate(id: string): Promise<ContractWithRelations> {
    return this.update(id, { status: ContractStatus.ACTIVE });
  }

  terminate(id: string): Promise<ContractWithRelations> {
    return this.update(id, { status: ContractStatus.TERMINATED });
  }

  renew(
    id: string,
    data: Prisma.ContractUpdateInput,
  ): Promise<ContractWithRelations> {
    return this.update(id, {
      ...data,
      status: ContractStatus.ACTIVE,
    });
  }

  expire(id: string): Promise<ContractWithRelations> {
    return this.update(id, { status: ContractStatus.EXPIRED });
  }

  uploadDocument(data: Prisma.ContractDocumentCreateInput) {
    return this.prisma.contractDocument.create({
      data,
      include: {
        uploadedBy: {
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

  createVersion(data: Prisma.ContractVersionCreateInput) {
    return this.prisma.contractVersion.create({
      data,
      include: contractVersionInclude,
    });
  }

  getNextVersionNumber(contractId: string) {
    return this.prisma.contractVersion
      .aggregate({
        where: { contractId },
        _max: { version: true },
      })
      .then((result) => (result._max.version ?? 0) + 1);
  }

  history(contractId: string): Promise<ContractVersionWithRelations[]> {
    return this.prisma.contractVersion.findMany({
      where: { contractId },
      include: contractVersionInclude,
      orderBy: { version: 'desc' },
    });
  }

  countByOrganisation(organisationId: string) {
    return this.prisma.contract.count({
      where: { organisationId },
    });
  }

  paginate(
    organisationId: string,
    filters: ContractFilterInput,
    pagination: ContractPaginationInput,
  ) {
    const where = this.buildWhereClause(organisationId, filters);

    return this.executePaginate(where, pagination);
  }

  search(
    organisationId: string,
    query: string,
    filters: ContractFilterInput,
    pagination: ContractPaginationInput,
  ) {
    const where = this.buildWhereClause(organisationId, filters, query);

    return this.executePaginate(where, pagination);
  }

  private executePaginate(
    where: Prisma.ContractWhereInput,
    pagination: ContractPaginationInput,
  ) {
    const skip = (pagination.page - 1) * pagination.limit;

    return Promise.all([
      this.prisma.contract.findMany({
        where,
        skip,
        take: pagination.limit,
        orderBy: { createdAt: 'desc' },
        include: contractInclude,
      }),
      this.prisma.contract.count({ where }),
    ]);
  }

  private buildWhereClause(
    organisationId: string,
    filters: ContractFilterInput,
    query?: string,
  ): Prisma.ContractWhereInput {
    const where: Prisma.ContractWhereInput = { organisationId };

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.contractType) {
      where.contractType = filters.contractType;
    }

    if (filters.vendorId) {
      where.vendorId = filters.vendorId;
    }

    if (query) {
      where.OR = [
        { contractNumber: { contains: query, mode: 'insensitive' } },
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { vendor: { name: { contains: query, mode: 'insensitive' } } },
      ];
    }

    return where;
  }
}
