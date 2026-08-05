import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RFQStatus, Role, VendorInvitationStatus } from '@prisma/client';

export class RFQCreatorDto {
  @ApiProperty({ example: 'clx123abc456def' })
  id: string;

  @ApiProperty({ example: 'manager@globex.com' })
  email: string;

  @ApiProperty({ example: 'John' })
  firstName: string;

  @ApiProperty({ example: 'Smith' })
  lastName: string;

  @ApiProperty({ enum: Role, example: Role.PROCUREMENT_MANAGER })
  role: Role;
}

export class RFQVendorSummaryDto {
  @ApiProperty({ example: 'clxvendor123' })
  id: string;

  @ApiProperty({ example: 'Globex Supplies Ltd' })
  name: string;

  @ApiProperty({ example: 'contact@globex.com' })
  email: string;
}

export class RFQVendorResponseDto {
  @ApiProperty({ example: 'clxrfqvendor123' })
  id: string;

  @ApiProperty({ example: 'clxrfq123' })
  rfqId: string;

  @ApiProperty({ type: RFQVendorSummaryDto })
  vendor: RFQVendorSummaryDto;

  @ApiProperty({ example: '2026-08-01T10:00:00.000Z' })
  invitedAt: string;

  @ApiPropertyOptional({ example: null })
  respondedAt?: string | null;

  @ApiProperty({
    enum: VendorInvitationStatus,
    example: VendorInvitationStatus.INVITED,
  })
  status: VendorInvitationStatus;
}

export class RFQResponseDto {
  @ApiProperty({ example: 'clxrfq123' })
  id: string;

  @ApiProperty({ example: 'clxprocurement123' })
  procurementRequestId: string;

  @ApiProperty({ example: 'RFQ-2026-000001' })
  rfqNumber: string;

  @ApiProperty({ example: 'Office Furniture RFQ Q3' })
  title: string;

  @ApiProperty({
    example: 'Request for quotation for ergonomic office chairs and desks.',
  })
  description: string;

  @ApiProperty({ example: '2026-09-30T23:59:59.000Z' })
  closingDate: string;

  @ApiProperty({ enum: RFQStatus, example: RFQStatus.DRAFT })
  status: RFQStatus;

  @ApiProperty({ type: RFQCreatorDto })
  createdBy: RFQCreatorDto;

  @ApiPropertyOptional({ type: [RFQVendorResponseDto] })
  vendors?: RFQVendorResponseDto[];

  @ApiProperty({ example: '2026-08-01T10:00:00.000Z' })
  createdAt: string;

  @ApiProperty({ example: '2026-08-01T10:00:00.000Z' })
  updatedAt: string;
}

export class PaginatedRFQResponseDto {
  @ApiProperty({ type: [RFQResponseDto] })
  rfqs: RFQResponseDto[];

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 20 })
  limit: number;

  @ApiProperty({ example: 1 })
  total: number;

  @ApiProperty({ example: 1 })
  totalPages: number;
}

export class RFQVendorListResponseDto {
  @ApiProperty({ type: [RFQVendorResponseDto] })
  vendors: RFQVendorResponseDto[];
}

export class DeleteRFQResponseDto {
  @ApiProperty({ example: 'RFQ deleted successfully' })
  message: string;
}

export class PublishRFQResponseDto extends RFQResponseDto {
  @ApiPropertyOptional({ example: 'RFQ ready for vendor responses.' })
  publicationNote?: string;
}
