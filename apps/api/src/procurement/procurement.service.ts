import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/library';
import { ProcurementStatus } from '@prisma/client';

import { ApprovalWorkflowService } from '../approval-workflows/approval-workflow.service';

import { CreateProcurementItemDto } from './dto/create-procurement-item.dto';
import { CreateProcurementRequestDto } from './dto/create-procurement-request.dto';
import { ListProcurementQueryDto } from './dto/list-procurement-query.dto';
import { SubmitProcurementRequestDto } from './dto/submit-procurement-request.dto';
import { UpdateProcurementRequestDto } from './dto/update-procurement-request.dto';
import {
  ProcurementRepository,
  ProcurementRequestWithRelations,
} from './procurement.repository';

@Injectable()
export class ProcurementService {
  constructor(
    private readonly procurementRepository: ProcurementRepository,
    @Inject(forwardRef(() => ApprovalWorkflowService))
    private readonly approvalWorkflowService: ApprovalWorkflowService,
  ) {}

  createDraft(
    organisationId: string,
    requesterId: string,
    dto: CreateProcurementRequestDto,
  ) {
    return this.procurementRepository
      .create({
        title: dto.title,
        description: dto.description,
        justification: dto.justification,
        department: dto.department,
        estimatedBudget: new Decimal(dto.estimatedBudget),
        currency: dto.currency ?? 'USD',
        priority: dto.priority,
        status: ProcurementStatus.DRAFT,
        requiredDeliveryDate: new Date(dto.requiredDeliveryDate),
        organisation: { connect: { id: organisationId } },
        requester: { connect: { id: requesterId } },
      })
      .then((request) => this.mapRequest(request));
  }

  async findAll(organisationId: string, query: ListProcurementQueryDto) {
    const pagination = this.resolvePagination(query);
    const filters = this.extractFilters(query);
    const searchTerm = query.search?.trim();

    const [requests, total] = searchTerm
      ? await this.procurementRepository.search(
          organisationId,
          searchTerm,
          filters,
          pagination,
        )
      : await this.procurementRepository.paginate(
          organisationId,
          filters,
          pagination,
        );

    return this.buildPaginatedResponse(requests, total, pagination);
  }

  async findOne(organisationId: string, id: string) {
    const request = await this.getRequestOrThrow(organisationId, id);

    return this.mapRequest(request);
  }

  async updateDraft(
    organisationId: string,
    id: string,
    dto: UpdateProcurementRequestDto,
  ) {
    const request = await this.getRequestOrThrow(organisationId, id);

    this.assertDraftEditable(request);

    const updated = await this.procurementRepository.update(id, {
      title: dto.title,
      description: dto.description,
      justification: dto.justification,
      department: dto.department,
      estimatedBudget:
        dto.estimatedBudget !== undefined
          ? new Decimal(dto.estimatedBudget)
          : undefined,
      currency: dto.currency,
      priority: dto.priority,
      requiredDeliveryDate: dto.requiredDeliveryDate
        ? new Date(dto.requiredDeliveryDate)
        : undefined,
    });

    return this.mapRequest(updated);
  }

  async deleteDraft(organisationId: string, id: string) {
    const request = await this.getRequestOrThrow(organisationId, id);

    this.assertDraftEditable(request);

    await this.procurementRepository.delete(id);

    return {
      message: 'Procurement request deleted successfully',
    };
  }

  async submit(
    organisationId: string,
    id: string,
    dto: SubmitProcurementRequestDto,
  ) {
    const request = await this.getRequestOrThrow(organisationId, id);

    this.assertDraftEditable(request);

    if (request.items.length === 0) {
      throw new BadRequestException(
        'Cannot submit a procurement request with no line items',
      );
    }

    const totalCost = this.calculateTotalCost(request);

    if (!this.budgetMatchesTotal(request.estimatedBudget, totalCost)) {
      throw new BadRequestException(
        'Estimated budget must equal the sum of line item totals',
      );
    }

    const submitted = await this.procurementRepository.submit(id);
    const workflow = await this.approvalWorkflowService.startWorkflow(
      organisationId,
      id,
    );
    const mapped = this.mapRequest(submitted);

    return {
      ...mapped,
      submissionNote: dto.submissionNote,
      approvalWorkflow: workflow,
    };
  }

  async addLineItem(
    organisationId: string,
    requestId: string,
    dto: CreateProcurementItemDto,
  ) {
    const request = await this.getRequestOrThrow(organisationId, requestId);

    this.assertDraftEditable(request);

    const totalPrice = this.calculateLineTotal(dto.quantity, dto.unitPrice);

    await this.procurementRepository.createItem({
      description: dto.description,
      quantity: dto.quantity,
      unitPrice: new Decimal(dto.unitPrice),
      totalPrice: new Decimal(totalPrice),
      procurementRequest: { connect: { id: requestId } },
    });

    const refreshed = await this.getRequestOrThrow(organisationId, requestId);

    return this.mapRequest(refreshed);
  }

  async removeLineItem(organisationId: string, itemId: string) {
    const item = await this.procurementRepository.findItemById(itemId);

    if (!item) {
      throw new NotFoundException('Line item not found');
    }

    if (item.procurementRequest.organisationId !== organisationId) {
      throw new ForbiddenException(
        'Line item does not belong to your organisation',
      );
    }

    if (item.procurementRequest.status !== ProcurementStatus.DRAFT) {
      throw new BadRequestException(
        'Only draft procurement requests can be modified',
      );
    }

    await this.procurementRepository.deleteItem(itemId);

    return {
      message: 'Line item removed successfully',
    };
  }

  findDrafts(organisationId: string, requesterId?: string) {
    return this.procurementRepository
      .findDrafts(organisationId, requesterId)
      .then((requests) => requests.map((request) => this.mapRequest(request)));
  }

  calculateTotalCost(request: ProcurementRequestWithRelations): number {
    return request.items.reduce(
      (sum, item) => sum + this.decimalToNumber(item.totalPrice),
      0,
    );
  }

  private async getRequestOrThrow(organisationId: string, id: string) {
    const request = await this.procurementRepository.findById(
      id,
      organisationId,
    );

    if (!request) {
      throw new NotFoundException('Procurement request not found');
    }

    return request;
  }

  private assertDraftEditable(request: ProcurementRequestWithRelations) {
    if (request.status !== ProcurementStatus.DRAFT) {
      throw new BadRequestException(
        'Only draft procurement requests can be modified',
      );
    }
  }

  private calculateLineTotal(quantity: number, unitPrice: number): number {
    return Number((quantity * unitPrice).toFixed(2));
  }

  private budgetMatchesTotal(
    estimatedBudget: Decimal,
    totalCost: number,
  ): boolean {
    return this.decimalToNumber(estimatedBudget) === totalCost;
  }

  private decimalToNumber(value: Decimal): number {
    return Number(value.toFixed(2));
  }

  private resolvePagination(query: ListProcurementQueryDto) {
    return {
      page: query.page ?? 1,
      limit: query.limit ?? 20,
    };
  }

  private extractFilters(query: ListProcurementQueryDto) {
    return {
      status: query.status,
      priority: query.priority,
      department: query.department,
    };
  }

  private buildPaginatedResponse(
    requests: ProcurementRequestWithRelations[],
    total: number,
    pagination: { page: number; limit: number },
  ) {
    return {
      requests: requests.map((request) => this.mapRequest(request)),
      page: pagination.page,
      limit: pagination.limit,
      total,
      totalPages: Math.ceil(total / pagination.limit) || 0,
    };
  }

  private mapRequest(request: ProcurementRequestWithRelations) {
    const totalCost = this.calculateTotalCost(request);

    return {
      id: request.id,
      organisationId: request.organisationId,
      requester: request.requester,
      title: request.title,
      description: request.description,
      justification: request.justification,
      department: request.department,
      estimatedBudget: this.decimalToNumber(request.estimatedBudget),
      currency: request.currency,
      priority: request.priority,
      status: request.status,
      requiredDeliveryDate: request.requiredDeliveryDate.toISOString(),
      items: request.items.map((item) => ({
        id: item.id,
        description: item.description,
        quantity: item.quantity,
        unitPrice: this.decimalToNumber(item.unitPrice),
        totalPrice: this.decimalToNumber(item.totalPrice),
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
      })),
      totalCost,
      createdAt: request.createdAt.toISOString(),
      updatedAt: request.updatedAt.toISOString(),
    };
  }
}
