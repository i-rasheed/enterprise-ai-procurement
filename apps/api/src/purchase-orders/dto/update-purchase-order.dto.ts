import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdatePurchaseOrderDto {
  @ApiPropertyOptional({ example: '2026-12-15T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  expectedDeliveryDate?: string;

  @ApiPropertyOptional({ example: 'Net 45' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  paymentTerms?: string;

  @ApiPropertyOptional({
    example: '123 Procurement Way, Suite 400, Lagos',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  deliveryAddress?: string;

  @ApiPropertyOptional({
    example: 'Updated delivery instructions for the vendor.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}
