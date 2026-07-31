import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Role } from '@prisma/client';

import { MessageResponseDto } from '../common/dto/message-response.dto';
import {
  jwtPayloadExample,
  messageResponseExample,
} from '../common/swagger/swagger-examples';
import type { JwtPayload } from '../common/types/jwt-payload.interface';
import { CurrentUser } from '../auth/decorators/current-user/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { TenantGuard } from '../auth/guards/tenant.guard';

@ApiTags('users')
@ApiBearerAuth('JWT-auth')
@Controller('users')
export class UsersController {
  @Get('me')
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiOperation({
    summary: 'Get authenticated user profile from JWT',
    description: 'Returns the decoded JWT payload for the current session.',
  })
  @ApiOkResponse({
    description: 'JWT payload for the authenticated user',
    schema: { example: jwtPayloadExample },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT' })
  getProfile(@CurrentUser() user: JwtPayload) {
    return user;
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Admin-only protected route',
    description: 'Verifies ADMIN role within the current tenant.',
  })
  @ApiOkResponse({
    description: 'Admin access granted',
    type: MessageResponseDto,
    schema: { example: messageResponseExample },
  })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  adminOnly() {
    return messageResponseExample;
  }
}
