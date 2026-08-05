import { BillingStatus, SubscriptionPlan } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsObject, IsOptional } from 'class-validator';

export class UpdateOrganisationPlanDto {
  @ApiProperty({ enum: SubscriptionPlan })
  @IsEnum(SubscriptionPlan)
  plan!: SubscriptionPlan;

  @ApiProperty({ enum: BillingStatus })
  @IsEnum(BillingStatus)
  billingStatus!: BillingStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  featureOverrides?: Record<string, boolean>;
}
