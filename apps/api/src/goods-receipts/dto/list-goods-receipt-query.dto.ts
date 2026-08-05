import { ApiPropertyOptional } from '@nestjs/swagger';
import { GoodsReceiptStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class ListGoodsReceiptQueryDto {
  @ApiPropertyOptional({
    example: 'GRN-2026',
    description:
      'Search term matched against receipt number, warehouse, and notes',
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
    enum: GoodsReceiptStatus,
    example: GoodsReceiptStatus.DRAFT,
  })
  @IsOptional()
  @IsEnum(GoodsReceiptStatus)
  status?: GoodsReceiptStatus;

  @ApiPropertyOptional({ example: 'clxpo123' })
  @IsOptional()
  @IsString()
  purchaseOrderId?: string;
}
