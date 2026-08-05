import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString, MaxLength } from 'class-validator';

export class IssuePurchaseOrderDto {
  @ApiPropertyOptional({
    example: '2026-08-01T12:00:00.000Z',
    description: 'Issue date; defaults to current timestamp when omitted',
  })
  @IsOptional()
  @IsDateString()
  issueDate?: string;

  @ApiPropertyOptional({
    example: 'Please confirm receipt within 48 hours.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}
