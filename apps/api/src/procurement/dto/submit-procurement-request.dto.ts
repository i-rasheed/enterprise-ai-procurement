import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class SubmitProcurementRequestDto {
  @ApiPropertyOptional({
    example: 'Ready for procurement review.',
    description: 'Optional note recorded when submitting the request.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  submissionNote?: string;
}
