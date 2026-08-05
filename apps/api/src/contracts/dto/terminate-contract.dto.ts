import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class TerminateContractDto {
  @ApiProperty({
    example: 'Contract terminated due to vendor non-compliance.',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  reason: string;
}
