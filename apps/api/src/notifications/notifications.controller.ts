import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../auth/decorators/current-user/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt/jwt.guard';
import { TenantGuard } from '../auth/guards/tenant.guard';
import type { JwtPayload } from '../common/types/jwt-payload.interface';
import { NotificationsService } from './notifications.service';

@ApiTags('notifications')
@ApiBearerAuth('JWT-auth')
@Controller('notifications')
@UseGuards(JwtAuthGuard, TenantGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'List in-app notifications' })
  list(@CurrentUser() user: JwtPayload) {
    return this.notificationsService.getNotifications(user.sub);
  }

  @Get('unread')
  @ApiOperation({ summary: 'List unread notifications' })
  listUnread(@CurrentUser() user: JwtPayload) {
    return this.notificationsService.getNotifications(user.sub, true);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  markRead(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.notificationsService.markRead(id, user.sub);
  }

  @Get('preferences')
  @ApiOperation({ summary: 'Get notification preferences' })
  getPreferences(@CurrentUser() user: JwtPayload) {
    return this.notificationsService.getPreferences(user.sub);
  }

  @Patch('preferences')
  @ApiOperation({ summary: 'Update notification preferences' })
  updatePreferences(
    @CurrentUser() user: JwtPayload,
    @Body() body: { emailEnabled: boolean; inAppEnabled: boolean },
  ) {
    return this.notificationsService.updatePreferences(
      user.sub,
      body.emailEnabled,
      body.inAppEnabled,
    );
  }
}
