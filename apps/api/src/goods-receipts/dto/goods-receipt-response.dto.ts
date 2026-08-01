import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { GoodsReceiptStatus, Role } from '@prisma/client';

export class GoodsReceiptUserDto {
  @ApiProperty({ example: 'clx123abc456def' })
  id: string;

  @ApiProperty({ example: 'warehouse@acme.com' })
  email: string;

  @ApiProperty({ example: 'Sam' })
  firstName: string;

  @ApiProperty({ example: 'Receiver' })
  lastName: string;

  @ApiProperty({ enum: Role, example: Role.USER })
  role: Role;
}

export class GoodsReceiptItemResponseDto {
  @ApiProperty({ example: 'clxgrnitem123' })
  id: string;

  @ApiProperty({ example: 'clxpoitem123' })
  purchaseOrderItemId: string;

  @ApiProperty({ example: 10 })
  quantityOrdered: number;

  @ApiProperty({ example: 5 })
  quantityReceived: number;

  @ApiProperty({ example: 0 })
  quantityRejected: number;

  @ApiPropertyOptional({
    example: 'Items damaged during transit.',
  })
  remarks: string | null;

  @ApiProperty({ example: '2026-08-01T10:00:00.000Z' })
  createdAt: string;

  @ApiProperty({ example: '2026-08-01T10:00:00.000Z' })
  updatedAt: string;
}

export class GoodsReceiptResponseDto {
  @ApiProperty({ example: 'clxgrn123' })
  id: string;

  @ApiProperty({ example: 'GRN-2026-000001' })
  receiptNumber: string;

  @ApiProperty({ example: 'clxpo123' })
  purchaseOrderId: string;

  @ApiProperty({ example: 'clxorg123' })
  organisationId: string;

  @ApiProperty({ type: GoodsReceiptUserDto })
  receivedBy: GoodsReceiptUserDto;

  @ApiProperty({ example: '2026-09-15T10:00:00.000Z' })
  receiptDate: string;

  @ApiPropertyOptional({ example: 'Central Warehouse - Block A' })
  warehouse: string | null;

  @ApiPropertyOptional({
    example: 'Initial delivery for office furniture order.',
  })
  notes: string | null;

  @ApiProperty({ enum: GoodsReceiptStatus, example: GoodsReceiptStatus.DRAFT })
  status: GoodsReceiptStatus;

  @ApiProperty({ type: [GoodsReceiptItemResponseDto] })
  items: GoodsReceiptItemResponseDto[];

  @ApiProperty({ example: '2026-08-01T10:00:00.000Z' })
  createdAt: string;

  @ApiProperty({ example: '2026-08-01T10:00:00.000Z' })
  updatedAt: string;
}

export class PaginatedGoodsReceiptResponseDto {
  @ApiProperty({ type: [GoodsReceiptResponseDto] })
  goodsReceipts: GoodsReceiptResponseDto[];

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 20 })
  limit: number;

  @ApiProperty({ example: 1 })
  total: number;

  @ApiProperty({ example: 1 })
  totalPages: number;
}

export class GoodsReceiptListResponseDto {
  @ApiProperty({ type: [GoodsReceiptResponseDto] })
  goodsReceipts: GoodsReceiptResponseDto[];
}

export class DeleteGoodsReceiptResponseDto {
  @ApiProperty({ example: 'Goods receipt deleted successfully' })
  message: string;
}
