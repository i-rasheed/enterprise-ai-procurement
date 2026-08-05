import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Role, User } from '@prisma/client';

import { toSafeUser } from '../common/utils/user.util';
import { UserRepository } from './user.repository';

@Injectable()
export class UsersService {
  constructor(private readonly userRepository: UserRepository) {}

  async findById(id: string) {
    return this.userRepository.findById(id);
  }

  async getProfile(id: string) {
    const user = await this.userRepository.findByIdWithOrganisation(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.toProfileResponse(user);
  }

  toProfileResponse(
    user: User & { organisation?: { name: string } | null },
  ) {
    const safe = toSafeUser(user);

    return {
      id: safe.id,
      email: safe.email,
      firstName: safe.firstName,
      lastName: safe.lastName,
      role: safe.role,
      isVerified: safe.isVerified,
      organisationId: safe.organisationId,
      organisationName: user.organisation?.name,
      createdAt: safe.createdAt,
      updatedAt: safe.updatedAt,
    };
  }

  findFirstByEmail(email: string) {
    return this.userRepository.findFirstByEmail(email);
  }

  findByEmailAndOrganisation(email: string, organisationId: string) {
    return this.userRepository.findByEmailAndOrganisation(
      email,
      organisationId,
    );
  }

  async create(data: {
    email: string;
    firstName: string;
    lastName: string;
    passwordHash: string;
    role: Role;
    organisationId: string;
  }) {
    return this.userRepository.create(data);
  }

  async update(id: string, data: Prisma.UserUpdateInput) {
    return this.userRepository.update(id, data);
  }
}
