import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class ResendRegistrationVerificationDto {
  @ApiProperty({ example: 'admin@acme.com' })
  @IsEmail()
  email: string;
}
