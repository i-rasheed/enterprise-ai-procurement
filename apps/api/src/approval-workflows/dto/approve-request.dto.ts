import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class ApproveRequestDto {
  @ApiPropertyOptional({
    example: 'Budget aligns with department plan.',
    description: 'Optional approval comments',
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  comments?: string;
}
