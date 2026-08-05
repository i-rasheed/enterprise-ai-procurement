import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BidStatus, RFQStatus, Role } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

import { RFQRepository } from '../rfqs/rfq.repository';
import { VendorRepository } from '../vendors/vendor.repository';
import { BID_VIEW_ROLES } from './constants/bid-role.constants';
import { BidRepository, BidWithRelations } from './bid.repository';
import { CreateBidDto } from './dto/create-bid.dto';
import { CreateBidItemDto } from './dto/create-bid-item.dto';
import { ListBidQueryDto } from './dto/list-bid-query.dto';
import { SubmitBidDto } from './dto/submit-bid.dto';
import { UpdateBidDto } from './dto/update-bid.dto';
import { UploadBidAttachmentDto } from './dto/upload-bid-attachment.dto';

@Injectable()
export class BidsService {
  constructor(
    private readonly bidRepository: BidRepository,
    private readonly rfqRepository: RFQRepository,
    private readonly vendorRepository: VendorRepository,
  ) {}

  async create(
    organisationId: string,
    userId: string,
    userEmail: string,
    dto: CreateBidDto,
  ) {
    const rfq = await this.rfqRepository.findById(dto.rfqId, organisationId);

    if (!rfq) {
      throw new NotFoundException('RFQ not found');
    }

    if (rfq.status !== RFQStatus.PUBLISHED) {
      throw new BadRequestException(
        'Bids can only be created for published RFQs',
      );
    }

    if (new Date() > rfq.closingDate) {
      throw new BadRequestException('RFQ closing date has passed');
    }

    const vendor = await this.vendorRepository.findById(
      dto.vendorId,
      organisationId,
    );

    if (!vendor) {
      throw new NotFoundException('Vendor not found');
    }

    this.assertVendorRepresentative(userEmail, vendor.email);

    await this.assertVendorInvited(dto.rfqId, dto.vendorId);

    const existing = await this.bidRepository.findActiveByRfqAndVendor(
      dto.rfqId,
      dto.vendorId,
    );

    if (existing) {
      throw new ConflictException(
        'An active bid already exists for this vendor on this RFQ',
      );
    }

    const bidNumber = await this.generateBidNumber(organisationId);

    const bid = await this.bidRepository.create({
      bidNumber,
      currency: dto.currency ?? 'USD',
      deliveryPeriod: dto.deliveryPeriod,
      paymentTerms: dto.paymentTerms,
      warrantyPeriod: dto.warrantyPeriod,
      notes: dto.notes,
      status: BidStatus.DRAFT,
      totalAmount: new Decimal(0),
      rfq: { connect: { id: dto.rfqId } },
      vendor: { connect: { id: dto.vendorId } },
      submittedBy: { connect: { id: userId } },
    });

    return this.mapBid(bid);
  }

  async findAll(
    organisationId: string,
    userEmail: string,
    userRole: Role,
    query: ListBidQueryDto,
  ) {
    this.assertCanViewAll(userRole);

    const pagination = this.resolvePagination(query);
    const filters = { status: query.status };
    const searchTerm = query.search?.trim();

    const [bids, total] = searchTerm
      ? await this.bidRepository.search(
          organisationId,
          searchTerm,
          filters,
          pagination,
        )
      : await this.bidRepository.paginate(organisationId, filters, pagination);

    return this.buildPaginatedResponse(bids, total, pagination);
  }

  async findOne(
    organisationId: string,
    userEmail: string,
    userRole: Role,
    id: string,
  ) {
    const bid = await this.getBidOrThrow(organisationId, id);

    this.assertCanViewBid(userEmail, userRole, bid);

    return this.mapBid(bid);
  }

  async update(
    organisationId: string,
    userEmail: string,
    id: string,
    dto: UpdateBidDto,
  ) {
    const bid = await this.getBidOrThrow(organisationId, id);

    this.assertDraftOwner(userEmail, bid);

    const updated = await this.bidRepository.update(id, dto);

    return this.mapBid(updated);
  }

  async deleteDraft(organisationId: string, userEmail: string, id: string) {
    const bid = await this.getBidOrThrow(organisationId, id);

    this.assertDraftOwner(userEmail, bid);

    await this.bidRepository.delete(id);

    return { message: 'Bid deleted successfully' };
  }

  async submit(
    organisationId: string,
    userEmail: string,
    id: string,
    dto: SubmitBidDto,
  ) {
    const bid = await this.getBidOrThrow(organisationId, id);

    this.assertDraftOwner(userEmail, bid);
    this.assertRfqOpen(bid);

    if (bid.items.length === 0) {
      throw new BadRequestException('Cannot submit a bid with no line items');
    }

    const totalCost = this.calculateTotalCost(bid);

    if (!this.amountsMatch(bid.totalAmount, totalCost)) {
      throw new BadRequestException(
        'Total bid amount must equal the sum of bid item totals',
      );
    }

    const submitted = await this.bidRepository.submit(
      id,
      new Decimal(totalCost.toFixed(2)),
    );
    const mapped = this.mapBid(submitted);

    return {
      ...mapped,
      submissionNote: dto.submissionNote,
    };
  }

  async withdraw(organisationId: string, userEmail: string, id: string) {
    const bid = await this.getBidOrThrow(organisationId, id);

    this.assertVendorRepresentative(userEmail, bid.vendor.email);

    if (bid.status !== BidStatus.SUBMITTED) {
      throw new BadRequestException('Only submitted bids can be withdrawn');
    }

    if (this.isRfqClosed(bid)) {
      throw new BadRequestException(
        'Cannot withdraw a bid after the RFQ has closed',
      );
    }

    const withdrawn = await this.bidRepository.withdraw(id);

    return this.mapBid(withdrawn);
  }

  async addItem(
    organisationId: string,
    userEmail: string,
    bidId: string,
    dto: CreateBidItemDto,
  ) {
    const bid = await this.getBidOrThrow(organisationId, bidId);

    this.assertDraftOwner(userEmail, bid);

    const totalPrice = this.calculateLineTotal(dto.quantity, dto.unitPrice);

    await this.bidRepository.addItem({
      description: dto.description,
      quantity: dto.quantity,
      unitPrice: new Decimal(dto.unitPrice),
      totalPrice: new Decimal(totalPrice),
      bid: { connect: { id: bidId } },
    });

    const refreshed = await this.bidRepository.recalculateTotal(bidId);

    return this.mapBid(refreshed);
  }

  async removeItem(organisationId: string, userEmail: string, itemId: string) {
    const item = await this.bidRepository.findItemById(itemId);

    if (!item) {
      throw new NotFoundException('Bid item not found');
    }

    const bid = await this.getBidOrThrow(organisationId, item.bidId);

    this.assertDraftOwner(userEmail, bid);

    await this.bidRepository.deleteItem(itemId);
    await this.bidRepository.recalculateTotal(item.bidId);

    return { message: 'Bid item removed successfully' };
  }

  async addAttachment(
    organisationId: string,
    userEmail: string,
    bidId: string,
    dto: UploadBidAttachmentDto,
  ) {
    const bid = await this.getBidOrThrow(organisationId, bidId);

    this.assertDraftOwner(userEmail, bid);

    await this.bidRepository.addAttachment({
      fileName: dto.fileName,
      fileUrl: dto.fileUrl,
      fileType: dto.fileType,
      bid: { connect: { id: bidId } },
    });

    const refreshed = await this.getBidOrThrow(organisationId, bidId);

    return this.mapBid(refreshed);
  }

  async findByVendor(
    organisationId: string,
    userEmail: string,
    userRole: Role,
    vendorId: string,
  ) {
    const vendor = await this.vendorRepository.findById(
      vendorId,
      organisationId,
    );

    if (!vendor) {
      throw new NotFoundException('Vendor not found');
    }

    if (!this.canViewVendorBids(userEmail, userRole, vendor.email)) {
      throw new ForbiddenException('You cannot view bids for this vendor');
    }

    const bids = await this.bidRepository.findByVendor(
      vendorId,
      organisationId,
    );

    return {
      bids: bids.map((bid) => this.mapBid(bid)),
    };
  }

  async findByRfq(organisationId: string, userRole: Role, rfqId: string) {
    this.assertCanViewAll(userRole);

    const rfq = await this.rfqRepository.findById(rfqId, organisationId);

    if (!rfq) {
      throw new NotFoundException('RFQ not found');
    }

    const bids = await this.bidRepository.findByRfq(rfqId, organisationId);

    return {
      bids: bids.map((bid) => this.mapBid(bid)),
    };
  }

  private async getBidOrThrow(organisationId: string, id: string) {
    const bid = await this.bidRepository.findById(id, organisationId);

    if (!bid) {
      throw new NotFoundException('Bid not found');
    }

    return bid;
  }

  private async assertVendorInvited(rfqId: string, vendorId: string) {
    const invitation = await this.rfqRepository.findVendorInvitation(
      rfqId,
      vendorId,
    );

    if (!invitation) {
      throw new ForbiddenException('Vendor is not invited to this RFQ');
    }
  }

  private assertVendorRepresentative(userEmail: string, vendorEmail: string) {
    if (userEmail.toLowerCase() !== vendorEmail.toLowerCase()) {
      throw new ForbiddenException(
        'Only the invited vendor representative can perform this action',
      );
    }
  }

  private assertDraftOwner(userEmail: string, bid: BidWithRelations) {
    if (bid.status !== BidStatus.DRAFT) {
      throw new BadRequestException('Only draft bids can be modified');
    }

    this.assertVendorRepresentative(userEmail, bid.vendor.email);
  }

  private assertCanViewAll(userRole: Role) {
    if (!BID_VIEW_ROLES.includes(userRole)) {
      throw new ForbiddenException('Insufficient permissions to view all bids');
    }
  }

  private assertCanViewBid(
    userEmail: string,
    userRole: Role,
    bid: BidWithRelations,
  ) {
    if (BID_VIEW_ROLES.includes(userRole)) {
      return;
    }

    this.assertVendorRepresentative(userEmail, bid.vendor.email);
  }

  private canViewVendorBids(
    userEmail: string,
    userRole: Role,
    vendorEmail: string,
  ) {
    if (BID_VIEW_ROLES.includes(userRole)) {
      return true;
    }

    return userEmail.toLowerCase() === vendorEmail.toLowerCase();
  }

  private assertRfqOpen(bid: BidWithRelations) {
    if (bid.rfq.status !== RFQStatus.PUBLISHED) {
      throw new BadRequestException('RFQ is not open for bid submission');
    }

    if (new Date() > bid.rfq.closingDate) {
      throw new BadRequestException('RFQ closing date has passed');
    }
  }

  private isRfqClosed(bid: BidWithRelations) {
    return (
      bid.rfq.status === RFQStatus.CLOSED ||
      bid.rfq.status === RFQStatus.CANCELLED ||
      new Date() > bid.rfq.closingDate
    );
  }

  private calculateTotalCost(bid: BidWithRelations): number {
    return bid.items.reduce(
      (sum, item) => sum + this.decimalToNumber(item.totalPrice),
      0,
    );
  }

  private calculateLineTotal(quantity: number, unitPrice: number): number {
    return Number((quantity * unitPrice).toFixed(2));
  }

  private amountsMatch(totalAmount: Decimal, totalCost: number): boolean {
    return this.decimalToNumber(totalAmount) === totalCost;
  }

  private decimalToNumber(value: Decimal): number {
    return Number(value.toFixed(2));
  }

  private async generateBidNumber(organisationId: string) {
    const count = await this.bidRepository.countByOrganisation(organisationId);
    const year = new Date().getFullYear();

    return `BID-${year}-${String(count + 1).padStart(6, '0')}`;
  }

  private resolvePagination(query: ListBidQueryDto) {
    return {
      page: query.page ?? 1,
      limit: query.limit ?? 20,
    };
  }

  private buildPaginatedResponse(
    bids: BidWithRelations[],
    total: number,
    pagination: { page: number; limit: number },
  ) {
    return {
      bids: bids.map((bid) => this.mapBid(bid)),
      page: pagination.page,
      limit: pagination.limit,
      total,
      totalPages: Math.ceil(total / pagination.limit) || 0,
    };
  }

  private mapBid(bid: BidWithRelations) {
    return {
      id: bid.id,
      rfqId: bid.rfqId,
      rfq: {
        id: bid.rfq.id,
        rfqNumber: bid.rfq.rfqNumber,
        title: bid.rfq.title,
      },
      vendor: bid.vendor,
      submittedBy: bid.submittedBy,
      bidNumber: bid.bidNumber,
      totalAmount: this.decimalToNumber(bid.totalAmount),
      currency: bid.currency,
      deliveryPeriod: bid.deliveryPeriod,
      paymentTerms: bid.paymentTerms,
      warrantyPeriod: bid.warrantyPeriod,
      notes: bid.notes,
      status: bid.status,
      submittedAt: bid.submittedAt?.toISOString() ?? null,
      items: bid.items.map((item) => ({
        id: item.id,
        description: item.description,
        quantity: item.quantity,
        unitPrice: this.decimalToNumber(item.unitPrice),
        totalPrice: this.decimalToNumber(item.totalPrice),
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
      })),
      attachments: bid.attachments.map((attachment) => ({
        id: attachment.id,
        fileName: attachment.fileName,
        fileUrl: attachment.fileUrl,
        fileType: attachment.fileType,
        uploadedAt: attachment.uploadedAt.toISOString(),
      })),
      createdAt: bid.createdAt.toISOString(),
      updatedAt: bid.updatedAt.toISOString(),
    };
  }
}
