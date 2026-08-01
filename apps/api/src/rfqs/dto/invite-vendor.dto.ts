import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class InviteVendorDto {
  @ApiProperty({
    example: 'clxvendor123',
    description: 'Vendor ID to invite to the RFQ',
  })
  @IsString()
  @IsNotEmpty()
  vendorId: string;
}
