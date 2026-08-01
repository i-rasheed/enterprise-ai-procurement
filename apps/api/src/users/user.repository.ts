import { Injectable } from '@nestjs/common';
import { Prisma, Role, User } from '@prisma/client';

import { PrismaService } from '../database/prisma.service';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  findFirstByEmail(email: string) {
    return this.prisma.user.findFirst({
      where: { email },
    });
  }

  findByEmailAndOrganisation(email: string, organisationId: string) {
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

  async create(data: {
    email: string;
    firstName: string;
    lastName: string;
    passwordHash: string;
    role: Role;
    organisationId: string;
  }): Promise<User> {
    return this.prisma.user.create({ data });
  }

  async update(id: string, data: Prisma.UserUpdateInput) {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }
}
