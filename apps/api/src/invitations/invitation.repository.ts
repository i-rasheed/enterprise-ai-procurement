import { Injectable } from '@nestjs/common';
import { Invitation, InvitationStatus, Prisma, Role } from '@prisma/client';

import { PrismaService } from '../database/prisma.service';

@Injectable()
export class InvitationRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: {
    email: string;
    token: string;
    organisationId: string;
    role: Role;
    expiresAt: Date;
  }): Promise<Invitation> {
    return this.prisma.invitation.create({ data });
  }

  findByToken(token: string): Promise<Invitation | null> {
    return this.prisma.invitation.findUnique({
      where: { token },
    });
  }

  findByEmail(email: string, organisationId: string): Promise<Invitation[]> {
    return this.prisma.invitation.findMany({
      where: { email, organisationId },
      orderBy: { createdAt: 'desc' },
    });
  }

  findById(id: string): Promise<Invitation | null> {
    return this.prisma.invitation.findUnique({
      where: { id },
    });
  }

  findPendingInvitations(organisationId: string): Promise<Invitation[]> {
    return this.prisma.invitation.findMany({
      where: {
        organisationId,
        status: InvitationStatus.PENDING,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  findPendingByEmailAndOrganisation(
    email: string,
    organisationId: string,
  ): Promise<Invitation | null> {
    return this.prisma.invitation.findFirst({
      where: {
        email,
        organisationId,
        status: InvitationStatus.PENDING,
      },
    });
  }

  update(id: string, data: Prisma.InvitationUpdateInput): Promise<Invitation> {
    return this.prisma.invitation.update({
      where: { id },
      data,
    });
  }

  delete(id: string): Promise<Invitation> {
    return this.prisma.invitation.delete({
      where: { id },
    });
  }
}
