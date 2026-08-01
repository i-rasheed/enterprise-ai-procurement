import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class ApproveInvoiceDto {
  @ApiPropertyOptional({
    example: 'Three-way match verified. Approved for payment.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}
