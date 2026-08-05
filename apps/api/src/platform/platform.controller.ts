import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SupportTicketStatus } from '@prisma/client';

import { JwtAuthGuard } from '../auth/guards/jwt/jwt.guard';
import { PlatformAdminGuard } from './guards/platform-admin.guard';
import { UpdateOrganisationPlanDto } from './dto/update-organisation-plan.dto';
import { UpdateSystemSettingDto } from './dto/update-system-setting.dto';
import { PlatformService } from './platform.service';
import { SupportService } from '../support/support.service';

@ApiTags('platform-admin')
@Controller('platform')
@UseGuards(JwtAuthGuard, PlatformAdminGuard)
@ApiBearerAuth('JWT-auth')
export class PlatformController {
  constructor(
    private readonly platformService: PlatformService,
    private readonly supportService: SupportService,
  ) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Platform admin dashboard metrics' })
  getDashboard() {
    return this.platformService.getDashboard();
  }

  @Get('organisations')
  @ApiOperation({ summary: 'List all tenant organisations' })
  listOrganisations() {
    return this.platformService.listOrganisations();
  }

  @Patch('organisations/:id/plan')
  @ApiOperation({ summary: 'Update organisation subscription plan' })
  updatePlan(
    @Param('id') id: string,
    @Body() dto: UpdateOrganisationPlanDto,
  ) {
    return this.platformService.updateOrganisationPlan(id, dto);
  }

  @Get('settings')
  @ApiOperation({ summary: 'List system settings' })
  listSettings() {
    return this.platformService.listSystemSettings();
  }

  @Post('settings')
  @ApiOperation({ summary: 'Create or update a system setting' })
  upsertSetting(@Body() dto: UpdateSystemSettingDto) {
    return this.platformService.upsertSystemSetting(dto);
  }

  @Get('support/tickets')
  @ApiOperation({ summary: 'List all support tickets' })
  listSupportTickets() {
    return this.supportService.listAllTickets();
  }

  @Patch('support/tickets/:id/status')
  @ApiOperation({ summary: 'Update support ticket status' })
  updateTicketStatus(
    @Param('id') id: string,
    @Body('status') status: SupportTicketStatus,
  ) {
    return this.supportService.updateTicketStatus(id, status);
  }
}
