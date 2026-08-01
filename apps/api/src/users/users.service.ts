import { Injectable } from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';

import { UserRepository } from './user.repository';

@Injectable()
export class UsersService {
  constructor(private readonly userRepository: UserRepository) {}

  async findById(id: string) {
    return this.userRepository.findById(id);
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
