import { ApiPropertyOptional } from '@nestjs/swagger';
import { PurchaseOrderStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class ListPurchaseOrderQueryDto {
  @ApiPropertyOptional({
    example: 'PO-2026',
    description:
      'Search term matched against PO number, notes, and vendor name',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 20, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({
    enum: PurchaseOrderStatus,
    example: PurchaseOrderStatus.DRAFT,
  })
  @IsOptional()
  @IsEnum(PurchaseOrderStatus)
  status?: PurchaseOrderStatus;

  @ApiPropertyOptional({ example: 'clxvendor123' })
  @IsOptional()
  @IsString()
  vendorId?: string;
}
