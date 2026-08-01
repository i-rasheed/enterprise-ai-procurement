import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../database/prisma.service';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { RefreshTokenRepository } from './refresh-token.repository';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: {} },
        { provide: JwtService, useValue: { signAsync: jest.fn() } },
        { provide: PrismaService, useValue: {} },
        { provide: RefreshTokenRepository, useValue: {} },
        {
          provide: AuditService,
          useValue: { logAuth: jest.fn(), recordLoginAttempt: jest.fn() },
        },
        { provide: ConfigService, useValue: { get: jest.fn() } },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
