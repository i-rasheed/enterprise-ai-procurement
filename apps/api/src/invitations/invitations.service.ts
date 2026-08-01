import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Invitation, InvitationStatus } from '@prisma/client';
import * as argon2 from 'argon2';

import { JwtPayload } from '../common/types/jwt-payload.interface';
import { OrganisationRepository } from '../organisations/organisation.repository';
import { UsersService } from '../users/users.service';
import { createTokenId, hashToken } from '../auth/utils/token.util';
import { INVITATION_EXPIRY_DAYS } from './constants/invitation.constants';
import { AcceptInvitationDto } from './dto/accept-invitation.dto';
import { InviteUserDto } from './dto/invite-user.dto';
import { InvitationRepository } from './invitation.repository';
import { toSafeInvitation } from './utils/invitation.util';

@Injectable()
export class InvitationsService {
  constructor(
    private readonly invitationRepository: InvitationRepository,
    private readonly organisationRepository: OrganisationRepository,
    private readonly usersService: UsersService,
  ) {}

  async inviteUser(
    organisationId: string,
    actor: JwtPayload,
    dto: InviteUserDto,
  ) {
    this.assertAdminOfOrganisation(actor, organisationId);

    const organisation =
      await this.organisationRepository.findById(organisationId);

    if (!organisation) {
      throw new NotFoundException('Organisation not found');
    }

    const existingUser = await this.usersService.findByEmailAndOrganisation(
      dto.email,
      organisationId,
    );

    if (existingUser) {
      throw new ConflictException('User already belongs to this organisation');
    }

    const pendingInvitation =
      await this.invitationRepository.findPendingByEmailAndOrganisation(
        dto.email,
        organisationId,
      );

    if (pendingInvitation) {
      const resolved = await this.resolveExpiry(pendingInvitation);

      if (resolved.status === InvitationStatus.PENDING) {
        throw new ConflictException(
          'A pending invitation already exists for this email',
        );
      }
    }

    const plainToken = createTokenId();
    const tokenHash = hashToken(plainToken);
    const expiresAt = this.buildExpiryDate();

    const invitation = await this.invitationRepository.create({
      email: dto.email,
      token: tokenHash,
      organisationId,
      role: dto.role,
      expiresAt,
    });

    return {
      invitation: toSafeInvitation(invitation),
      token: plainToken,
    };
  }

  async listOrganisationInvitations(organisationId: string, actor: JwtPayload) {
    this.assertAdminOfOrganisation(actor, organisationId);

    const organisation =
      await this.organisationRepository.findById(organisationId);

    if (!organisation) {
      throw new NotFoundException('Organisation not found');
    }

    const invitations =
      await this.invitationRepository.findPendingInvitations(organisationId);

    const resolved = await Promise.all(
      invitations.map((invitation) => this.resolveExpiry(invitation)),
    );

    return {
      invitations: resolved
        .filter((invitation) => invitation.status === InvitationStatus.PENDING)
        .map(toSafeInvitation),
    };
  }

  async acceptInvitation(dto: AcceptInvitationDto) {
    const tokenHash = hashToken(dto.token);
    const invitation = await this.invitationRepository.findByToken(tokenHash);

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    const resolved = await this.resolveExpiry(invitation);

    if (resolved.status === InvitationStatus.CANCELLED) {
      throw new BadRequestException('Invitation has been cancelled');
    }

    if (resolved.status === InvitationStatus.ACCEPTED) {
      throw new BadRequestException('Invitation has already been accepted');
    }

    if (resolved.status === InvitationStatus.EXPIRED) {
      throw new BadRequestException('Invitation has expired');
    }

    const existingUser = await this.usersService.findByEmailAndOrganisation(
      resolved.email,
      resolved.organisationId,
    );

    if (existingUser) {
      throw new ConflictException('User already belongs to this organisation');
    }

    const passwordHash = await argon2.hash(dto.password);

    const user = await this.usersService.create({
      email: resolved.email,
      firstName: dto.firstName,
      lastName: dto.lastName,
      passwordHash,
      role: resolved.role,
      organisationId: resolved.organisationId,
    });

    const acceptedInvitation = await this.invitationRepository.update(
      resolved.id,
      {
        status: InvitationStatus.ACCEPTED,
        acceptedAt: new Date(),
      },
    );

    return {
      invitation: toSafeInvitation(acceptedInvitation),
      userId: user.id,
      message: 'Invitation accepted successfully',
    };
  }

  async cancelInvitation(id: string, actor: JwtPayload) {
    const invitation = await this.invitationRepository.findById(id);

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    this.assertAdminOfOrganisation(actor, invitation.organisationId);

    const resolved = await this.resolveExpiry(invitation);

    if (resolved.status === InvitationStatus.ACCEPTED) {
      throw new BadRequestException('Accepted invitations cannot be cancelled');
    }

    if (resolved.status === InvitationStatus.CANCELLED) {
      throw new BadRequestException('Invitation is already cancelled');
    }

    await this.invitationRepository.update(resolved.id, {
      status: InvitationStatus.CANCELLED,
    });

    return {
      message: 'Invitation cancelled successfully',
    };
  }

  private assertAdminOfOrganisation(actor: JwtPayload, organisationId: string) {
    if (actor.role !== 'ADMIN') {
      throw new ForbiddenException('Admin access required');
    }

    if (actor.organisationId !== organisationId) {
      throw new ForbiddenException(
        'You can only manage invitations for your organisation',
      );
    }
  }

  private buildExpiryDate(): Date {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + INVITATION_EXPIRY_DAYS);
    return expiresAt;
  }

  private async resolveExpiry(invitation: Invitation): Promise<Invitation> {
    if (
      invitation.status === InvitationStatus.PENDING &&
      invitation.expiresAt < new Date()
    ) {
      return this.invitationRepository.update(invitation.id, {
        status: InvitationStatus.EXPIRED,
      });
    }

    return invitation;
  }
}
