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

import { CurrentUser } from '../auth/decorators/current-user/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt/jwt.guard';
import { TenantGuard } from '../auth/guards/tenant.guard';
import type { JwtPayload } from '../common/types/jwt-payload.interface';
import { CreateSupportTicketDto } from './dto/create-support-ticket.dto';
import { ReplySupportTicketDto } from './dto/reply-support-ticket.dto';
import { SupportService } from './support.service';

@ApiTags('support')
@Controller('support/tickets')
@UseGuards(JwtAuthGuard, TenantGuard)
@ApiBearerAuth('JWT-auth')
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Get()
  @ApiOperation({ summary: 'List support tickets for current user' })
  list(@CurrentUser() user: JwtPayload) {
    return this.supportService.listTickets(
      user.organisationId!,
      user.sub,
    );
  }

  @Post()
  @ApiOperation({ summary: 'Create a support ticket' })
  create(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateSupportTicketDto,
  ) {
    return this.supportService.createTicket(
      user.organisationId!,
      user.sub,
      dto,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get support ticket details' })
  getOne(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.supportService.getTicket(
      user.organisationId!,
      user.sub,
      id,
    );
  }

  @Post(':id/replies')
  @ApiOperation({ summary: 'Reply to a support ticket' })
  reply(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: ReplySupportTicketDto,
  ) {
    return this.supportService.reply(
      user.organisationId!,
      user.sub,
      id,
      dto,
    );
  }
}
