import { ApiPropertyOptional } from '@nestjs/swagger';
import { ProcurementPriority } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class UpdateProcurementRequestDto {
  @ApiPropertyOptional({ example: 'Office furniture refresh Q3 (revised)' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @ApiPropertyOptional({
    example: 'Replace aging chairs and desks across the Lagos office.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @ApiPropertyOptional({
    example:
      'Current furniture is beyond repair and affecting staff productivity.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  justification?: string;

  @ApiPropertyOptional({ example: 'Operations' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  department?: string;

  @ApiPropertyOptional({ example: 2500.0, minimum: 0.01 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Min(0.01)
  estimatedBudget?: number;

  @ApiPropertyOptional({ example: 'USD' })
  @IsOptional()
  @IsString()
  @MaxLength(3)
  currency?: string;

  @ApiPropertyOptional({
    enum: ProcurementPriority,
    example: ProcurementPriority.HIGH,
  })
  @IsOptional()
  @IsEnum(ProcurementPriority)
  priority?: ProcurementPriority;

  @ApiPropertyOptional({ example: '2026-10-31T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  requiredDeliveryDate?: string;
}
