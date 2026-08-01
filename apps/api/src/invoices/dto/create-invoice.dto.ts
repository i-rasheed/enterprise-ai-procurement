import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

import { CreateInvoiceItemDto } from './create-invoice-item.dto';

export class CreateInvoiceDto {
  @ApiProperty({ example: 'clxvendor123' })
  @IsString()
  @IsNotEmpty()
  vendorId: string;

  @ApiProperty({ example: 'clxpo123' })
  @IsString()
  @IsNotEmpty()
  purchaseOrderId: string;

  @ApiProperty({ example: 'clxgrn123' })
  @IsString()
  @IsNotEmpty()
  goodsReceiptId: string;

  @ApiProperty({ example: '2026-10-01T00:00:00.000Z' })
  @IsDateString()
  invoiceDate: string;

  @ApiProperty({ example: '2026-10-31T00:00:00.000Z' })
  @IsDateString()
  dueDate: string;

  @ApiProperty({ example: 2400.0 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  subtotal: number;

  @ApiProperty({ example: 240.0 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  taxAmount: number;

  @ApiPropertyOptional({ example: 'USD', default: 'USD' })
  @IsOptional()
  @IsString()
  @MaxLength(3)
  currency?: string;

  @ApiPropertyOptional({ example: 'Net 30' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  paymentTerms?: string;

  @ApiPropertyOptional({ example: 'Invoice for delivered office chairs.' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;

  @ApiProperty({ type: [CreateInvoiceItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateInvoiceItemDto)
  items: CreateInvoiceItemDto[];
}
