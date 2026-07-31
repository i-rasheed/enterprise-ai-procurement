import { Injectable } from '@nestjs/common';
import { Organisation, Prisma } from '@prisma/client';

import { PrismaService } from '../database/prisma.service';

const organisationUserSelect = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  role: true,
  isVerified: true,
  organisationId: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

const organisationInclude = {
  users: {
    select: organisationUserSelect,
  },
} satisfies Prisma.OrganisationInclude;

export type OrganisationWithUsers = Organisation & {
  users: Prisma.UserGetPayload<{ select: typeof organisationUserSelect }>[];
};

@Injectable()
export class OrganisationRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll(): Promise<Organisation[]> {
    return this.prisma.organisation.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  findById(id: string): Promise<OrganisationWithUsers | null> {
    return this.prisma.organisation.findUnique({
      where: { id },
      include: organisationInclude,
    });
  }

  create(data: Pick<Organisation, 'name'>) {
    return this.prisma.organisation.create({
      data,
      include: organisationInclude,
    });
  }

  update(
    id: string,
    data: Pick<Organisation, 'name'>,
  ): Promise<OrganisationWithUsers> {
    return this.prisma.organisation.update({
      where: { id },
      data,
      include: organisationInclude,
    });
  }

  delete(id: string) {
    return this.prisma.organisation.delete({
      where: { id },
    });
  }
}
