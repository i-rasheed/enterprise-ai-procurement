import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateEvaluationDto {
  @ApiProperty({ example: 'clxbid123' })
  @IsString()
  @IsNotEmpty()
  bidId: string;

  @ApiProperty({ example: 85, minimum: 0, maximum: 100 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  technicalScore: number;

  @ApiProperty({ example: 90, minimum: 0, maximum: 100 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  commercialScore: number;

  @ApiProperty({ example: 88, minimum: 0, maximum: 100 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  complianceScore: number;

  @ApiProperty({ example: 80, minimum: 0, maximum: 100 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  deliveryScore: number;

  @ApiPropertyOptional({
    example: 'Strong technical proposal with competitive pricing.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  comments?: string;
}
