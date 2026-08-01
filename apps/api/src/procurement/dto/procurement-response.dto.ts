import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProcurementPriority, ProcurementStatus, Role } from '@prisma/client';

export class ProcurementRequesterDto {
  @ApiProperty({ example: 'clx123abc456def' })
  id: string;

  @ApiProperty({ example: 'admin@acme.com' })
  email: string;

  @ApiProperty({ example: 'Jane' })
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  lastName: string;
}

export class ProcurementItemResponseDto {
  @ApiProperty({ example: 'clxitem123' })
  id: string;

  @ApiProperty({ example: 'Ergonomic office chairs' })
  description: string;

  @ApiProperty({ example: 10 })
  quantity: number;

  @ApiProperty({ example: 250.0 })
  unitPrice: number;

  @ApiProperty({ example: 2500.0 })
  totalPrice: number;

  @ApiProperty({ example: '2026-08-01T10:00:00.000Z' })
  createdAt: string;

  @ApiProperty({ example: '2026-08-01T10:00:00.000Z' })
  updatedAt: string;
}

export class ProcurementRequestResponseDto {
  @ApiProperty({ example: 'clxprocurement123' })
  id: string;

  @ApiProperty({ example: 'clx789ghi012jkl' })
  organisationId: string;

  @ApiProperty({ type: ProcurementRequesterDto })
  requester: ProcurementRequesterDto;

  @ApiProperty({ example: 'Office furniture refresh Q3' })
  title: string;

  @ApiProperty({
    example: 'Replace aging chairs and desks across the Lagos office.',
  })
  description: string;

  @ApiProperty({
    example:
      'Current furniture is beyond repair and affecting staff productivity.',
  })
  justification: string;

  @ApiProperty({ example: 'Operations' })
  department: string;

  @ApiProperty({ example: 2500.0 })
  estimatedBudget: number;

  @ApiProperty({ example: 'USD' })
  currency: string;

  @ApiProperty({
    enum: ProcurementPriority,
    example: ProcurementPriority.MEDIUM,
  })
  priority: ProcurementPriority;

  @ApiProperty({ enum: ProcurementStatus, example: ProcurementStatus.DRAFT })
  status: ProcurementStatus;

  @ApiProperty({ example: '2026-10-31T00:00:00.000Z' })
  requiredDeliveryDate: string;

  @ApiProperty({ type: [ProcurementItemResponseDto] })
  items: ProcurementItemResponseDto[];

  @ApiPropertyOptional({
    example: 2500.0,
    description: 'Sum of all line item totals',
  })
  totalCost?: number;

  @ApiProperty({ example: '2026-08-01T10:00:00.000Z' })
  createdAt: string;

  @ApiProperty({ example: '2026-08-01T10:00:00.000Z' })
  updatedAt: string;
}

export class PaginatedProcurementResponseDto {
  @ApiProperty({ type: [ProcurementRequestResponseDto] })
  requests: ProcurementRequestResponseDto[];

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 20 })
  limit: number;

  @ApiProperty({ example: 1 })
  total: number;

  @ApiProperty({ example: 1 })
  totalPages: number;
}

export class DeleteProcurementResponseDto {
  @ApiProperty({ example: 'Procurement request deleted successfully' })
  message: string;
}

export class DeleteProcurementItemResponseDto {
  @ApiProperty({ example: 'Line item removed successfully' })
  message: string;
}

export class SubmitProcurementResponseDto extends ProcurementRequestResponseDto {
  @ApiPropertyOptional({ example: 'Ready for procurement review.' })
  submissionNote?: string;
}

export class ProcurementRequesterRoleExampleDto {
  @ApiProperty({ enum: Role, example: Role.USER })
  role: Role;
}
