import { Injectable } from '@nestjs/common';

@Injectable()
export class HealthService {
  getHealth() {
    return {
      status: 'ok',
      service: 'enterprise-ai-procurement-api',
      version: '1.0.0',
    };
  }
}