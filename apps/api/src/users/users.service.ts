import { Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository';

@Injectable()
export class UsersService {
  constructor(
    private readonly userRepository: UserRepository,
  ) {}

  async findById(id: string) {
    return this.userRepository.findById(id);
  }

  async findByEmail(email: string) {
    return this.userRepository.findByEmail(email);
  }

  async create(data: {
    email: string;
    firstName: string;
    lastName: string;
    passwordHash: string;
  }) {
    return this.userRepository.create(data);
  }

  async update(id: string, data: any) {
    return this.userRepository.update(id, data);
  }
}