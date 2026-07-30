import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { User } from '@prisma/client';
@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findById(id: string) {
  return this.prisma.user.findUnique({
    where: { id },
  });
}

async update(id: string, data: Partial<User>) {
  return this.prisma.user.update({
    where: { id },
    data,
  });
}

  async create(data: {
    email: string;
    firstName: string;
    lastName: string;
    passwordHash: string;
  }) {
    return this.prisma.user.create({
      data,
    });
  }
}