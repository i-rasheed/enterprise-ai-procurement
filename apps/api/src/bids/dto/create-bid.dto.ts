import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateBidDto {
  @ApiProperty({ example: 'clxrfq123' })
  @IsString()
  @IsNotEmpty()
  rfqId: string;

  @ApiProperty({ example: 'clxvendor123' })
  @IsString()
  @IsNotEmpty()
  vendorId: string;

  @ApiPropertyOptional({ example: 'USD', default: 'USD' })
  @IsOptional()
  @IsString()
  @MaxLength(3)
  currency?: string;

  @ApiPropertyOptional({ example: '30 days from purchase order' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  deliveryPeriod?: string;

  @ApiPropertyOptional({ example: 'Net 30' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  paymentTerms?: string;

  @ApiPropertyOptional({ example: '12 months' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  warrantyPeriod?: string;

  @ApiPropertyOptional({ example: 'Includes delivery and installation.' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}
