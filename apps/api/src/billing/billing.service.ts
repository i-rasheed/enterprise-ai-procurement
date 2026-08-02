import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BillingStatus, SubscriptionPlan } from '@prisma/client';
import Stripe from 'stripe';

import { PrismaService } from '../database/prisma.service';
import { PLAN_CATALOG, TRIAL_DAYS } from './constants/plan.constants';

type StripeSubscriptionRecord = {
  id: string;
  status: string;
  metadata: Record<string, string>;
  items: { data: Array<{ price: { id: string } }> };
  current_period_start: number;
  current_period_end: number;
  cancel_at_period_end: boolean;
};

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);
  private readonly stripe: Stripe | null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    const secretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    this.stripe = secretKey ? new Stripe(secretKey) : null;
  }

  isStripeEnabled(): boolean {
    return this.stripe !== null;
  }

  async ensureCustomer(organisationId: string, email: string) {
    const organisation = await this.prisma.organisation.findUnique({
      where: { id: organisationId },
    });

    if (!organisation) {
      throw new NotFoundException('Organisation not found');
    }

    if (organisation.stripeCustomerId) {
      return organisation.stripeCustomerId;
    }

    if (!this.stripe) {
      return null;
    }

    const customer = await this.stripe.customers.create({
      email,
      name: organisation.name,
      metadata: { organisationId },
    });

    await this.prisma.organisation.update({
      where: { id: organisationId },
      data: {
        stripeCustomerId: customer.id,
        billingEmail: email,
      },
    });

    return customer.id;
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
        stripePriceId: entry.stripePriceIdEnv
          ? this.configService.get<string>(entry.stripePriceIdEnv) ?? null
          : null,
      })),
      stripeEnabled: this.isStripeEnabled(),
    };
  }

  async createCheckoutSession(
    organisationId: string,
    plan: SubscriptionPlan,
    email: string,
  ) {
    if (!this.stripe) {
      throw new BadRequestException('Stripe is not configured');
    }

    const catalog = PLAN_CATALOG.find((entry) => entry.plan === plan);

    if (!catalog || !catalog.stripePriceIdEnv) {
      throw new BadRequestException('Invalid subscription plan');
    }

    const priceId = this.configService.get<string>(catalog.stripePriceIdEnv);

    if (!priceId) {
      throw new BadRequestException('Stripe price is not configured for plan');
    }

    const customerId = await this.ensureCustomer(organisationId, email);
    const frontendUrl = this.configService.get<string>(
      'FRONTEND_URL',
      'http://localhost:3000',
    );

    const session = await this.stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId ?? undefined,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${frontendUrl}/dashboard/billing?checkout=success`,
      cancel_url: `${frontendUrl}/dashboard/billing?checkout=canceled`,
      metadata: { organisationId, plan },
      subscription_data: {
        metadata: { organisationId, plan },
      },
    });

    return { url: session.url };
  }

  async createPortalSession(organisationId: string) {
    if (!this.stripe) {
      throw new BadRequestException('Stripe is not configured');
    }

    const organisation = await this.prisma.organisation.findUnique({
      where: { id: organisationId },
    });

    if (!organisation?.stripeCustomerId) {
      throw new BadRequestException('No billing customer found');
    }

    const frontendUrl = this.configService.get<string>(
      'FRONTEND_URL',
      'http://localhost:3000',
    );

    const session = await this.stripe.billingPortal.sessions.create({
      customer: organisation.stripeCustomerId,
      return_url: `${frontendUrl}/dashboard/billing`,
    });

    return { url: session.url };
  }

  async handleWebhook(rawBody: Buffer, signature: string) {
    if (!this.stripe) {
      throw new BadRequestException('Stripe is not configured');
    }

    const webhookSecret = this.configService.get<string>(
      'STRIPE_WEBHOOK_SECRET',
    );

    if (!webhookSecret) {
      throw new BadRequestException('Stripe webhook secret is not configured');
    }

    const event = this.stripe.webhooks.constructEvent(
      rawBody,
      signature,
      webhookSecret,
    );

    switch (event.type) {
      case 'checkout.session.completed':
        await this.handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await this.syncSubscription(
          event.data.object as unknown as StripeSubscriptionRecord,
        );
        break;
      default:
        this.logger.debug(`Unhandled Stripe event: ${event.type}`);
    }

    return { received: true };
  }

  private async handleCheckoutCompleted(session: Stripe.Checkout.Session) {
    const organisationId = session.metadata?.organisationId;
    const plan = session.metadata?.plan as SubscriptionPlan | undefined;

    if (!organisationId || !plan) {
      return;
    }

    await this.prisma.organisation.update({
      where: { id: organisationId },
      data: {
        plan,
        billingStatus: BillingStatus.ACTIVE,
        stripeSubscriptionId:
          typeof session.subscription === 'string'
            ? session.subscription
            : session.subscription?.id,
      },
    });
  }

  private async syncSubscription(stripeSubscription: StripeSubscriptionRecord) {
    const organisationId = stripeSubscription.metadata.organisationId;
    const plan = stripeSubscription.metadata.plan as SubscriptionPlan | undefined;

    if (!organisationId) {
      return;
    }

    const status = this.mapStripeStatus(stripeSubscription.status);

    await this.prisma.organisation.update({
      where: { id: organisationId },
      data: {
        plan: plan ?? undefined,
        billingStatus: status,
        stripeSubscriptionId: stripeSubscription.id,
      },
    });

    await this.prisma.subscription.upsert({
      where: { organisationId },
      create: {
        organisationId,
        plan: plan ?? SubscriptionPlan.STARTER,
        stripePriceId: stripeSubscription.items.data[0]?.price.id,
        stripeSubscriptionId: stripeSubscription.id,
        status,
        currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
        currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
        cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
      },
      update: {
        plan: plan ?? undefined,
        stripePriceId: stripeSubscription.items.data[0]?.price.id,
        status,
        currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
        currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
        cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
      },
    });
  }

  private mapStripeStatus(status: string): BillingStatus {
    switch (status) {
      case 'active':
        return BillingStatus.ACTIVE;
      case 'trialing':
        return BillingStatus.TRIALING;
      case 'past_due':
        return BillingStatus.PAST_DUE;
      case 'canceled':
        return BillingStatus.CANCELED;
      case 'unpaid':
        return BillingStatus.UNPAID;
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
