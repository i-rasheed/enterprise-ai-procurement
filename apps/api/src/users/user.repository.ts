import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../database/prisma.service';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmailAndOrganisation(email: string, organisationId: string) {
    return this.prisma.user.findUnique({
      where: {
        organisationId_email: {
          organisationId,
          email,
        },
      },
    });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async update(id: string, data: Prisma.UserUpdateInput) {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }
}
