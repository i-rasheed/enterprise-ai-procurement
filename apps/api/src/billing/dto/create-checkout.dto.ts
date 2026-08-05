import { SubscriptionPlan } from '@prisma/client';
import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCheckoutDto {
  @ApiProperty({ enum: SubscriptionPlan })
  @IsEnum(SubscriptionPlan)
  plan!: SubscriptionPlan;
}
