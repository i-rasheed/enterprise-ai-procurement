import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { InvoiceStatus, MatchStatus, Role } from '@prisma/client';

export class InvoiceVendorDto {
  @ApiProperty({ example: 'clxvendor123' })
  id: string;

  @ApiProperty({ example: 'Globex Supplies Ltd' })
  name: string;

  @ApiProperty({ example: 'vendor@globex.com' })
  email: string;
}

export class InvoiceItemResponseDto {
  @ApiProperty({ example: 'clxinvitem123' })
  id: string;

  @ApiProperty({ example: 'clxpoitem123' })
  purchaseOrderItemId: string;

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

export class MatchingResultUserDto {
  @ApiProperty({ example: 'clx123abc456def' })
  id: string;

  @ApiProperty({ example: 'finance@acme.com' })
  email: string;

  @ApiProperty({ example: 'Finance' })
  firstName: string;

  @ApiProperty({ example: 'Manager' })
  lastName: string;

  @ApiProperty({ enum: Role, example: Role.FINANCE })
  role: Role;
}

export class MatchingResultResponseDto {
  @ApiProperty({ example: 'clxmatch123' })
  id: string;

  @ApiProperty({ example: 'clxinv123' })
  invoiceId: string;

  @ApiProperty({ example: 'clxpo123' })
  purchaseOrderId: string;

  @ApiProperty({ example: 'clxgrn123' })
  goodsReceiptId: string;

  @ApiProperty({ enum: MatchStatus, example: MatchStatus.MATCHED })
  matchStatus: MatchStatus;

  @ApiProperty({ type: MatchingResultUserDto })
  matchedBy: MatchingResultUserDto;

  @ApiProperty({ example: '2026-08-01T12:00:00.000Z' })
  matchedAt: string;

  @ApiPropertyOptional({
    example: [{ field: 'unitPrice', message: 'Unit price mismatch on line 1' }],
  })
  discrepancies: Record<string, unknown>[] | null;

  @ApiProperty({ example: '2026-08-01T12:00:00.000Z' })
  createdAt: string;

  @ApiProperty({ example: '2026-08-01T12:00:00.000Z' })
  updatedAt: string;
}

export class InvoiceResponseDto {
  @ApiProperty({ example: 'clxinv123' })
  id: string;

  @ApiProperty({ example: 'INV-2026-000001' })
  invoiceNumber: string;

  @ApiProperty({ type: InvoiceVendorDto })
  vendor: InvoiceVendorDto;

  @ApiProperty({ example: 'clxpo123' })
  purchaseOrderId: string;

  @ApiProperty({ example: 'clxgrn123' })
  goodsReceiptId: string;

  @ApiProperty({ example: 'clxorg123' })
  organisationId: string;

  @ApiProperty({ example: '2026-10-01T00:00:00.000Z' })
  invoiceDate: string;

  @ApiProperty({ example: '2026-10-31T00:00:00.000Z' })
  dueDate: string;

  @ApiProperty({ example: 2400.0 })
  subtotal: number;

  @ApiProperty({ example: 240.0 })
  taxAmount: number;

  @ApiProperty({ example: 2640.0 })
  totalAmount: number;

  @ApiProperty({ example: 'USD' })
  currency: string;

  @ApiPropertyOptional({ example: 'Net 30' })
  paymentTerms: string | null;

  @ApiProperty({ enum: InvoiceStatus, example: InvoiceStatus.DRAFT })
  status: InvoiceStatus;

  @ApiPropertyOptional({ example: 'Invoice for delivered office chairs.' })
  notes: string | null;

  @ApiProperty({ type: [InvoiceItemResponseDto] })
  items: InvoiceItemResponseDto[];

  @ApiPropertyOptional({ type: MatchingResultResponseDto })
  matchingResult: MatchingResultResponseDto | null;

  @ApiProperty({ example: '2026-08-01T10:00:00.000Z' })
  createdAt: string;

  @ApiProperty({ example: '2026-08-01T10:00:00.000Z' })
  updatedAt: string;
}

export class PaginatedInvoiceResponseDto {
  @ApiProperty({ type: [InvoiceResponseDto] })
  invoices: InvoiceResponseDto[];

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 20 })
  limit: number;

  @ApiProperty({ example: 1 })
  total: number;

  @ApiProperty({ example: 1 })
  totalPages: number;
}

export class DeleteInvoiceResponseDto {
  @ApiProperty({ example: 'Invoice deleted successfully' })
  message: string;
}

export class MatchInvoiceResponseDto {
  @ApiProperty({ type: InvoiceResponseDto })
  invoice: InvoiceResponseDto;

  @ApiProperty({ type: MatchingResultResponseDto })
  matchingResult: MatchingResultResponseDto;
}
