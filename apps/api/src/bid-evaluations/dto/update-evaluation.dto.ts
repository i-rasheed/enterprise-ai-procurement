import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class UpdateEvaluationDto {
  @ApiPropertyOptional({ example: 87, minimum: 0, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  technicalScore?: number;

  @ApiPropertyOptional({ example: 92, minimum: 0, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  commercialScore?: number;

  @ApiPropertyOptional({ example: 90, minimum: 0, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  complianceScore?: number;

  @ApiPropertyOptional({ example: 82, minimum: 0, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  deliveryScore?: number;

  @ApiPropertyOptional({ example: 'Updated score after clarification call.' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  comments?: string;
}
