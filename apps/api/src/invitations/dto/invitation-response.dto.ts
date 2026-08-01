import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { InvitationStatus, Role } from '@prisma/client';

export class InvitationResponseDto {
  @ApiProperty({ example: 'clxinvitation123' })
  id: string;

  @ApiProperty({ example: 'buyer@acme.com' })
  email: string;

  @ApiProperty({ example: 'clxorg456' })
  organisationId: string;

  @ApiProperty({ enum: Role, example: Role.USER })
  role: Role;

  @ApiProperty({ enum: InvitationStatus, example: InvitationStatus.PENDING })
  status: InvitationStatus;

  @ApiProperty({ example: '2026-08-07T10:00:00.000Z' })
  expiresAt: Date;

  @ApiPropertyOptional({ example: null, nullable: true })
  acceptedAt: Date | null;

  @ApiProperty({ example: '2026-07-31T10:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-07-31T10:00:00.000Z' })
  updatedAt: Date;
}

export class CreateInvitationResponseDto {
  @ApiProperty({ type: InvitationResponseDto })
  invitation: InvitationResponseDto;

  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    description: 'Plain invitation token — share with the invitee (shown once)',
  })
  token: string;
}

export class InvitationListResponseDto {
  @ApiProperty({ type: [InvitationResponseDto] })
  invitations: InvitationResponseDto[];
}

export class AcceptInvitationResponseDto {
  @ApiProperty({ type: InvitationResponseDto })
  invitation: InvitationResponseDto;

  @ApiProperty({ example: 'clxuser789' })
  userId: string;

  @ApiProperty({ example: 'Invitation accepted successfully' })
  message: string;
}

export class CancelInvitationResponseDto {
  @ApiProperty({ example: 'Invitation cancelled successfully' })
  message: string;
}
