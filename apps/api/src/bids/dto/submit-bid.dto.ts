import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class SubmitBidDto {
  @ApiPropertyOptional({
    example: 'Final quotation submitted for review.',
    description: 'Optional note recorded when submitting the bid.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  submissionNote?: string;
}
