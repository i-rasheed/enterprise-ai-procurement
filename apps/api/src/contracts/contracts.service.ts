import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  BidStatus,
  ContractStatus,
  PurchaseOrderStatus,
  Role,
} from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

import { EvaluationRepository } from '../bid-evaluations/evaluation.repository';
import { PurchaseOrderRepository } from '../purchase-orders/purchase-order.repository';
import { CONTRACT_MANAGE_ROLES } from './constants/contract-role.constants';
import {
  ContractRepository,
  ContractWithRelations,
} from './contract.repository';
import { CreateContractDto } from './dto/create-contract.dto';
import { ListContractQueryDto } from './dto/list-contract-query.dto';
import { RenewContractDto } from './dto/renew-contract.dto';
import { TerminateContractDto } from './dto/terminate-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';
import { UploadContractDocumentDto } from './dto/upload-contract-document.dto';

const ELIGIBLE_PO_STATUSES: PurchaseOrderStatus[] = [
  PurchaseOrderStatus.ISSUED,
  PurchaseOrderStatus.ACKNOWLEDGED,
  PurchaseOrderStatus.PARTIALLY_DELIVERED,
  PurchaseOrderStatus.COMPLETED,
];

const EDITABLE_STATUSES: ContractStatus[] = [
  ContractStatus.DRAFT,
  ContractStatus.UNDER_REVIEW,
];

const READ_ONLY_STATUSES: ContractStatus[] = [
  ContractStatus.EXPIRED,
  ContractStatus.TERMINATED,
];

type ContractSource = {
  vendorId: string;
  procurementRequestId: string;
  awardId?: string;
  purchaseOrderId?: string;
  value: number;
  currency: string;
};

@Injectable()
export class ContractsService {
  constructor(
    private readonly contractRepository: ContractRepository,
    private readonly evaluationRepository: EvaluationRepository,
    private readonly purchaseOrderRepository: PurchaseOrderRepository,
  ) {}

  async create(
    organisationId: string,
    userId: string,
    userRole: Role,
    dto: CreateContractDto,
  ) {
    this.assertCanManage(userRole);

    if (!dto.awardId && !dto.purchaseOrderId) {
      throw new BadRequestException(
        'Contract must be created from an award or purchase order',
      );
    }

    if (dto.awardId && dto.purchaseOrderId) {
      throw new BadRequestException(
        'Provide either awardId or purchaseOrderId, not both',
      );
    }

    const source = dto.awardId
      ? await this.resolveAwardSource(dto.awardId, organisationId)
      : await this.resolvePurchaseOrderSource(
          dto.purchaseOrderId!,
          organisationId,
        );

    if (new Date(dto.endDate) <= new Date(dto.startDate)) {
      throw new BadRequestException('End date must be after start date');
    }

    const contractNumber = await this.generateContractNumber(organisationId);

    const contract = await this.contractRepository.create({
      contractNumber,
      status: ContractStatus.DRAFT,
      title: dto.title,
      description: dto.description,
      contractType: dto.contractType,
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
      value: new Decimal(dto.value.toFixed(2)),
      currency: dto.currency ?? source.currency,
      renewalType: dto.renewalType,
      renewalDate: dto.renewalDate ? new Date(dto.renewalDate) : undefined,
      autoRenew: dto.autoRenew ?? false,
      signedByOrganisation: dto.signedByOrganisation,
      signedByVendor: dto.signedByVendor,
      organisation: { connect: { id: organisationId } },
      vendor: { connect: { id: source.vendorId } },
      procurementRequest: { connect: { id: source.procurementRequestId } },
      ...(source.purchaseOrderId
        ? { purchaseOrder: { connect: { id: source.purchaseOrderId } } }
        : {}),
      ...(source.awardId ? { award: { connect: { id: source.awardId } } } : {}),
      createdBy: { connect: { id: userId } },
    });

    await this.contractRepository.createVersion({
      contract: { connect: { id: contract.id } },
      version: 1,
      changeSummary: 'Initial contract created.',
      createdBy: { connect: { id: userId } },
    });

    const refreshed = await this.getContractOrThrow(
      organisationId,
      contract.id,
    );

    return this.mapContract(refreshed);
  }

  async findAll(
    organisationId: string,
    userEmail: string,
    userRole: Role,
    query: ListContractQueryDto,
  ) {
    const pagination = this.resolvePagination(query);
    const filters = {
      status: query.status,
      contractType: query.contractType,
      vendorId: query.vendorId,
    };
    const searchTerm = query.search?.trim();

    const [contracts, total] = searchTerm
      ? await this.contractRepository.search(
          organisationId,
          searchTerm,
          filters,
          pagination,
        )
      : await this.contractRepository.paginate(
          organisationId,
          filters,
          pagination,
        );

    const filtered = contracts.filter((contract) =>
      this.canViewContract(userEmail, userRole, contract.vendor.email),
    );

    return this.buildPaginatedResponse(filtered, total, pagination);
  }

  async findOne(
    organisationId: string,
    userEmail: string,
    userRole: Role,
    id: string,
  ) {
    const contract = await this.getContractOrThrow(organisationId, id);

    this.assertCanViewContract(userEmail, userRole, contract);

    return this.mapContract(contract);
  }

  async update(
    organisationId: string,
    userRole: Role,
    userId: string,
    id: string,
    dto: UpdateContractDto,
  ) {
    this.assertCanManage(userRole);

    const contract = await this.getContractOrThrow(organisationId, id);

    this.assertEditable(contract);

    const startDate = dto.startDate
      ? new Date(dto.startDate)
      : contract.startDate;
    const endDate = dto.endDate ? new Date(dto.endDate) : contract.endDate;

    if (endDate <= startDate) {
      throw new BadRequestException('End date must be after start date');
    }

    await this.contractRepository.update(id, {
      ...(dto.title !== undefined ? { title: dto.title } : {}),
      ...(dto.description !== undefined
        ? { description: dto.description }
        : {}),
      ...(dto.contractType !== undefined
        ? { contractType: dto.contractType }
        : {}),
      ...(dto.startDate !== undefined ? { startDate } : {}),
      ...(dto.endDate !== undefined ? { endDate } : {}),
      ...(dto.value !== undefined
        ? { value: new Decimal(dto.value.toFixed(2)) }
        : {}),
      ...(dto.renewalType !== undefined
        ? { renewalType: dto.renewalType }
        : {}),
      ...(dto.renewalDate !== undefined
        ? { renewalDate: new Date(dto.renewalDate) }
        : {}),
      ...(dto.autoRenew !== undefined ? { autoRenew: dto.autoRenew } : {}),
      ...(dto.signedByOrganisation !== undefined
        ? { signedByOrganisation: dto.signedByOrganisation }
        : {}),
      ...(dto.signedByVendor !== undefined
        ? { signedByVendor: dto.signedByVendor }
        : {}),
    });

    await this.recordVersion(
      id,
      userId,
      dto.changeSummary ?? 'Contract details updated.',
    );

    const refreshed = await this.getContractOrThrow(organisationId, id);

    return this.mapContract(refreshed);
  }

  async delete(organisationId: string, userRole: Role, id: string) {
    this.assertCanManage(userRole);

    const contract = await this.getContractOrThrow(organisationId, id);

    if (contract.status !== ContractStatus.DRAFT) {
      throw new BadRequestException('Only draft contracts can be deleted');
    }

    await this.contractRepository.delete(id);

    return { message: 'Contract deleted successfully' };
  }

  async activate(
    organisationId: string,
    userRole: Role,
    userId: string,
    id: string,
  ) {
    this.assertCanManage(userRole);

    const contract = await this.getContractOrThrow(organisationId, id);

    if (
      contract.status !== ContractStatus.DRAFT &&
      contract.status !== ContractStatus.UNDER_REVIEW
    ) {
      throw new BadRequestException(
        'Only draft or under-review contracts can be activated',
      );
    }

    const activated = await this.contractRepository.activate(id);

    await this.recordVersion(id, userId, 'Contract activated.');

    return this.mapContract(activated);
  }

  async renew(
    organisationId: string,
    userRole: Role,
    userId: string,
    id: string,
    dto: RenewContractDto,
  ) {
    this.assertCanManage(userRole);

    const contract = await this.getContractOrThrow(organisationId, id);

    if (contract.status !== ContractStatus.ACTIVE) {
      throw new BadRequestException('Only active contracts can be renewed');
    }

    if (new Date(dto.endDate) <= new Date(dto.startDate)) {
      throw new BadRequestException('End date must be after start date');
    }

    await this.recordVersion(
      id,
      userId,
      `Contract period ended (${contract.startDate.toISOString()} to ${contract.endDate.toISOString()}). ${dto.changeSummary}`,
    );

    const renewed = await this.contractRepository.renew(id, {
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
      ...(dto.value !== undefined
        ? { value: new Decimal(dto.value.toFixed(2)) }
        : {}),
      ...(dto.renewalDate !== undefined
        ? { renewalDate: new Date(dto.renewalDate) }
        : {}),
    });

    await this.recordVersion(
      id,
      userId,
      `Contract renewed for new period (${dto.startDate} to ${dto.endDate}).`,
    );

    return this.mapContract(renewed);
  }

  async terminate(
    organisationId: string,
    userRole: Role,
    userId: string,
    id: string,
    dto: TerminateContractDto,
  ) {
    this.assertCanManage(userRole);

    const contract = await this.getContractOrThrow(organisationId, id);

    if (contract.status === ContractStatus.TERMINATED) {
      throw new BadRequestException('Contract is already terminated');
    }

    if (contract.status === ContractStatus.EXPIRED) {
      throw new BadRequestException('Expired contracts cannot be terminated');
    }

    const terminated = await this.contractRepository.terminate(id);

    await this.recordVersion(id, userId, `Contract terminated: ${dto.reason}`);

    return this.mapContract(terminated);
  }

  async expire(
    organisationId: string,
    userRole: Role,
    userId: string,
    id: string,
  ) {
    this.assertCanManage(userRole);

    const contract = await this.getContractOrThrow(organisationId, id);

    if (contract.status !== ContractStatus.ACTIVE) {
      throw new BadRequestException('Only active contracts can be expired');
    }

    const expired = await this.contractRepository.expire(id);

    await this.recordVersion(id, userId, 'Contract marked as expired.');

    return this.mapContract(expired);
  }

  async uploadDocument(
    organisationId: string,
    userRole: Role,
    userId: string,
    id: string,
    dto: UploadContractDocumentDto,
  ) {
    this.assertCanManage(userRole);

    const contract = await this.getContractOrThrow(organisationId, id);

    if (READ_ONLY_STATUSES.includes(contract.status)) {
      throw new BadRequestException(
        'Documents cannot be uploaded to expired or terminated contracts',
      );
    }

    const document = await this.contractRepository.uploadDocument({
      fileName: dto.fileName,
      fileUrl: dto.fileUrl,
      mimeType: dto.mimeType,
      contract: { connect: { id } },
      uploadedBy: { connect: { id: userId } },
    });

    await this.recordVersion(id, userId, `Document uploaded: ${dto.fileName}`);

    const refreshed = await this.getContractOrThrow(organisationId, id);

    return {
      contract: this.mapContract(refreshed),
      document: {
        id: document.id,
        fileName: document.fileName,
        fileUrl: document.fileUrl,
        mimeType: document.mimeType,
        uploadedBy: document.uploadedBy,
        uploadedAt: document.uploadedAt.toISOString(),
      },
    };
  }

  async history(
    organisationId: string,
    userEmail: string,
    userRole: Role,
    id: string,
  ) {
    const contract = await this.getContractOrThrow(organisationId, id);

    this.assertCanViewContract(userEmail, userRole, contract);

    const versions = await this.contractRepository.history(id);

    return {
      contractId: id,
      versions: versions.map((version) => this.mapVersion(version)),
    };
  }

  private async resolveAwardSource(
    awardId: string,
    organisationId: string,
  ): Promise<ContractSource> {
    const award = await this.evaluationRepository.findAwardWithBidItems(
      awardId,
      organisationId,
    );

    if (!award) {
      throw new NotFoundException('Award not found');
    }

    if (award.bid.status !== BidStatus.AWARDED) {
      throw new BadRequestException(
        'Contracts can only be created from awarded bids',
      );
    }

    return {
      vendorId: award.bid.vendorId,
      procurementRequestId: award.procurementRequestId,
      awardId: award.id,
      value: Number(award.bid.totalAmount.toFixed(2)),
      currency: award.bid.currency,
    };
  }

  private async resolvePurchaseOrderSource(
    purchaseOrderId: string,
    organisationId: string,
  ): Promise<ContractSource> {
    const purchaseOrder = await this.purchaseOrderRepository.findById(
      purchaseOrderId,
      organisationId,
    );

    if (!purchaseOrder) {
      throw new NotFoundException('Purchase order not found');
    }

    if (!ELIGIBLE_PO_STATUSES.includes(purchaseOrder.status)) {
      throw new BadRequestException(
        'Contracts can only be created from approved purchase orders',
      );
    }

    return {
      vendorId: purchaseOrder.vendorId,
      procurementRequestId: purchaseOrder.procurementRequestId,
      awardId: purchaseOrder.awardId,
      purchaseOrderId: purchaseOrder.id,
      value: Number(purchaseOrder.totalAmount.toFixed(2)),
      currency: purchaseOrder.currency,
    };
  }

  private async recordVersion(
    contractId: string,
    userId: string,
    changeSummary: string,
  ) {
    const version =
      await this.contractRepository.getNextVersionNumber(contractId);

    await this.contractRepository.createVersion({
      contract: { connect: { id: contractId } },
      version,
      changeSummary,
      createdBy: { connect: { id: userId } },
    });
  }

  private async getContractOrThrow(organisationId: string, id: string) {
    const contract = await this.contractRepository.findById(id, organisationId);

    if (!contract) {
      throw new NotFoundException('Contract not found');
    }

    return contract;
  }

  private assertCanManage(userRole: Role) {
    if (!CONTRACT_MANAGE_ROLES.includes(userRole)) {
      throw new ForbiddenException(
        'Insufficient permissions to manage contracts',
      );
    }
  }

  private assertCanViewContract(
    userEmail: string,
    userRole: Role,
    contract: ContractWithRelations,
  ) {
    if (!this.canViewContract(userEmail, userRole, contract.vendor.email)) {
      throw new ForbiddenException('You cannot view this contract');
    }
  }

  private canViewContract(
    userEmail: string,
    userRole: Role,
    vendorEmail: string,
  ) {
    if (CONTRACT_MANAGE_ROLES.includes(userRole)) {
      return true;
    }

    if (userRole === Role.USER) {
      return userEmail.toLowerCase() === vendorEmail.toLowerCase();
    }

    return false;
  }

  private assertEditable(contract: ContractWithRelations) {
    if (READ_ONLY_STATUSES.includes(contract.status)) {
      throw new BadRequestException(
        'Expired or terminated contracts cannot be edited',
      );
    }

    if (contract.status === ContractStatus.TERMINATED) {
      throw new BadRequestException(
        'Terminated contracts cannot be reactivated',
      );
    }

    if (!EDITABLE_STATUSES.includes(contract.status)) {
      throw new BadRequestException(
        'Only draft or under-review contracts can be edited',
      );
    }
  }

  private async generateContractNumber(organisationId: string) {
    const count =
      await this.contractRepository.countByOrganisation(organisationId);
    const year = new Date().getFullYear();

    return `CTR-${year}-${String(count + 1).padStart(6, '0')}`;
  }

  private resolvePagination(query: ListContractQueryDto) {
    return {
      page: query.page ?? 1,
      limit: query.limit ?? 20,
    };
  }

  private buildPaginatedResponse(
    contracts: ContractWithRelations[],
    total: number,
    pagination: { page: number; limit: number },
  ) {
    return {
      contracts: contracts.map((contract) => this.mapContract(contract)),
      page: pagination.page,
      limit: pagination.limit,
      total,
      totalPages: Math.ceil(total / pagination.limit) || 0,
    };
  }

  private mapVersion(version: {
    id: string;
    version: number;
    changeSummary: string;
    createdBy: ContractWithRelations['createdBy'];
    createdAt: Date;
  }) {
    return {
      id: version.id,
      version: version.version,
      changeSummary: version.changeSummary,
      createdBy: version.createdBy,
      createdAt: version.createdAt.toISOString(),
    };
  }

  private mapContract(contract: ContractWithRelations) {
    return {
      id: contract.id,
      contractNumber: contract.contractNumber,
      organisationId: contract.organisationId,
      vendor: contract.vendor,
      procurementRequestId: contract.procurementRequestId,
      purchaseOrderId: contract.purchaseOrderId,
      awardId: contract.awardId,
      title: contract.title,
      description: contract.description,
      contractType: contract.contractType,
      startDate: contract.startDate.toISOString(),
      endDate: contract.endDate.toISOString(),
      value: Number(contract.value.toFixed(2)),
      currency: contract.currency,
      renewalType: contract.renewalType,
      renewalDate: contract.renewalDate?.toISOString() ?? null,
      autoRenew: contract.autoRenew,
      status: contract.status,
      signedByOrganisation: contract.signedByOrganisation,
      signedByVendor: contract.signedByVendor,
      createdBy: contract.createdBy,
      documents: contract.documents.map((doc) => ({
        id: doc.id,
        fileName: doc.fileName,
        fileUrl: doc.fileUrl,
        mimeType: doc.mimeType,
        uploadedBy: doc.uploadedBy,
        uploadedAt: doc.uploadedAt.toISOString(),
      })),
      createdAt: contract.createdAt.toISOString(),
      updatedAt: contract.updatedAt.toISOString(),
    };
  }
}
