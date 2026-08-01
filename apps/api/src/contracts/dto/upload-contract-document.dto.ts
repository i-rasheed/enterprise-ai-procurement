import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class UploadContractDocumentDto {
  @ApiProperty({ example: 'master-services-agreement.pdf' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  fileName: string;

  @ApiProperty({
    example:
      'https://storage.example.com/contracts/master-services-agreement.pdf',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  fileUrl: string;

  @ApiProperty({ example: 'application/pdf' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  mimeType: string;
}
