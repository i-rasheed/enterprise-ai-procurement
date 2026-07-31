import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNotIn,
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
    description: 'SUPER_ADMIN cannot be assigned via invite',
  })
  @IsEnum(Role)
  @IsNotIn([Role.SUPER_ADMIN])
  role: Role;
}
