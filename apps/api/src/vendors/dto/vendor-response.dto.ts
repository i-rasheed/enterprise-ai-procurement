import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ComplianceStatus, VendorStatus } from '@prisma/client';

export class VendorResponseDto {
  @ApiProperty({ example: 'clxvendor123' })
  id: string;

  @ApiProperty({ example: 'clxorg456' })
  organisationId: string;

  @ApiProperty({ example: 'Globex Supplies Ltd' })
  name: string;

  @ApiProperty({ example: 'contact@globex.com' })
  email: string;

  @ApiPropertyOptional({ example: '+1-555-0100', nullable: true })
  phone: string | null;

  @ApiPropertyOptional({ example: '123 Industrial Way, Lagos', nullable: true })
  address: string | null;

  @ApiPropertyOptional({ example: 'https://globex.com', nullable: true })
  website: string | null;

  @ApiPropertyOptional({ example: 'RC-123456', nullable: true })
  registrationNumber: string | null;

  @ApiPropertyOptional({ example: 'TIN-987654', nullable: true })
  taxIdentificationNumber: string | null;

  @ApiPropertyOptional({ example: 'Office Supplies', nullable: true })
  category: string | null;

  @ApiProperty({ enum: VendorStatus, example: VendorStatus.ACTIVE })
  status: VendorStatus;

  @ApiPropertyOptional({ example: 4.5, nullable: true })
  rating: number | null;

  @ApiProperty({ enum: ComplianceStatus, example: ComplianceStatus.PENDING })
  complianceStatus: ComplianceStatus;

  @ApiPropertyOptional({ example: 'Preferred supplier.', nullable: true })
  notes: string | null;

  @ApiProperty({ example: '2026-08-01T10:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-08-01T10:00:00.000Z' })
  updatedAt: Date;
}

export class PaginatedVendorResponseDto {
  @ApiProperty({ type: [VendorResponseDto] })
  vendors: VendorResponseDto[];

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 20 })
  limit: number;

  @ApiProperty({ example: 42 })
  total: number;

  @ApiProperty({ example: 3 })
  totalPages: number;
}

export class DeleteVendorResponseDto {
  @ApiProperty({ example: 'Vendor deleted successfully' })
  message: string;
}
