import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BillingStatus, SubscriptionPlan } from '@prisma/client';
import { createHmac, timingSafeEqual } from 'node:crypto';

import { PrismaService } from '../database/prisma.service';
import { PLAN_CATALOG, TRIAL_DAYS } from './constants/plan.constants';
import {
  PaystackClient,
  type PaystackSubscription,
  type PaystackWebhookEvent,
} from './paystack.client';

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);
  private readonly paystack: PaystackClient | null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    const secretKey = this.configService.get<string>('PAYSTACK_SECRET_KEY');
    this.paystack = secretKey ? new PaystackClient(secretKey) : null;
  }

  isPaystackEnabled(): boolean {
    return this.paystack !== null;
  }

  async ensureCustomer(organisationId: string, email: string) {
    const organisation = await this.prisma.organisation.findUnique({
      where: { id: organisationId },
    });

    if (!organisation) {
      throw new NotFoundException('Organisation not found');
    }

    if (organisation.paystackCustomerCode) {
      return organisation.paystackCustomerCode;
    }

    if (!this.paystack) {
      return null;
    }

    const customer = await this.paystack.createCustomer({
      email,
      firstName: organisation.name,
      metadata: { organisationId },
    });

    await this.prisma.organisation.update({
      where: { id: organisationId },
      data: {
        paystackCustomerCode: customer.customer_code,
        billingEmail: email,
      },
    });

    return customer.customer_code;
  }

  async getBillingOverview(organisationId: string) {
    const organisation = await this.prisma.organisation.findUnique({
      where: { id: organisationId },
      include: { subscription: true },
    });

    if (!organisation) {
      throw new NotFoundException('Organisation not found');
    }

    return {
      plan: organisation.plan,
      billingStatus: organisation.billingStatus,
      trialEndsAt: organisation.trialEndsAt,
      billingEmail: organisation.billingEmail,
      subscription: organisation.subscription,
      plans: PLAN_CATALOG.map((entry) => ({
        ...entry,
        paystackPlanCode: entry.paystackPlanCodeEnv
          ? this.configService.get<string>(entry.paystackPlanCodeEnv) ?? null
          : null,
      })),
      paystackEnabled: this.isPaystackEnabled(),
    };
  }

  async createCheckoutSession(
    organisationId: string,
    plan: SubscriptionPlan,
    email: string,
  ) {
    if (!this.paystack) {
      throw new BadRequestException('Paystack is not configured');
    }

    const catalog = PLAN_CATALOG.find((entry) => entry.plan === plan);

    if (!catalog || !catalog.paystackPlanCodeEnv) {
      throw new BadRequestException('Invalid subscription plan');
    }

    const planCode = this.configService.get<string>(catalog.paystackPlanCodeEnv);

    if (!planCode) {
      throw new BadRequestException('Paystack plan is not configured for plan');
    }

    await this.ensureCustomer(organisationId, email);
    const frontendUrl = this.configService.get<string>(
      'FRONTEND_URL',
      'http://localhost:3000',
    );

    const transaction = await this.paystack.initializeTransaction({
      email,
      planCode,
      callbackUrl: `${frontendUrl}/dashboard/billing?checkout=success`,
      metadata: {
        organisationId,
        plan,
      },
    });

    return { url: transaction.authorization_url };
  }

  async cancelSubscription(organisationId: string) {
    if (!this.paystack) {
      throw new BadRequestException('Paystack is not configured');
    }

    const organisation = await this.prisma.organisation.findUnique({
      where: { id: organisationId },
      include: { subscription: true },
    });

    const subscriptionCode =
      organisation?.paystackSubscriptionCode ??
      organisation?.subscription?.paystackSubscriptionCode;

    if (!organisation || !subscriptionCode) {
      throw new BadRequestException('No active Paystack subscription found');
    }

    const paystackSubscription =
      await this.paystack.fetchSubscription(subscriptionCode);

    await this.paystack.disableSubscription(
      subscriptionCode,
      paystackSubscription.email_token,
    );

    await this.prisma.organisation.update({
      where: { id: organisationId },
      data: {
        billingStatus: BillingStatus.CANCELED,
      },
    });

    if (organisation.subscription) {
      await this.prisma.subscription.update({
        where: { organisationId },
        data: {
          status: BillingStatus.CANCELED,
          cancelAtPeriodEnd: true,
        },
      });
    }

    return { canceled: true };
  }

  async handleWebhook(rawBody: Buffer, signature: string) {
    if (!this.paystack) {
      throw new BadRequestException('Paystack is not configured');
    }

    const secretKey = this.configService.get<string>('PAYSTACK_SECRET_KEY');

    if (!secretKey) {
      throw new BadRequestException('Paystack secret key is not configured');
    }

    this.verifyWebhookSignature(rawBody, signature, secretKey);

    const event = JSON.parse(rawBody.toString()) as PaystackWebhookEvent;

    switch (event.event) {
      case 'charge.success':
        await this.handleChargeSuccess(event.data);
        break;
      case 'subscription.create':
        await this.syncSubscription(event.data as unknown as PaystackSubscription);
        break;
      case 'subscription.disable':
        await this.handleSubscriptionDisabled(event.data);
        break;
      case 'invoice.payment_failed':
        await this.handlePaymentFailed(event.data);
        break;
      default:
        this.logger.debug(`Unhandled Paystack event: ${event.event}`);
    }

    return { received: true };
  }

  private verifyWebhookSignature(
    rawBody: Buffer,
    signature: string,
    secretKey: string,
  ) {
    const hash = createHmac('sha512', secretKey).update(rawBody).digest('hex');

    const expected = Buffer.from(hash, 'utf8');
    const received = Buffer.from(signature, 'utf8');

    if (
      expected.length !== received.length ||
      !timingSafeEqual(expected, received)
    ) {
      throw new BadRequestException('Invalid Paystack webhook signature');
    }
  }

  private async handleChargeSuccess(data: Record<string, unknown>) {
    const metadata = (data.metadata ?? {}) as Record<string, string>;
    const organisationId = metadata.organisationId;
    const plan = metadata.plan as SubscriptionPlan | undefined;

    if (!organisationId || !plan) {
      return;
    }

    const customer = data.customer as { customer_code?: string } | undefined;
    const subscription = data.subscription as
      | { subscription_code?: string }
      | undefined;

    await this.prisma.organisation.update({
      where: { id: organisationId },
      data: {
        plan,
        billingStatus: BillingStatus.ACTIVE,
        paystackCustomerCode: customer?.customer_code,
        paystackSubscriptionCode: subscription?.subscription_code,
      },
    });
  }

  private async handleSubscriptionDisabled(data: Record<string, unknown>) {
    const subscriptionCode =
      (data.subscription_code as string | undefined) ??
      (data.code as string | undefined);

    if (!subscriptionCode) {
      return;
    }

    const subscription = await this.prisma.subscription.findFirst({
      where: { paystackSubscriptionCode: subscriptionCode },
    });

    if (!subscription) {
      return;
    }

    await this.prisma.organisation.update({
      where: { id: subscription.organisationId },
      data: { billingStatus: BillingStatus.CANCELED },
    });

    await this.prisma.subscription.update({
      where: { organisationId: subscription.organisationId },
      data: {
        status: BillingStatus.CANCELED,
        cancelAtPeriodEnd: true,
      },
    });
  }

  private async handlePaymentFailed(data: Record<string, unknown>) {
    const subscriptionCode = (data.subscription as { subscription_code?: string })
      ?.subscription_code;

    if (!subscriptionCode) {
      return;
    }

    const subscription = await this.prisma.subscription.findFirst({
      where: { paystackSubscriptionCode: subscriptionCode },
    });

    if (!subscription) {
      return;
    }

    await this.prisma.organisation.update({
      where: { id: subscription.organisationId },
      data: { billingStatus: BillingStatus.PAST_DUE },
    });

    await this.prisma.subscription.update({
      where: { organisationId: subscription.organisationId },
      data: { status: BillingStatus.PAST_DUE },
    });
  }

  private async syncSubscription(paystackSubscription: PaystackSubscription) {
    const customerCode = paystackSubscription.customer.customer_code;
    const organisation = await this.prisma.organisation.findFirst({
      where: { paystackCustomerCode: customerCode },
    });

    if (!organisation) {
      return;
    }

    const catalogEntry = PLAN_CATALOG.find(
      (entry) =>
        entry.paystackPlanCodeEnv &&
        this.configService.get<string>(entry.paystackPlanCodeEnv) ===
          paystackSubscription.plan.plan_code,
    );

    const plan = catalogEntry?.plan;
    const status = this.mapPaystackStatus(paystackSubscription.status);
    const nextPaymentDate = paystackSubscription.next_payment_date
      ? new Date(paystackSubscription.next_payment_date)
      : null;

    await this.prisma.organisation.update({
      where: { id: organisation.id },
      data: {
        plan: plan ?? undefined,
        billingStatus: status,
        paystackSubscriptionCode: paystackSubscription.subscription_code,
      },
    });

    await this.prisma.subscription.upsert({
      where: { organisationId: organisation.id },
      create: {
        organisationId: organisation.id,
        plan: plan ?? SubscriptionPlan.STARTER,
        paystackPlanCode: paystackSubscription.plan.plan_code,
        paystackSubscriptionCode: paystackSubscription.subscription_code,
        status,
        currentPeriodStart: new Date(paystackSubscription.createdAt),
        currentPeriodEnd: nextPaymentDate,
        cancelAtPeriodEnd: false,
      },
      update: {
        plan: plan ?? undefined,
        paystackPlanCode: paystackSubscription.plan.plan_code,
        paystackSubscriptionCode: paystackSubscription.subscription_code,
        status,
        currentPeriodEnd: nextPaymentDate,
        cancelAtPeriodEnd: false,
      },
    });
  }

  private mapPaystackStatus(status: string): BillingStatus {
    switch (status) {
      case 'active':
        return BillingStatus.ACTIVE;
      case 'non-renewing':
        return BillingStatus.CANCELED;
      case 'attention':
        return BillingStatus.PAST_DUE;
      case 'completed':
        return BillingStatus.CANCELED;
      default:
        return BillingStatus.ACTIVE;
    }
  }

  buildTrialEndDate(): Date {
    const date = new Date();
    date.setDate(date.getDate() + TRIAL_DAYS);
    return date;
  }
}
