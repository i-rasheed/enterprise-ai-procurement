import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ProcurementStatus, RFQStatus, Role } from '@prisma/client';

import { ProcurementRepository } from '../procurement/procurement.repository';
import { VendorRepository } from '../vendors/vendor.repository';
import { CreateRFQDto } from './dto/create-rfq.dto';
import { InviteVendorDto } from './dto/invite-vendor.dto';
import { ListRFQQueryDto } from './dto/list-rfq-query.dto';
import { PublishRFQDto } from './dto/publish-rfq.dto';
import { UpdateRFQDto } from './dto/update-rfq.dto';
import { RFQRepository, RFQWithRelations } from './rfq.repository';

@Injectable()
export class RFQService {
  constructor(
    private readonly rfqRepository: RFQRepository,
    private readonly procurementRepository: ProcurementRepository,
    private readonly vendorRepository: VendorRepository,
  ) {}

  async create(organisationId: string, createdById: string, dto: CreateRFQDto) {
    const procurementRequest = await this.procurementRepository.findById(
      dto.procurementRequestId,
      organisationId,
    );

    if (!procurementRequest) {
      throw new NotFoundException('Procurement request not found');
    }

    if (procurementRequest.status !== ProcurementStatus.APPROVED) {
      throw new BadRequestException(
        'RFQs can only be created for approved procurement requests',
      );
    }

    const closingDate = new Date(dto.closingDate);

    if (closingDate <= new Date()) {
      throw new BadRequestException('Closing date must be in the future');
    }

    const rfqNumber = await this.generateRfqNumber(organisationId);

    const rfq = await this.rfqRepository.create({
      rfqNumber,
      title: dto.title,
      description: dto.description,
      closingDate,
      status: RFQStatus.DRAFT,
      procurementRequest: { connect: { id: dto.procurementRequestId } },
      createdBy: { connect: { id: createdById } },
    });

    return this.mapRfq(rfq);
  }

  async findAll(organisationId: string, query: ListRFQQueryDto) {
    const pagination = this.resolvePagination(query);
    const filters = { status: query.status };
    const searchTerm = query.search?.trim();

    const [rfqs, total] = searchTerm
      ? await this.rfqRepository.search(
          organisationId,
          searchTerm,
          filters,
          pagination,
        )
      : await this.rfqRepository.paginate(organisationId, filters, pagination);

    return this.buildPaginatedResponse(rfqs, total, pagination);
  }

  async findOne(organisationId: string, id: string) {
    const rfq = await this.getRfqOrThrow(organisationId, id);

    return this.mapRfq(rfq);
  }

  async update(organisationId: string, id: string, dto: UpdateRFQDto) {
    const rfq = await this.getRfqOrThrow(organisationId, id);

    this.assertEditable(rfq);

    const updateData =
      rfq.status === RFQStatus.PUBLISHED ? this.buildPublishedUpdate(dto) : dto;

    if (Object.keys(updateData).length === 0) {
      throw new BadRequestException('No valid fields provided for update');
    }

    if (updateData.closingDate) {
      const closingDate = new Date(updateData.closingDate);

      if (closingDate <= new Date()) {
        throw new BadRequestException('Closing date must be in the future');
      }
    }

    const updated = await this.rfqRepository.update(id, {
      title: updateData.title,
      description: updateData.description,
      closingDate: updateData.closingDate
        ? new Date(updateData.closingDate)
        : undefined,
    });

    return this.mapRfq(updated);
  }

  async deleteDraft(organisationId: string, id: string) {
    const rfq = await this.getRfqOrThrow(organisationId, id);

    if (rfq.status !== RFQStatus.DRAFT) {
      throw new BadRequestException('Only draft RFQs can be deleted');
    }

    await this.rfqRepository.delete(id);

    return { message: 'RFQ deleted successfully' };
  }

  async publish(organisationId: string, id: string, dto: PublishRFQDto) {
    const rfq = await this.getRfqOrThrow(organisationId, id);

    if (rfq.status !== RFQStatus.DRAFT) {
      throw new BadRequestException('Only draft RFQs can be published');
    }

    if (rfq.vendors.length === 0) {
      throw new BadRequestException(
        'Cannot publish an RFQ without at least one invited vendor',
      );
    }

    const published = await this.rfqRepository.publish(id);
    const mapped = this.mapRfq(published);

    return {
      ...mapped,
      publicationNote: dto.publicationNote,
    };
  }

  async close(organisationId: string, id: string) {
    const rfq = await this.getRfqOrThrow(organisationId, id);

    if (rfq.status !== RFQStatus.PUBLISHED) {
      throw new BadRequestException('Only published RFQs can be closed');
    }

    const closed = await this.rfqRepository.close(id);

    return this.mapRfq(closed);
  }

  async cancel(organisationId: string, id: string) {
    const rfq = await this.getRfqOrThrow(organisationId, id);

    if (rfq.status === RFQStatus.CLOSED) {
      throw new BadRequestException('Closed RFQs cannot be cancelled');
    }

    if (rfq.status === RFQStatus.CANCELLED) {
      throw new BadRequestException('RFQ is already cancelled');
    }

    const cancelled = await this.rfqRepository.cancel(id);

    return this.mapRfq(cancelled);
  }

  async inviteVendor(
    organisationId: string,
    userRole: Role,
    id: string,
    dto: InviteVendorDto,
  ) {
    if (userRole !== Role.PROCUREMENT_MANAGER) {
      throw new ForbiddenException(
        'Only procurement managers can invite vendors to an RFQ',
      );
    }

    const rfq = await this.getRfqOrThrow(organisationId, id);

    if (rfq.status !== RFQStatus.DRAFT) {
      throw new BadRequestException(
        'Vendors can only be invited to draft RFQs',
      );
    }

    const vendor = await this.vendorRepository.findById(
      dto.vendorId,
      organisationId,
    );

    if (!vendor) {
      throw new NotFoundException('Vendor not found');
    }

    const existing = await this.rfqRepository.findVendorInvitation(
      id,
      dto.vendorId,
    );

    if (existing) {
      throw new ConflictException(
        'Vendor has already been invited to this RFQ',
      );
    }

    await this.rfqRepository.inviteVendor({
      rfq: { connect: { id } },
      vendor: { connect: { id: dto.vendorId } },
    });

    const refreshed = await this.getRfqOrThrow(organisationId, id);

    return this.mapRfq(refreshed);
  }

  async listVendors(organisationId: string, id: string) {
    await this.getRfqOrThrow(organisationId, id);

    const vendors = await this.rfqRepository.listInvitedVendors(id);

    return {
      vendors: vendors.map((entry) => this.mapRfqVendor(entry)),
    };
  }

  private async getRfqOrThrow(organisationId: string, id: string) {
    const rfq = await this.rfqRepository.findById(id, organisationId);

    if (!rfq) {
      throw new NotFoundException('RFQ not found');
    }

    return rfq;
  }

  private assertEditable(rfq: RFQWithRelations) {
    if (rfq.status === RFQStatus.CLOSED) {
      throw new BadRequestException('Closed RFQs cannot be edited');
    }

    if (rfq.status === RFQStatus.CANCELLED) {
      throw new BadRequestException('Cancelled RFQs cannot be edited');
    }
  }

  private buildPublishedUpdate(dto: UpdateRFQDto): UpdateRFQDto {
    if (dto.title !== undefined || dto.description !== undefined) {
      throw new BadRequestException(
        'Published RFQs can only have their closing date updated',
      );
    }

    if (dto.closingDate === undefined) {
      throw new BadRequestException(
        'Published RFQs can only have their closing date updated',
      );
    }

    return { closingDate: dto.closingDate };
  }

  private async generateRfqNumber(organisationId: string) {
    const count = await this.rfqRepository.countByOrganisation(organisationId);
    const year = new Date().getFullYear();

    return `RFQ-${year}-${String(count + 1).padStart(6, '0')}`;
  }

  private resolvePagination(query: ListRFQQueryDto) {
    return {
      page: query.page ?? 1,
      limit: query.limit ?? 20,
    };
  }

  private buildPaginatedResponse(
    rfqs: RFQWithRelations[],
    total: number,
    pagination: { page: number; limit: number },
  ) {
    return {
      rfqs: rfqs.map((rfq) => this.mapRfq(rfq)),
      page: pagination.page,
      limit: pagination.limit,
      total,
      totalPages: Math.ceil(total / pagination.limit) || 0,
    };
  }

  private mapRfq(rfq: RFQWithRelations) {
    return {
      id: rfq.id,
      procurementRequestId: rfq.procurementRequestId,
      rfqNumber: rfq.rfqNumber,
      title: rfq.title,
      description: rfq.description,
      closingDate: rfq.closingDate.toISOString(),
      status: rfq.status,
      createdBy: rfq.createdBy,
      vendors: rfq.vendors.map((entry) => this.mapRfqVendor(entry)),
      createdAt: rfq.createdAt.toISOString(),
      updatedAt: rfq.updatedAt.toISOString(),
    };
  }

  private mapRfqVendor(entry: RFQWithRelations['vendors'][number]) {
    return {
      id: entry.id,
      rfqId: entry.rfqId,
      vendor: entry.vendor,
      invitedAt: entry.invitedAt.toISOString(),
      respondedAt: entry.respondedAt?.toISOString() ?? null,
      status: entry.status,
    };
  }
}
