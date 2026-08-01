import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { CurrentUser } from '../auth/decorators/current-user/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt/jwt.guard';
import { TenantGuard } from '../auth/guards/tenant.guard';
import type { JwtPayload } from '../common/types/jwt-payload.interface';
import { AuditService } from './audit.service';
import { PaginatedAuditLogsResponseDto } from './dto/audit-log-response.dto';
import { ListAuditLogsQueryDto } from './dto/list-audit-logs-query.dto';

@ApiTags('audit-logs')
@ApiBearerAuth('JWT-auth')
@Controller('audit-logs')
@UseGuards(JwtAuthGuard, TenantGuard)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @ApiOperation({ summary: 'List organisation audit logs' })
  @ApiOkResponse({ type: PaginatedAuditLogsResponseDto })
  list(@CurrentUser() user: JwtPayload, @Query() query: ListAuditLogsQueryDto) {
    return this.auditService.listForOrganisation(
      user.organisationId!,
      query.page ?? 1,
      query.limit ?? 20,
    );
  }
}
