import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';

import { CurrentUser } from '../auth/decorators/current-user/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt/jwt.guard';
import { TenantGuard } from '../auth/guards/tenant.guard';
import type { JwtPayload } from '../common/types/jwt-payload.interface';
import { BillingService } from './billing.service';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import { UsageService } from './usage.service';

@ApiTags('billing')
@Controller('billing')
export class BillingController {
  constructor(
    private readonly billingService: BillingService,
    private readonly usageService: UsageService,
  ) {}

  @Get('overview')
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get organisation billing overview' })
  getOverview(@CurrentUser() user: JwtPayload) {
    return this.billingService.getBillingOverview(user.organisationId!);
  }

  @Get('usage')
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current plan usage metrics' })
  getUsage(@CurrentUser() user: JwtPayload) {
    return this.usageService.getUsageSummary(user.organisationId!);
  }

  @Post('checkout')
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Initialize Paystack checkout' })
  createCheckout(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateCheckoutDto,
  ) {
    return this.billingService.createCheckoutSession(
      user.organisationId!,
      dto.plan,
      user.email,
    );
  }

  @Post('cancel')
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Cancel Paystack subscription' })
  cancelSubscription(@CurrentUser() user: JwtPayload) {
    return this.billingService.cancelSubscription(user.organisationId!);
  }
}

@ApiTags('billing')
@Controller('billing/webhooks')
export class BillingWebhookController {
  constructor(private readonly billingService: BillingService) {}

  @Post('paystack')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Paystack webhook handler' })
  handlePaystack(
    @Req() req: Request & { rawBody?: Buffer },
    @Headers('x-paystack-signature') signature: string,
  ) {
    const rawBody = req.rawBody ?? Buffer.from(JSON.stringify(req.body));
    return this.billingService.handleWebhook(rawBody, signature);
  }
}
