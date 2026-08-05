import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class PublishRFQDto {
  @ApiPropertyOptional({
    example: 'RFQ ready for vendor responses.',
    description: 'Optional note recorded when publishing the RFQ.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  publicationNote?: string;
}
