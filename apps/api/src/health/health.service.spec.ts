import { Test, TestingModule } from '@nestjs/testing';
import { HealthCheckService, PrismaHealthIndicator } from '@nestjs/terminus';

import { CacheService } from '../cache/cache.service';
import { PrismaService } from '../database/prisma.service';
import { HealthService } from './health.service';

describe('HealthService', () => {
  let service: HealthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HealthService,
        {
          provide: HealthCheckService,
          useValue: { check: jest.fn() },
        },
        {
          provide: PrismaHealthIndicator,
          useValue: { pingCheck: jest.fn() },
        },
        {
          provide: PrismaService,
          useValue: {
            user: { count: jest.fn().mockResolvedValue(0) },
            organisation: { count: jest.fn().mockResolvedValue(0) },
          },
        },
        {
          provide: CacheService,
          useValue: { ping: jest.fn().mockResolvedValue(false) },
        },
      ],
    }).compile();

    service = module.get<HealthService>(HealthService);
  });

  it('returns health status', () => {
    expect(service.getHealth().status).toBe('ok');
  });
});
