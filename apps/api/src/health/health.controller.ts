import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { HealthCheckResult } from '@nestjs/terminus';

import { healthResponseExample } from '../common/swagger/swagger-examples';
import { HealthService } from './health.service';

@ApiTags('health')
@SkipThrottle()
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: 'Health check' })
  @ApiOkResponse({ schema: { example: healthResponseExample } })
  getHealth() {
    return this.healthService.getHealth();
  }

  @Get('live')
  @ApiOperation({ summary: 'Liveness probe' })
  liveness() {
    return this.healthService.liveness();
  }

  @Get('ready')
  @ApiOperation({ summary: 'Readiness probe (database connectivity)' })
  readiness(): Promise<HealthCheckResult> {
    return this.healthService.readiness();
  }

  @Get('metrics')
  @ApiOperation({ summary: 'Application metrics' })
  metrics() {
    return this.healthService.metrics();
  }
}
