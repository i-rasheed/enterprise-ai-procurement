import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsPositive,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateInvoiceItemDto {
  @ApiProperty({ example: 'clxpoitem123' })
  @IsString()
  @IsNotEmpty()
  purchaseOrderItemId: string;

  @ApiProperty({ example: 'Ergonomic office chair model X200' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  description: string;

  @ApiProperty({ example: 10 })
  @IsInt()
  @IsPositive()
  quantity: number;

  @ApiProperty({ example: 240.0 })
  @IsPositive()
  @Min(0.01)
  unitPrice: number;
}
