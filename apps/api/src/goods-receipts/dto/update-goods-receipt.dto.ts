import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateGoodsReceiptDto {
  @ApiPropertyOptional({ example: '2026-09-16T10:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  receiptDate?: string;

  @ApiPropertyOptional({ example: 'Central Warehouse - Block B' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  warehouse?: string;

  @ApiPropertyOptional({ example: 'Updated receipt notes.' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}
