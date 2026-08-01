import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProcurementPriority } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateProcurementRequestDto {
  @ApiProperty({ example: 'Office furniture refresh Q3' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @ApiProperty({
    example: 'Replace aging chairs and desks across the Lagos office.',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  description: string;

  @ApiProperty({
    example:
      'Current furniture is beyond repair and affecting staff productivity.',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  justification: string;

  @ApiProperty({ example: 'Operations' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  department: string;

  @ApiProperty({ example: 2500.0, minimum: 0.01 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Min(0.01)
  estimatedBudget: number;

  @ApiPropertyOptional({ example: 'USD', default: 'USD' })
  @IsOptional()
  @IsString()
  @MaxLength(3)
  currency?: string;

  @ApiPropertyOptional({
    enum: ProcurementPriority,
    example: ProcurementPriority.MEDIUM,
    default: ProcurementPriority.MEDIUM,
  })
  @IsOptional()
  @IsEnum(ProcurementPriority)
  priority?: ProcurementPriority;

  @ApiProperty({ example: '2026-10-31T00:00:00.000Z' })
  @IsDateString()
  requiredDeliveryDate: string;
}
