import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateRFQDto {
  @ApiProperty({
    example: 'clxprocurement123',
    description: 'Approved procurement request ID',
  })
  @IsString()
  @IsNotEmpty()
  procurementRequestId: string;

  @ApiProperty({ example: 'Office Furniture RFQ Q3' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @ApiProperty({
    example: 'Request for quotation for ergonomic office chairs and desks.',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  description: string;

  @ApiProperty({ example: '2026-09-30T23:59:59.000Z' })
  @IsDateString()
  closingDate: string;
}
