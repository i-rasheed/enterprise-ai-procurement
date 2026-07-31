import { Injectable } from '@nestjs/common';

import { UserRepository } from './user.repository';

@Injectable()
export class UsersService {
  constructor(private readonly userRepository: UserRepository) {}

  async findById(id: string) {
    return this.userRepository.findById(id);
  }

  async findByEmailAndOrganisation(email: string, organisationId: string) {
    return this.userRepository.findByEmailAndOrganisation(
      email,
      organisationId,
    );
  }

  async update(id: string, data: Parameters<UserRepository['update']>[1]) {
    return this.userRepository.update(id, data);
  }
}
