import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { healthResponseExample } from '../common/swagger/swagger-examples';
import { HealthService } from './health.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({
    summary: 'Health check',
    description: 'Returns API service status and version.',
  })
  @ApiOkResponse({
    description: 'Service is healthy',
    schema: { example: healthResponseExample },
  })
  getHealth() {
    return this.healthService.getHealth();
  }
}
