import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiProduces,
  ApiTags,
} from '@nestjs/swagger';

import { CurrentUser } from '../../auth/decorators/current-user/current-user.decorator';
import { Roles } from '../../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt/jwt.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { TenantGuard } from '../../auth/guards/tenant.guard';
import {
  procurementReportResponseExample,
  reportListResponseExample,
} from '../../common/swagger/swagger-examples';
import type { JwtPayload } from '../../common/types/jwt-payload.interface';
import { ANALYTICS_ACCESS_ROLES } from '../constants/analytics-role.constants';
import { AnalyticsFilterDto } from '../dto/analytics-filter.dto';
import {
  ReportListItemDto,
  ReportResponseDto,
} from '../dto/analytics-response.dto';
import { ExportService } from '../exports/export.service';
import { ReportsService } from './reports.service';
import { AnalyticsScopeService } from '../scope/analytics-scope.service';

@ApiTags('reports')
@ApiBearerAuth('JWT-auth')
@Controller('reports')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@Roles(...ANALYTICS_ACCESS_ROLES)
export class ReportsController {
  constructor(
    private readonly reportsService: ReportsService,
    private readonly exportService: ExportService,
    private readonly scopeService: AnalyticsScopeService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List available report types' })
  @ApiOkResponse({
    type: [ReportListItemDto],
    schema: { example: reportListResponseExample },
  })
  listReports() {
    return this.reportsService.listReports();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Generate report data as JSON' })
  @ApiOkResponse({
    type: ReportResponseDto,
    schema: { example: procurementReportResponseExample },
  })
  @ApiNotFoundResponse({ description: 'Report type not found' })
  async getReport(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Query() query: AnalyticsFilterDto,
  ) {
    const filter = await this.scopeService.resolveFilter(user, query);
    return this.reportsService.generateReport(id, filter);
  }

  @Get(':id/pdf')
  @ApiOperation({ summary: 'Export report as PDF' })
  @ApiProduces('application/pdf')
  @ApiOkResponse({ description: 'PDF file download' })
  @ApiNotFoundResponse({ description: 'Report type not found' })
  async exportPdf(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Query() query: AnalyticsFilterDto,
  ) {
    const filter = await this.scopeService.resolveFilter(user, query);
    const report = await this.reportsService.generateReport(id, filter);
    return this.exportService.toPdf(report);
  }

  @Get(':id/excel')
  @ApiOperation({ summary: 'Export report as Excel' })
  @ApiProduces(
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  )
  @ApiOkResponse({ description: 'Excel file download' })
  @ApiNotFoundResponse({ description: 'Report type not found' })
  async exportExcel(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Query() query: AnalyticsFilterDto,
  ) {
    const filter = await this.scopeService.resolveFilter(user, query);
    const report = await this.reportsService.generateReport(id, filter);
    return this.exportService.toExcel(report);
  }

  @Get(':id/csv')
  @ApiOperation({ summary: 'Export report as CSV' })
  @ApiProduces('text/csv')
  @ApiOkResponse({ description: 'CSV file download' })
  @ApiNotFoundResponse({ description: 'Report type not found' })
  async exportCsv(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Query() query: AnalyticsFilterDto,
  ) {
    const filter = await this.scopeService.resolveFilter(user, query);
    const report = await this.reportsService.generateReport(id, filter);
    return this.exportService.toCsv(report);
  }
}
