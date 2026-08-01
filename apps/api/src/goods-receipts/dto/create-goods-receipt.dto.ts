import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateGoodsReceiptDto {
  @ApiProperty({
    example: 'clxpo123',
    description: 'Purchase order ID to receive goods against',
  })
  @IsString()
  @IsNotEmpty()
  purchaseOrderId: string;

  @ApiProperty({ example: '2026-09-15T10:00:00.000Z' })
  @IsDateString()
  receiptDate: string;

  @ApiPropertyOptional({ example: 'Central Warehouse - Block A' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  warehouse?: string;

  @ApiPropertyOptional({
    example: 'Initial delivery for office furniture order.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}
