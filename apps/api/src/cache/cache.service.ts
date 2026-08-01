import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

import type { EnvConfig } from '../config/env.schema';

@Injectable()
export class CacheService implements OnModuleDestroy {
  private readonly logger = new Logger(CacheService.name);
  private client: Redis | null = null;

  constructor(private readonly configService: ConfigService) {}

  private getClient(): Redis | null {
    if (this.client) {
      return this.client;
    }

    const redisUrl =
      this.configService.get<EnvConfig['REDIS_URL']>('REDIS_URL');
    if (!redisUrl) {
      return null;
    }

    this.client = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });

    this.client.connect().catch((error: Error) => {
      this.logger.warn(`Redis unavailable: ${error.message}`);
    });

    return this.client;
  }

  async get<T>(key: string): Promise<T | null> {
    const client = this.getClient();
    if (!client) return null;

    try {
      const value = await client.get(key);
      return value ? (JSON.parse(value) as T) : null;
    } catch {
      return null;
    }
  }

  async set(key: string, value: unknown, ttlSeconds = 300): Promise<void> {
    const client = this.getClient();
    if (!client) return;

    try {
      await client.setex(key, ttlSeconds, JSON.stringify(value));
    } catch (error) {
      this.logger.warn(`Cache set failed: ${(error as Error).message}`);
    }
  }

  async del(key: string): Promise<void> {
    const client = this.getClient();
    if (!client) return;

    try {
      await client.del(key);
    } catch {
      // ignore cache errors
    }
  }

  async ping(): Promise<boolean> {
    const client = this.getClient();
    if (!client) return false;

    try {
      const result = await client.ping();
      return result === 'PONG';
    } catch {
      return false;
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.client) {
      await this.client.quit();
    }
  }
}
