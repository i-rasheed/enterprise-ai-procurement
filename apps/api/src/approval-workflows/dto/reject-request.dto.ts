import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class RejectRequestDto {
  @ApiProperty({
    example: 'Budget exceeds department allocation for this quarter.',
    description: 'Required rejection reason',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  comments: string;
}
