import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateBlogPostDto {
  @ApiProperty()
  @IsString()
  @MinLength(3)
  slug!: string;

  @ApiProperty()
  @IsString()
  @MinLength(3)
  title!: string;

  @ApiProperty()
  @IsString()
  @MinLength(10)
  excerpt!: string;

  @ApiProperty()
  @IsString()
  @MinLength(20)
  content!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  coverImage?: string;

  @ApiProperty()
  @IsString()
  authorName!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  published?: boolean;
}
