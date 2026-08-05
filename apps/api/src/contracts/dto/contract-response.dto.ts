import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ContractStatus, ContractType, Role } from '@prisma/client';

export class ContractUserDto {
  @ApiProperty({ example: 'clx123abc456def' })
  id: string;

  @ApiProperty({ example: 'admin@acme.com' })
  email: string;

  @ApiProperty({ example: 'Jane' })
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  lastName: string;

  @ApiProperty({ enum: Role, example: Role.ADMIN })
  role: Role;
}

export class ContractVendorDto {
  @ApiProperty({ example: 'clxvendor123' })
  id: string;

  @ApiProperty({ example: 'Globex Supplies Ltd' })
  name: string;

  @ApiProperty({ example: 'vendor@globex.com' })
  email: string;
}

export class ContractDocumentResponseDto {
  @ApiProperty({ example: 'clxdoc123' })
  id: string;

  @ApiProperty({ example: 'master-services-agreement.pdf' })
  fileName: string;

  @ApiProperty({
    example:
      'https://storage.example.com/contracts/master-services-agreement.pdf',
  })
  fileUrl: string;

  @ApiProperty({ example: 'application/pdf' })
  mimeType: string;

  @ApiProperty({ type: ContractUserDto })
  uploadedBy: ContractUserDto;

  @ApiProperty({ example: '2026-08-01T10:00:00.000Z' })
  uploadedAt: string;
}

export class ContractVersionResponseDto {
  @ApiProperty({ example: 'clxversion123' })
  id: string;

  @ApiProperty({ example: 1 })
  version: number;

  @ApiProperty({ example: 'Initial contract draft created.' })
  changeSummary: string;

  @ApiProperty({ type: ContractUserDto })
  createdBy: ContractUserDto;

  @ApiProperty({ example: '2026-08-01T10:00:00.000Z' })
  createdAt: string;
}

export class ContractResponseDto {
  @ApiProperty({ example: 'clxcontract123' })
  id: string;

  @ApiProperty({ example: 'CTR-2026-000001' })
  contractNumber: string;

  @ApiProperty({ example: 'clxorg123' })
  organisationId: string;

  @ApiProperty({ type: ContractVendorDto })
  vendor: ContractVendorDto;

  @ApiProperty({ example: 'clxprocurement123' })
  procurementRequestId: string;

  @ApiPropertyOptional({ example: 'clxpo123' })
  purchaseOrderId: string | null;

  @ApiPropertyOptional({ example: 'clxaward123' })
  awardId: string | null;

  @ApiProperty({ example: 'Office Furniture Supply Agreement' })
  title: string;

  @ApiProperty({
    example: 'Agreement for supply of ergonomic office furniture.',
  })
  description: string;

  @ApiProperty({ enum: ContractType, example: ContractType.GOODS })
  contractType: ContractType;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  startDate: string;

  @ApiProperty({ example: '2026-12-31T23:59:59.000Z' })
  endDate: string;

  @ApiProperty({ example: 24000.0 })
  value: number;

  @ApiProperty({ example: 'USD' })
  currency: string;

  @ApiPropertyOptional({ example: 'ANNUAL' })
  renewalType: string | null;

  @ApiPropertyOptional({ example: '2026-11-01T00:00:00.000Z' })
  renewalDate: string | null;

  @ApiProperty({ example: false })
  autoRenew: boolean;

  @ApiProperty({ enum: ContractStatus, example: ContractStatus.DRAFT })
  status: ContractStatus;

  @ApiPropertyOptional({ example: 'Jane Doe, Procurement Director' })
  signedByOrganisation: string | null;

  @ApiPropertyOptional({ example: 'Alex Supplier, Vendor Representative' })
  signedByVendor: string | null;

  @ApiProperty({ type: ContractUserDto })
  createdBy: ContractUserDto;

  @ApiProperty({ type: [ContractDocumentResponseDto] })
  documents: ContractDocumentResponseDto[];

  @ApiProperty({ example: '2026-08-01T10:00:00.000Z' })
  createdAt: string;

  @ApiProperty({ example: '2026-08-01T10:00:00.000Z' })
  updatedAt: string;
}

export class PaginatedContractResponseDto {
  @ApiProperty({ type: [ContractResponseDto] })
  contracts: ContractResponseDto[];

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 20 })
  limit: number;

  @ApiProperty({ example: 1 })
  total: number;

  @ApiProperty({ example: 1 })
  totalPages: number;
}

export class ContractHistoryResponseDto {
  @ApiProperty({ example: 'clxcontract123' })
  contractId: string;

  @ApiProperty({ type: [ContractVersionResponseDto] })
  versions: ContractVersionResponseDto[];
}

export class DeleteContractResponseDto {
  @ApiProperty({ example: 'Contract deleted successfully' })
  message: string;
}
