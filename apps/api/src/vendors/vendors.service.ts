import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { CreateVendorDto } from './dto/create-vendor.dto';
import { ListVendorQueryDto, SearchVendorDto } from './dto/search-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { VendorRepository } from './vendor.repository';

@Injectable()
export class VendorsService {
  constructor(private readonly vendorRepository: VendorRepository) {}

  async create(organisationId: string, dto: CreateVendorDto) {
    await this.assertUniqueEmail(organisationId, dto.email);

    if (dto.registrationNumber) {
      await this.assertUniqueRegistrationNumber(
        organisationId,
        dto.registrationNumber,
      );
    }

    return this.vendorRepository.create({
      name: dto.name,
      email: dto.email,
      phone: dto.phone,
      address: dto.address,
      website: dto.website,
      registrationNumber: dto.registrationNumber,
      taxIdentificationNumber: dto.taxIdentificationNumber,
      category: dto.category,
      status: dto.status,
      rating: dto.rating,
      complianceStatus: dto.complianceStatus,
      notes: dto.notes,
      organisation: { connect: { id: organisationId } },
    });
  }

  async findAll(organisationId: string, query: ListVendorQueryDto) {
    const pagination = this.resolvePagination(query);
    const filters = this.extractFilters(query);

    const [vendors, total] = await this.vendorRepository.paginate(
      organisationId,
      filters,
      pagination,
    );

    return this.buildPaginatedResponse(vendors, total, pagination);
  }

  async search(organisationId: string, query: SearchVendorDto) {
    const pagination = this.resolvePagination(query);
    const filters = this.extractFilters(query);
    const searchTerm = query.q?.trim();

    const [vendors, total] = searchTerm
      ? await this.vendorRepository.search(
          organisationId,
          searchTerm,
          filters,
          pagination,
        )
      : await this.vendorRepository.paginate(
          organisationId,
          filters,
          pagination,
        );

    return this.buildPaginatedResponse(vendors, total, pagination);
  }

  async findOne(organisationId: string, id: string) {
    const vendor = await this.vendorRepository.findById(id, organisationId);

    if (!vendor) {
      throw new NotFoundException('Vendor not found');
    }

    return vendor;
  }

  async update(organisationId: string, id: string, dto: UpdateVendorDto) {
    await this.findOne(organisationId, id);

    if (dto.email) {
      await this.assertUniqueEmail(organisationId, dto.email, id);
    }

    if (dto.registrationNumber) {
      await this.assertUniqueRegistrationNumber(
        organisationId,
        dto.registrationNumber,
        id,
      );
    }

    return this.vendorRepository.update(id, dto);
  }

  async delete(organisationId: string, id: string) {
    await this.findOne(organisationId, id);

    await this.vendorRepository.delete(id);

    return {
      message: 'Vendor deleted successfully',
    };
  }

  private async assertUniqueEmail(
    organisationId: string,
    email: string,
    excludeVendorId?: string,
  ) {
    const existing = await this.vendorRepository.findByEmail(
      email,
      organisationId,
    );

    if (existing && existing.id !== excludeVendorId) {
      throw new ConflictException(
        'A vendor with this email already exists in the organisation',
      );
    }
  }

  private async assertUniqueRegistrationNumber(
    organisationId: string,
    registrationNumber: string,
    excludeVendorId?: string,
  ) {
    const existing = await this.vendorRepository.findByRegistrationNumber(
      registrationNumber,
      organisationId,
    );

    if (existing && existing.id !== excludeVendorId) {
      throw new ConflictException(
        'A vendor with this registration number already exists in the organisation',
      );
    }
  }

  private resolvePagination(query: ListVendorQueryDto) {
    return {
      page: query.page ?? 1,
      limit: query.limit ?? 20,
    };
  }

  private extractFilters(query: ListVendorQueryDto) {
    return {
      name: query.name,
      category: query.category,
      status: query.status,
      complianceStatus: query.complianceStatus,
    };
  }

  private buildPaginatedResponse(
    vendors: Prisma.VendorGetPayload<object>[],
    total: number,
    pagination: { page: number; limit: number },
  ) {
    return {
      vendors,
      page: pagination.page,
      limit: pagination.limit,
      total,
      totalPages: Math.ceil(total / pagination.limit) || 0,
    };
  }
}
