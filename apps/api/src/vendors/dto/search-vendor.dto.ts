import { ApiPropertyOptional } from '@nestjs/swagger';
import { ComplianceStatus, VendorStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class SearchVendorDto {
  @ApiPropertyOptional({
    example: 'globex',
    description:
      'Search term matched against name, email, category, and registration number',
  })
  @IsOptional()
  @IsString()
  q?: string;

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

  @ApiPropertyOptional({ example: 'Office Supplies' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'Office Supplies' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ enum: VendorStatus, example: VendorStatus.ACTIVE })
  @IsOptional()
  @IsEnum(VendorStatus)
  status?: VendorStatus;

  @ApiPropertyOptional({
    enum: ComplianceStatus,
    example: ComplianceStatus.VERIFIED,
  })
  @IsOptional()
  @IsEnum(ComplianceStatus)
  complianceStatus?: ComplianceStatus;
}

export class ListVendorQueryDto extends SearchVendorDto {}
