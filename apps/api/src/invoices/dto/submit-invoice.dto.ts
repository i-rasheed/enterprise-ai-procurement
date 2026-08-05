import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class SubmitInvoiceDto {
  @ApiPropertyOptional({ example: 'Submitted for three-way matching.' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}
