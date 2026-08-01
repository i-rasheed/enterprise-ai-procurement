import {
  Body,
  Controller,
  Get,
  Patch,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Role } from '@prisma/client';
import * as argon2 from 'argon2';

import { MessageResponseDto } from '../common/dto/message-response.dto';
import { assertPasswordPolicy } from '../common/pipes/sanitize-input.pipe';
import { messageResponseExample } from '../common/swagger/swagger-examples';
import type { JwtPayload } from '../common/types/jwt-payload.interface';
import { CurrentUser } from '../auth/decorators/current-user/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { TenantGuard } from '../auth/guards/tenant.guard';
import {
  ChangePasswordDto,
  UpdateProfileDto,
  UserProfileResponseDto,
} from './dto/user-profile.dto';
import { UsersService } from './users.service';

@ApiTags('users')
@ApiBearerAuth('JWT-auth')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiOperation({
    summary: 'Get authenticated user profile',
    description: 'Returns the full user profile for the current session.',
  })
  @ApiOkResponse({ type: UserProfileResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT' })
  async getProfile(@CurrentUser() user: JwtPayload) {
    const profile = await this.usersService.getProfile(user.sub);
    return profile;
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiOperation({ summary: 'Update authenticated user profile' })
  @ApiOkResponse({ type: UserProfileResponseDto })
  async updateProfile(
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateProfileDto,
  ) {
    const updated = await this.usersService.update(user.sub, {
      firstName: dto.firstName,
      lastName: dto.lastName,
    });

    return this.usersService.getProfile(user.sub);
  }

  @Patch('me/password')
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiOperation({ summary: 'Change authenticated user password' })
  @ApiOkResponse({ type: MessageResponseDto })
  async changePassword(
    @CurrentUser() user: JwtPayload,
    @Body() dto: ChangePasswordDto,
  ) {
    assertPasswordPolicy(dto.newPassword);

    const currentUser = await this.usersService.findById(user.sub);

    if (!currentUser) {
      throw new Error('User not found');
    }

    const valid = await argon2.verify(
      currentUser.passwordHash,
      dto.currentPassword,
    );

    if (!valid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const passwordHash = await argon2.hash(dto.newPassword);
    await this.usersService.update(user.sub, { passwordHash });

    return { message: 'Password updated successfully' };
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
