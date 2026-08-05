import { Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../auth/decorators/current-user/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt/jwt.guard';
import { TenantGuard } from '../auth/guards/tenant.guard';
import type { JwtPayload } from '../common/types/jwt-payload.interface';
import { OnboardingService } from './onboarding.service';

@ApiTags('onboarding')
@Controller('onboarding')
@UseGuards(JwtAuthGuard, TenantGuard)
@ApiBearerAuth('JWT-auth')
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  @Get()
  @ApiOperation({ summary: 'Get onboarding wizard status' })
  getStatus(@CurrentUser() user: JwtPayload) {
    return this.onboardingService.getStatus(user.organisationId!);
  }

  @Patch('advance')
  @ApiOperation({ summary: 'Advance onboarding to next step' })
  advance(@CurrentUser() user: JwtPayload) {
    return this.onboardingService.advance(user.organisationId!);
  }

  @Post('skip')
  @ApiOperation({ summary: 'Skip onboarding wizard' })
  skip(@CurrentUser() user: JwtPayload) {
    return this.onboardingService.skip(user.organisationId!);
  }
}
