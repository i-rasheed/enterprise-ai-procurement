import { Injectable } from '@nestjs/common';
import { ComplianceStatus, Prisma, Vendor, VendorStatus } from '@prisma/client';

import { PrismaService } from '../database/prisma.service';

export type VendorFilterInput = {
  name?: string;
  category?: string;
  status?: VendorStatus;
  complianceStatus?: ComplianceStatus;
};

export type VendorPaginationInput = {
  page: number;
  limit: number;
};

@Injectable()
export class VendorRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.VendorCreateInput): Promise<Vendor> {
    return this.prisma.vendor.create({ data });
  }

  findAll(organisationId: string): Promise<Vendor[]> {
    return this.prisma.vendor.findMany({
      where: { organisationId },
      orderBy: { createdAt: 'desc' },
    });
  }

  findById(id: string, organisationId: string): Promise<Vendor | null> {
    return this.prisma.vendor.findFirst({
      where: { id, organisationId },
    });
  }

  findByEmail(email: string, organisationId: string): Promise<Vendor | null> {
    return this.prisma.vendor.findUnique({
      where: {
        organisationId_email: {
          organisationId,
          email,
        },
      },
    });
  }

  findByRegistrationNumber(
    registrationNumber: string,
    organisationId: string,
  ): Promise<Vendor | null> {
    return this.prisma.vendor.findUnique({
      where: {
        organisationId_registrationNumber: {
          organisationId,
          registrationNumber,
        },
      },
    });
  }

  update(id: string, data: Prisma.VendorUpdateInput): Promise<Vendor> {
    return this.prisma.vendor.update({
      where: { id },
      data,
    });
  }

  delete(id: string): Promise<Vendor> {
    return this.prisma.vendor.delete({
      where: { id },
    });
  }

  search(
    organisationId: string,
    query: string,
    filters: VendorFilterInput,
    pagination: VendorPaginationInput,
  ) {
    const where = this.buildWhereClause(organisationId, filters, query);

    return this.executePaginate(where, pagination);
  }

  paginate(
    organisationId: string,
    filters: VendorFilterInput,
    pagination: VendorPaginationInput,
  ) {
    const where = this.buildWhereClause(organisationId, filters);

    return this.executePaginate(where, pagination);
  }

  private executePaginate(
    where: Prisma.VendorWhereInput,
    pagination: VendorPaginationInput,
  ) {
    const skip = (pagination.page - 1) * pagination.limit;

    return Promise.all([
      this.prisma.vendor.findMany({
        where,
        skip,
        take: pagination.limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.vendor.count({ where }),
    ]);
  }

  private buildWhereClause(
    organisationId: string,
    filters: VendorFilterInput,
    query?: string,
  ): Prisma.VendorWhereInput {
    const where: Prisma.VendorWhereInput = { organisationId };

    if (filters.name) {
      where.name = { contains: filters.name, mode: 'insensitive' };
    }

    if (filters.category) {
      where.category = { equals: filters.category, mode: 'insensitive' };
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.complianceStatus) {
      where.complianceStatus = filters.complianceStatus;
    }

    if (query) {
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } },
        { category: { contains: query, mode: 'insensitive' } },
        { registrationNumber: { contains: query, mode: 'insensitive' } },
      ];
    }

    return where;
  }
}
