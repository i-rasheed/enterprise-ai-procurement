import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BidStatus, Role } from '@prisma/client';

export class BidSubmitterDto {
  @ApiProperty({ example: 'clx123abc456def' })
  id: string;

  @ApiProperty({ example: 'vendor@globex.com' })
  email: string;

  @ApiProperty({ example: 'Alex' })
  firstName: string;

  @ApiProperty({ example: 'Supplier' })
  lastName: string;

  @ApiProperty({ enum: Role, example: Role.USER })
  role: Role;
}

export class BidVendorDto {
  @ApiProperty({ example: 'clxvendor123' })
  id: string;

  @ApiProperty({ example: 'Globex Supplies Ltd' })
  name: string;

  @ApiProperty({ example: 'vendor@globex.com' })
  email: string;
}

export class BidRfqSummaryDto {
  @ApiProperty({ example: 'clxrfq123' })
  id: string;

  @ApiProperty({ example: 'RFQ-2026-000001' })
  rfqNumber: string;

  @ApiProperty({ example: 'Office Furniture RFQ Q3' })
  title: string;
}

export class BidItemResponseDto {
  @ApiProperty({ example: 'clxbiditem123' })
  id: string;

  @ApiProperty({ example: 'Ergonomic office chair model X200' })
  description: string;

  @ApiProperty({ example: 10 })
  quantity: number;

  @ApiProperty({ example: 240.0 })
  unitPrice: number;

  @ApiProperty({ example: 2400.0 })
  totalPrice: number;

  @ApiProperty({ example: '2026-08-01T10:00:00.000Z' })
  createdAt: string;

  @ApiProperty({ example: '2026-08-01T10:00:00.000Z' })
  updatedAt: string;
}

export class BidAttachmentResponseDto {
  @ApiProperty({ example: 'clxattachment123' })
  id: string;

  @ApiProperty({ example: 'quotation.pdf' })
  fileName: string;

  @ApiProperty({ example: 'https://storage.example.com/bids/quotation.pdf' })
  fileUrl: string;

  @ApiProperty({ example: 'application/pdf' })
  fileType: string;

  @ApiProperty({ example: '2026-08-01T10:00:00.000Z' })
  uploadedAt: string;
}

export class BidResponseDto {
  @ApiProperty({ example: 'clxbid123' })
  id: string;

  @ApiProperty({ example: 'clxrfq123' })
  rfqId: string;

  @ApiProperty({ type: BidRfqSummaryDto })
  rfq: BidRfqSummaryDto;

  @ApiProperty({ type: BidVendorDto })
  vendor: BidVendorDto;

  @ApiProperty({ type: BidSubmitterDto })
  submittedBy: BidSubmitterDto;

  @ApiProperty({ example: 'BID-2026-000001' })
  bidNumber: string;

  @ApiProperty({ example: 2400.0 })
  totalAmount: number;

  @ApiProperty({ example: 'USD' })
  currency: string;

  @ApiPropertyOptional({ example: '30 days from purchase order' })
  deliveryPeriod?: string | null;

  @ApiPropertyOptional({ example: 'Net 30' })
  paymentTerms?: string | null;

  @ApiPropertyOptional({ example: '12 months' })
  warrantyPeriod?: string | null;

  @ApiPropertyOptional({ example: 'Includes delivery and installation.' })
  notes?: string | null;

  @ApiProperty({ enum: BidStatus, example: BidStatus.DRAFT })
  status: BidStatus;

  @ApiPropertyOptional({ example: '2026-08-01T12:00:00.000Z' })
  submittedAt?: string | null;

  @ApiProperty({ type: [BidItemResponseDto] })
  items: BidItemResponseDto[];

  @ApiProperty({ type: [BidAttachmentResponseDto] })
  attachments: BidAttachmentResponseDto[];

  @ApiProperty({ example: '2026-08-01T10:00:00.000Z' })
  createdAt: string;

  @ApiProperty({ example: '2026-08-01T10:00:00.000Z' })
  updatedAt: string;
}

export class PaginatedBidResponseDto {
  @ApiProperty({ type: [BidResponseDto] })
  bids: BidResponseDto[];

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 20 })
  limit: number;

  @ApiProperty({ example: 1 })
  total: number;

  @ApiProperty({ example: 1 })
  totalPages: number;
}

export class DeleteBidResponseDto {
  @ApiProperty({ example: 'Bid deleted successfully' })
  message: string;
}

export class DeleteBidItemResponseDto {
  @ApiProperty({ example: 'Bid item removed successfully' })
  message: string;
}

export class SubmitBidResponseDto extends BidResponseDto {
  @ApiPropertyOptional({ example: 'Final quotation submitted for review.' })
  submissionNote?: string;
}

export class BidListResponseDto {
  @ApiProperty({ type: [BidResponseDto] })
  bids: BidResponseDto[];
}
