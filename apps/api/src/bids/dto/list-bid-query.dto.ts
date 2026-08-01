import { ApiPropertyOptional } from '@nestjs/swagger';
import { BidStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class ListBidQueryDto {
  @ApiPropertyOptional({
    example: 'BID-2026',
    description: 'Search term matched against bid number and notes',
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

  @ApiPropertyOptional({ enum: BidStatus, example: BidStatus.SUBMITTED })
  @IsOptional()
  @IsEnum(BidStatus)
  status?: BidStatus;
}
