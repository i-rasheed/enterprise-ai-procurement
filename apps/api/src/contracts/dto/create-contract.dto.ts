import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ContractType } from '@prisma/client';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';

export class CreateContractDto {
  @ApiPropertyOptional({
    example: 'clxaward123',
    description: 'Award ID when creating from an awarded bid',
  })
  @ValidateIf((dto: CreateContractDto) => !dto.purchaseOrderId)
  @IsString()
  @IsNotEmpty()
  awardId?: string;

  @ApiPropertyOptional({
    example: 'clxpo123',
    description: 'Purchase order ID when creating from an approved PO',
  })
  @ValidateIf((dto: CreateContractDto) => !dto.awardId)
  @IsString()
  @IsNotEmpty()
  purchaseOrderId?: string;

  @ApiProperty({ example: 'Office Furniture Supply Agreement' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @ApiProperty({
    example: 'Agreement for supply of ergonomic office furniture.',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  description: string;

  @ApiProperty({ enum: ContractType, example: ContractType.GOODS })
  @IsEnum(ContractType)
  contractType: ContractType;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2026-12-31T23:59:59.000Z' })
  @IsDateString()
  endDate: string;

  @ApiProperty({ example: 24000.0 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  value: number;

  @ApiPropertyOptional({ example: 'USD', default: 'USD' })
  @IsOptional()
  @IsString()
  @MaxLength(3)
  currency?: string;

  @ApiPropertyOptional({ example: 'ANNUAL' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  renewalType?: string;

  @ApiPropertyOptional({ example: '2026-11-01T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  renewalDate?: string;

  @ApiPropertyOptional({ example: false, default: false })
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
}
