import { ApiProperty } from '@nestjs/swagger';
import { IsObject, IsString, MinLength } from 'class-validator';

export class UpdateSystemSettingDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  key!: string;

  @ApiProperty()
  @IsObject()
  value!: Record<string, unknown>;
}
