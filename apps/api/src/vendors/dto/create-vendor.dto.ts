import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ComplianceStatus, VendorStatus } from '@prisma/client';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateVendorDto {
  @ApiProperty({ example: 'Globex Supplies Ltd' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiProperty({ example: 'contact@globex.com' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ example: '+1-555-0100' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  phone?: string;

  @ApiPropertyOptional({ example: '123 Industrial Way, Lagos' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  address?: string;

  @ApiPropertyOptional({ example: 'https://globex.com' })
  @IsOptional()
  @IsUrl()
  website?: string;

  @ApiPropertyOptional({ example: 'RC-123456' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  registrationNumber?: string;

  @ApiPropertyOptional({ example: 'TIN-987654' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  taxIdentificationNumber?: string;

  @ApiPropertyOptional({ example: 'Office Supplies' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  category?: string;

  @ApiPropertyOptional({ enum: VendorStatus, example: VendorStatus.ACTIVE })
  @IsOptional()
  @IsEnum(VendorStatus)
  status?: VendorStatus;

  @ApiPropertyOptional({ example: 4.5, minimum: 0, maximum: 5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(5)
  rating?: number;

  @ApiPropertyOptional({
    enum: ComplianceStatus,
    example: ComplianceStatus.PENDING,
  })
  @IsOptional()
  @IsEnum(ComplianceStatus)
  complianceStatus?: ComplianceStatus;

  @ApiPropertyOptional({ example: 'Preferred supplier for stationery.' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}
