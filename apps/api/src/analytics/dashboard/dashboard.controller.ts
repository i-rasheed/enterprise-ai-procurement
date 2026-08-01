import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { CurrentUser } from '../../auth/decorators/current-user/current-user.decorator';
import { Roles } from '../../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt/jwt.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { TenantGuard } from '../../auth/guards/tenant.guard';
import { executiveDashboardResponseExample } from '../../common/swagger/swagger-examples';
import type { JwtPayload } from '../../common/types/jwt-payload.interface';
import { ANALYTICS_ACCESS_ROLES } from '../constants/analytics-role.constants';
import { AnalyticsFilterDto } from '../dto/analytics-filter.dto';
import { ExecutiveDashboardResponseDto } from '../dto/analytics-response.dto';
import { DashboardService } from './dashboard.service';
import { AnalyticsScopeService } from '../scope/analytics-scope.service';

@ApiTags('dashboard')
@ApiBearerAuth('JWT-auth')
@Controller('dashboard')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@Roles(...ANALYTICS_ACCESS_ROLES)
export class DashboardController {
  constructor(
    private readonly dashboardService: DashboardService,
    private readonly scopeService: AnalyticsScopeService,
  ) {}

  @Get('executive')
  @ApiOperation({ summary: 'Get executive dashboard metrics and charts' })
  @ApiOkResponse({
    type: ExecutiveDashboardResponseDto,
    schema: { example: executiveDashboardResponseExample },
  })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  async getExecutiveDashboard(
    @CurrentUser() user: JwtPayload,
    @Query() query: AnalyticsFilterDto,
  ) {
    const filter = await this.scopeService.resolveFilter(user, query);
    return this.dashboardService.getExecutiveDashboard(filter);
  }
}
