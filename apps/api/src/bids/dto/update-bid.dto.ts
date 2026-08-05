import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateBidDto {
  @ApiPropertyOptional({ example: 'USD' })
  @IsOptional()
  @IsString()
  @MaxLength(3)
  currency?: string;

  @ApiPropertyOptional({ example: '45 days from purchase order' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  deliveryPeriod?: string;

  @ApiPropertyOptional({ example: 'Net 45' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  paymentTerms?: string;

  @ApiPropertyOptional({ example: '24 months' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  warrantyPeriod?: string;

  @ApiPropertyOptional({ example: 'Revised delivery terms included.' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}
