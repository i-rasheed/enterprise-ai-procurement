import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'acme-corp',
    description: 'Unique tenant slug used during registration',
  })
  @IsString()
  @IsNotEmpty()
  organisationSlug: string;

  @ApiProperty({ example: 'admin@acme.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Password123!' })
  @IsString()
  password: string;
}
