import { ApiPropertyOptional } from '@nestjs/swagger';
import { ContractStatus, ContractType } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class ListContractQueryDto {
  @ApiPropertyOptional({
    example: 'CTR-2026',
    description:
      'Search term matched against contract number, title, and vendor',
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

  @ApiPropertyOptional({ enum: ContractStatus, example: ContractStatus.ACTIVE })
  @IsOptional()
  @IsEnum(ContractStatus)
  status?: ContractStatus;

  @ApiPropertyOptional({ enum: ContractType, example: ContractType.GOODS })
  @IsOptional()
  @IsEnum(ContractType)
  contractType?: ContractType;

  @ApiPropertyOptional({ example: 'clxvendor123' })
  @IsOptional()
  @IsString()
  vendorId?: string;
}
