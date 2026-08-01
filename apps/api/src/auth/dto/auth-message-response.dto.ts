import { ApiProperty } from '@nestjs/swagger';

export class MessageAuthResponseDto {
  @ApiProperty({ example: 'If the email exists, a reset link has been sent.' })
  message: string;
}

export class VerifyEmailResponseDto {
  @ApiProperty({ example: 'Email verified successfully' })
  message: string;

  @ApiProperty({ example: true })
  isVerified: boolean;
}
