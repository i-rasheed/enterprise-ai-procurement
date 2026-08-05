import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString, MaxLength } from 'class-validator';

export class MarkPaidDto {
  @ApiPropertyOptional({ example: '2026-11-01T12:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  paidDate?: string;

  @ApiPropertyOptional({ example: 'PAY-2026-000001' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  paymentReference?: string;
}
