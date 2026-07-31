import { Injectable } from '@nestjs/common';

import { UserRepository } from './user.repository';

@Injectable()
export class UsersService {
  constructor(private readonly userRepository: UserRepository) {}

  async findById(id: string) {
    return this.userRepository.findById(id);
  }

  findByEmail(email: string) {
    return this.userRepository.findByEmail(email);
  }

  async update(id: string, data: Parameters<UserRepository['update']>[1]) {
    return this.userRepository.update(id, data);
  }
}
