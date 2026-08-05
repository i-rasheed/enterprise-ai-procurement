import { Injectable } from '@nestjs/common';
import { PendingOrganisationRegistration, Prisma } from '@prisma/client';

import { PrismaService } from '../database/prisma.service';

@Injectable()
export class PendingOrganisationRegistrationRepository {
  constructor(private readonly prisma: PrismaService) {}

  deleteExpired(now = new Date()) {
    return this.prisma.pendingOrganisationRegistration.deleteMany({
      where: { expiresAt: { lt: now } },
    });
  }

  findBySlug(slug: string): Promise<PendingOrganisationRegistration | null> {
    return this.prisma.pendingOrganisationRegistration.findUnique({
      where: { slug },
    });
  }

  findByEmail(email: string): Promise<PendingOrganisationRegistration | null> {
    return this.prisma.pendingOrganisationRegistration.findUnique({
      where: { email: email.trim().toLowerCase() },
    });
  }

  findByTokenHash(
    tokenHash: string,
  ): Promise<PendingOrganisationRegistration | null> {
    return this.prisma.pendingOrganisationRegistration.findUnique({
      where: { tokenHash },
    });
  }

  create(
    data: Prisma.PendingOrganisationRegistrationCreateInput,
  ): Promise<PendingOrganisationRegistration> {
    return this.prisma.pendingOrganisationRegistration.create({ data });
  }

  update(
    id: string,
    data: Prisma.PendingOrganisationRegistrationUpdateInput,
  ): Promise<PendingOrganisationRegistration> {
    return this.prisma.pendingOrganisationRegistration.update({
      where: { id },
      data,
    });
  }

  delete(id: string): Promise<PendingOrganisationRegistration> {
    return this.prisma.pendingOrganisationRegistration.delete({
      where: { id },
    });
  }
}
