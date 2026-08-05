import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class RejectInvoiceDto {
  @ApiProperty({
    example: 'Invoice total does not match purchase order amount.',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  reason: string;
}
