import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class SafeUserResponseDto {
  @ApiProperty({ example: 'clx123abc' })
  id: string;

  @ApiProperty({ example: 'admin@acme.com' })
  email: string;

  @ApiProperty({ example: 'Jane' })
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  lastName: string;

  @ApiProperty({ enum: Role, example: Role.ADMIN })
  role: Role;

  @ApiProperty({ example: false })
  isVerified: boolean;

  @ApiPropertyOptional({ example: 'clx456def', nullable: true })
  organisationId: string | null;

  @ApiProperty({ example: '2026-07-31T10:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-07-31T10:00:00.000Z' })
  updatedAt: Date;
}

export class OrganisationSummaryDto {
  @ApiProperty({ example: 'clx789ghi' })
  id: string;

  @ApiProperty({ example: 'Acme Corp' })
  name: string;
}

export class TokenPairResponseDto {
  @ApiProperty({ type: SafeUserResponseDto })
  user: SafeUserResponseDto;

  @ApiProperty({
    description: 'JWT access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiProperty({
    description: 'JWT refresh token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refreshToken: string;
}

export class RegisterResponseDto extends TokenPairResponseDto {
  @ApiProperty({ type: OrganisationSummaryDto })
  organisation: OrganisationSummaryDto;
}

export class LoginResponseDto extends TokenPairResponseDto {
  @ApiPropertyOptional({ type: OrganisationSummaryDto, nullable: true })
  organisation?: OrganisationSummaryDto | null;
}

export class LogoutResponseDto {
  @ApiProperty({ example: 'Logged out successfully' })
  message: string;
}
