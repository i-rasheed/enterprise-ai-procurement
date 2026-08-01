import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreatePurchaseOrderDto {
  @ApiProperty({
    example: 'clxaward123',
    description: 'Award ID from which to generate the purchase order',
  })
  @IsString()
  @IsNotEmpty()
  awardId: string;

  @ApiProperty({
    example: '2026-11-30T00:00:00.000Z',
    description: 'Expected delivery date for the purchase order',
  })
  @IsDateString()
  expectedDeliveryDate: string;

  @ApiPropertyOptional({
    example: '123 Procurement Way, Suite 400, Lagos',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  deliveryAddress?: string;

  @ApiPropertyOptional({
    example: 'Deliver to loading dock B between 9am and 5pm.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}
