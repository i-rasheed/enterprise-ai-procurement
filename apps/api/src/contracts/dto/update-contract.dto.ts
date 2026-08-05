import { ApiPropertyOptional } from '@nestjs/swagger';
import { ContractType } from '@prisma/client';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class UpdateContractDto {
  @ApiPropertyOptional({ example: 'Updated Office Furniture Supply Agreement' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @ApiPropertyOptional({ example: 'Updated contract scope and terms.' })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @ApiPropertyOptional({ enum: ContractType, example: ContractType.GOODS })
  @IsOptional()
  @IsEnum(ContractType)
  contractType?: ContractType;

  @ApiPropertyOptional({ example: '2026-02-01T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ example: '2027-01-31T23:59:59.000Z' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ example: 26000.0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  value?: number;

  @ApiPropertyOptional({ example: 'ANNUAL' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  renewalType?: string;

  @ApiPropertyOptional({ example: '2026-12-01T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  renewalDate?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  autoRenew?: boolean;

  @ApiPropertyOptional({ example: 'Jane Doe, Procurement Director' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  signedByOrganisation?: string;

  @ApiPropertyOptional({ example: 'Alex Supplier, Vendor Representative' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  signedByVendor?: string;

  @ApiPropertyOptional({
    example: 'Updated contract value and renewal terms.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  changeSummary?: string;
}
