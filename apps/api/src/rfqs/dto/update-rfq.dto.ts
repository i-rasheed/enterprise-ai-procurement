import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateRFQDto {
  @ApiPropertyOptional({ example: 'Office Furniture RFQ Q3 (Revised)' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @ApiPropertyOptional({
    example: 'Updated quotation requirements for office furniture.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @ApiPropertyOptional({ example: '2026-10-15T23:59:59.000Z' })
  @IsOptional()
  @IsDateString()
  closingDate?: string;
}
