import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { CurrentUser } from '../../auth/decorators/current-user/current-user.decorator';
import { Roles } from '../../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt/jwt.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { TenantGuard } from '../../auth/guards/tenant.guard';
import {
  analyticsSummaryResponseExample,
  executiveInsightsResponseExample,
} from '../../common/swagger/swagger-examples';
import type { JwtPayload } from '../../common/types/jwt-payload.interface';
import { DomainAnalyticsService } from '../analytics/domain-analytics.service';
import { ANALYTICS_ACCESS_ROLES } from '../constants/analytics-role.constants';
import { AnalyticsFilterDto } from '../dto/analytics-filter.dto';
import {
  AnalyticsSummaryResponseDto,
  ExecutiveInsightsResponseDto,
} from '../dto/analytics-response.dto';
import { ExecutiveInsightsService } from '../insights/executive-insights.service';
import { AnalyticsScopeService } from '../scope/analytics-scope.service';

@ApiTags('analytics')
@ApiBearerAuth('JWT-auth')
@Controller('analytics')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@Roles(...ANALYTICS_ACCESS_ROLES)
export class AnalyticsController {
  constructor(
    private readonly domainAnalytics: DomainAnalyticsService,
    private readonly scopeService: AnalyticsScopeService,
    private readonly executiveInsights: ExecutiveInsightsService,
  ) {}

  @Get('spend')
  @ApiOperation({ summary: 'Spend analytics' })
  @ApiOkResponse({
    type: AnalyticsSummaryResponseDto,
    schema: { example: analyticsSummaryResponseExample },
  })
  async getSpend(
    @CurrentUser() user: JwtPayload,
    @Query() query: AnalyticsFilterDto,
  ) {
    const filter = await this.scopeService.resolveFilter(user, query);
    return this.domainAnalytics.getSpendAnalytics(filter);
  }

  @Get('vendors')
  @ApiOperation({ summary: 'Vendor analytics' })
  @ApiOkResponse({ type: AnalyticsSummaryResponseDto })
  async getVendors(
    @CurrentUser() user: JwtPayload,
    @Query() query: AnalyticsFilterDto,
  ) {
    const filter = await this.scopeService.resolveFilter(user, query);
    return this.domainAnalytics.getVendorAnalytics(filter);
  }

  @Get('contracts')
  @ApiOperation({ summary: 'Contract analytics' })
  @ApiOkResponse({ type: AnalyticsSummaryResponseDto })
  async getContracts(
    @CurrentUser() user: JwtPayload,
    @Query() query: AnalyticsFilterDto,
  ) {
    const filter = await this.scopeService.resolveFilter(user, query);
    return this.domainAnalytics.getContractAnalytics(filter);
  }

  @Get('procurement')
  @ApiOperation({ summary: 'Procurement analytics' })
  @ApiOkResponse({ type: AnalyticsSummaryResponseDto })
  async getProcurement(
    @CurrentUser() user: JwtPayload,
    @Query() query: AnalyticsFilterDto,
  ) {
    const filter = await this.scopeService.resolveFilter(user, query);
    return this.domainAnalytics.getProcurementAnalytics(filter);
  }

  @Get('finance')
  @ApiOperation({ summary: 'Finance analytics' })
  @ApiOkResponse({ type: AnalyticsSummaryResponseDto })
  async getFinance(
    @CurrentUser() user: JwtPayload,
    @Query() query: AnalyticsFilterDto,
  ) {
    const filter = await this.scopeService.resolveFilter(user, query);
    return this.domainAnalytics.getFinanceAnalytics(filter);
  }

  @Get('approvals')
  @ApiOperation({ summary: 'Approval analytics' })
  @ApiOkResponse({ type: AnalyticsSummaryResponseDto })
  async getApprovals(
    @CurrentUser() user: JwtPayload,
    @Query() query: AnalyticsFilterDto,
  ) {
    const filter = await this.scopeService.resolveFilter(user, query);
    return this.domainAnalytics.getApprovalAnalytics(filter);
  }

  @Get('invoices')
  @ApiOperation({ summary: 'Invoice analytics' })
  @ApiOkResponse({ type: AnalyticsSummaryResponseDto })
  async getInvoices(
    @CurrentUser() user: JwtPayload,
    @Query() query: AnalyticsFilterDto,
  ) {
    const filter = await this.scopeService.resolveFilter(user, query);
    return this.domainAnalytics.getInvoiceAnalytics(filter);
  }

  @Get('po')
  @ApiOperation({ summary: 'Purchase order analytics' })
  @ApiOkResponse({ type: AnalyticsSummaryResponseDto })
  async getPurchaseOrders(
    @CurrentUser() user: JwtPayload,
    @Query() query: AnalyticsFilterDto,
  ) {
    const filter = await this.scopeService.resolveFilter(user, query);
    return this.domainAnalytics.getPoAnalytics(filter);
  }

  @Get('grn')
  @ApiOperation({ summary: 'Goods receipt analytics' })
  @ApiOkResponse({ type: AnalyticsSummaryResponseDto })
  async getGrn(
    @CurrentUser() user: JwtPayload,
    @Query() query: AnalyticsFilterDto,
  ) {
    const filter = await this.scopeService.resolveFilter(user, query);
    return this.domainAnalytics.getGrnAnalytics(filter);
  }

  @Get('risk')
  @ApiOperation({ summary: 'Risk analytics' })
  @ApiOkResponse({ type: AnalyticsSummaryResponseDto })
  async getRisk(
    @CurrentUser() user: JwtPayload,
    @Query() query: AnalyticsFilterDto,
  ) {
    const filter = await this.scopeService.resolveFilter(user, query);
    return this.domainAnalytics.getRiskAnalytics(filter);
  }

  @Get('insights')
  @ApiOperation({ summary: 'AI-powered executive insights' })
  @ApiOkResponse({
    type: ExecutiveInsightsResponseDto,
    schema: { example: executiveInsightsResponseExample },
  })
  async getInsights(
    @CurrentUser() user: JwtPayload,
    @Query() query: AnalyticsFilterDto,
  ) {
    const filter = await this.scopeService.resolveFilter(user, query);
    return this.executiveInsights.generateInsights(filter, user.sub);
  }
}
