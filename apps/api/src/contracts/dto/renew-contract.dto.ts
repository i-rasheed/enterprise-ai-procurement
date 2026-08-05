import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class RenewContractDto {
  @ApiProperty({ example: '2027-01-01T00:00:00.000Z' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2027-12-31T23:59:59.000Z' })
  @IsDateString()
  endDate: string;

  @ApiPropertyOptional({ example: 26000.0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  value?: number;

  @ApiPropertyOptional({ example: '2026-12-01T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  renewalDate?: string;

  @ApiProperty({
    example: 'Contract renewed for a second annual term.',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  changeSummary: string;
}
