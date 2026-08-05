import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  MinLength,
} from 'class-validator';
import { Role } from '@prisma/client';

export class InviteMemberDto {
  @ApiProperty({ example: 'buyer@acme.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Alex' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Buyer' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ example: 'Password123!', minLength: 8 })
  @MinLength(8)
  password: string;

  @ApiProperty({
    enum: Role,
    example: Role.USER,
  })
  @IsEnum(Role)
  role: Role;
}
