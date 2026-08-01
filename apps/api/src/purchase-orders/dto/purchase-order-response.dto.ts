import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PurchaseOrderStatus, Role } from '@prisma/client';

export class PurchaseOrderUserDto {
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

export class PurchaseOrderVendorDto {
  @ApiProperty({ example: 'clxvendor123' })
  id: string;

  @ApiProperty({ example: 'Globex Supplies Ltd' })
  name: string;

  @ApiProperty({ example: 'vendor@globex.com' })
  email: string;
}

export class PurchaseOrderItemResponseDto {
  @ApiProperty({ example: 'clxpoitem123' })
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

export class PurchaseOrderResponseDto {
  @ApiProperty({ example: 'clxpo123' })
  id: string;

  @ApiProperty({ example: 'PO-2026-000001' })
  poNumber: string;

  @ApiProperty({ example: 'clxorg123' })
  organisationId: string;

  @ApiProperty({ type: PurchaseOrderVendorDto })
  vendor: PurchaseOrderVendorDto;

  @ApiProperty({ example: 'clxaward123' })
  awardId: string;

  @ApiProperty({ example: 'clxprocurement123' })
  procurementRequestId: string;

  @ApiProperty({ type: PurchaseOrderUserDto })
  issuedBy: PurchaseOrderUserDto;

  @ApiPropertyOptional({ example: '2026-08-01T12:00:00.000Z' })
  issueDate: string | null;

  @ApiProperty({ example: '2026-11-30T00:00:00.000Z' })
  expectedDeliveryDate: string;

  @ApiProperty({ example: 2400.0 })
  totalAmount: number;

  @ApiProperty({ example: 'USD' })
  currency: string;

  @ApiPropertyOptional({ example: 'Net 30' })
  paymentTerms: string | null;

  @ApiPropertyOptional({ example: '123 Procurement Way, Suite 400, Lagos' })
  deliveryAddress: string | null;

  @ApiPropertyOptional({ example: 'Deliver to loading dock B.' })
  notes: string | null;

  @ApiProperty({
    enum: PurchaseOrderStatus,
    example: PurchaseOrderStatus.DRAFT,
  })
  status: PurchaseOrderStatus;

  @ApiProperty({ type: [PurchaseOrderItemResponseDto] })
  items: PurchaseOrderItemResponseDto[];

  @ApiProperty({ example: '2026-08-01T10:00:00.000Z' })
  createdAt: string;

  @ApiProperty({ example: '2026-08-01T10:00:00.000Z' })
  updatedAt: string;
}

export class PaginatedPurchaseOrderResponseDto {
  @ApiProperty({ type: [PurchaseOrderResponseDto] })
  purchaseOrders: PurchaseOrderResponseDto[];

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 20 })
  limit: number;

  @ApiProperty({ example: 1 })
  total: number;

  @ApiProperty({ example: 1 })
  totalPages: number;
}

export class PurchaseOrderListResponseDto {
  @ApiProperty({ type: [PurchaseOrderResponseDto] })
  purchaseOrders: PurchaseOrderResponseDto[];
}

export class DeletePurchaseOrderResponseDto {
  @ApiProperty({ example: 'Purchase order deleted successfully' })
  message: string;
}

export class CancelPurchaseOrderResponseDto {
  @ApiProperty({ type: PurchaseOrderResponseDto })
  purchaseOrder: PurchaseOrderResponseDto;
}
