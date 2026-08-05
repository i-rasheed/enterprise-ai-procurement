import { Injectable } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  PrismaHealthIndicator,
} from '@nestjs/terminus';

import { CacheService } from '../cache/cache.service';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class HealthService {
  constructor(
    private readonly health: HealthCheckService,
    private readonly prismaHealth: PrismaHealthIndicator,
    private readonly prisma: PrismaService,
    private readonly cacheService: CacheService,
  ) {}

  getHealth() {
    return {
      status: 'ok',
      service: 'enterprise-ai-procurement-api',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    };
  }

  @HealthCheck()
  readiness() {
    return this.health.check([
      () => this.prismaHealth.pingCheck('database', this.prisma),
    ]);
  }

  liveness() {
    return {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  }

  async metrics() {
    const [userCount, organisationCount, redisConnected] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.organisation.count(),
      this.cacheService.ping(),
    ]);

    return {
      users: userCount,
      organisations: organisationCount,
      redis: redisConnected ? 'connected' : 'unavailable',
      memory: process.memoryUsage(),
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  }
}
