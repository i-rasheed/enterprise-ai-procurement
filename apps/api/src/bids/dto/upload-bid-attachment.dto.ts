import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUrl, MaxLength } from 'class-validator';

export class UploadBidAttachmentDto {
  @ApiProperty({ example: 'quotation.pdf' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  fileName: string;

  @ApiProperty({
    example: 'https://storage.example.com/bids/quotation.pdf',
    description: 'Storage-provider agnostic file URL',
  })
  @IsUrl()
  fileUrl: string;

  @ApiProperty({ example: 'application/pdf' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  fileType: string;
}
