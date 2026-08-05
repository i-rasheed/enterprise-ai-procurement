import { SupportPriority } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateSupportTicketDto {
  @ApiProperty()
  @IsString()
  @MinLength(3)
  subject!: string;

  @ApiProperty()
  @IsString()
  @MinLength(10)
  message!: string;

  @ApiPropertyOptional({ enum: SupportPriority })
  @IsOptional()
  @IsEnum(SupportPriority)
  priority?: SupportPriority;
}
