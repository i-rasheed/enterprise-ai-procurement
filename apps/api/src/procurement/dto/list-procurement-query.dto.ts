import { ApiPropertyOptional } from '@nestjs/swagger';
import { ProcurementPriority, ProcurementStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class ListProcurementQueryDto {
  @ApiPropertyOptional({
    example: 'office furniture',
    description:
      'Search term matched against title, description, department, and justification',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 20, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({
    enum: ProcurementStatus,
    example: ProcurementStatus.DRAFT,
  })
  @IsOptional()
  @IsEnum(ProcurementStatus)
  status?: ProcurementStatus;

  @ApiPropertyOptional({
    enum: ProcurementPriority,
    example: ProcurementPriority.HIGH,
  })
  @IsOptional()
  @IsEnum(ProcurementPriority)
  priority?: ProcurementPriority;

  @ApiPropertyOptional({ example: 'Operations' })
  @IsOptional()
  @IsString()
  department?: string;
}
