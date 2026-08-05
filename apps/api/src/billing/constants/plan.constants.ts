import { SubscriptionPlan, UsageMetric } from '@prisma/client';

export type PlanLimits = {
  users: number;
  procurementRequests: number;
  aiRequests: number;
  storageMb: number;
};

export type PlanFeature =
  | 'procurement'
  | 'vendors'
  | 'rfqs'
  | 'bids'
  | 'purchase_orders'
  | 'goods_receipts'
  | 'invoices'
  | 'contracts'
  | 'approvals'
  | 'analytics'
  | 'ai_assistant'
  | 'vendor_portal'
  | 'api_access'
  | 'sso'
  | 'custom_branding';

export const PLAN_LIMITS: Record<SubscriptionPlan, PlanLimits> = {
  [SubscriptionPlan.FREE]: {
    users: 3,
    procurementRequests: 25,
    aiRequests: 50,
    storageMb: 256,
  },
  [SubscriptionPlan.STARTER]: {
    users: 10,
    procurementRequests: 200,
    aiRequests: 500,
    storageMb: 2048,
  },
  [SubscriptionPlan.PROFESSIONAL]: {
    users: 50,
    procurementRequests: 2000,
    aiRequests: 5000,
    storageMb: 10240,
  },
  [SubscriptionPlan.ENTERPRISE]: {
    users: -1,
    procurementRequests: -1,
    aiRequests: -1,
    storageMb: -1,
  },
};

export const PLAN_FEATURES: Record<SubscriptionPlan, PlanFeature[]> = {
  [SubscriptionPlan.FREE]: ['procurement', 'vendors', 'approvals'],
  [SubscriptionPlan.STARTER]: [
    'procurement',
    'vendors',
    'rfqs',
    'bids',
    'approvals',
    'purchase_orders',
  ],
  [SubscriptionPlan.PROFESSIONAL]: [
    'procurement',
    'vendors',
    'rfqs',
    'bids',
    'approvals',
    'purchase_orders',
    'goods_receipts',
    'invoices',
    'contracts',
    'analytics',
    'ai_assistant',
    'vendor_portal',
  ],
  [SubscriptionPlan.ENTERPRISE]: [
    'procurement',
    'vendors',
    'rfqs',
    'bids',
    'approvals',
    'purchase_orders',
    'goods_receipts',
    'invoices',
    'contracts',
    'analytics',
    'ai_assistant',
    'vendor_portal',
    'api_access',
    'sso',
    'custom_branding',
  ],
};

export const METRIC_TO_LIMIT_KEY: Record<
  UsageMetric,
  keyof PlanLimits
> = {
  [UsageMetric.USERS]: 'users',
  [UsageMetric.PROCUREMENT_REQUESTS]: 'procurementRequests',
  [UsageMetric.AI_REQUESTS]: 'aiRequests',
  [UsageMetric.STORAGE_MB]: 'storageMb',
};

export const PLAN_CATALOG = [
  {
    plan: SubscriptionPlan.FREE,
    name: 'Free',
    description: 'For small teams evaluating procurement automation.',
    monthlyPriceNgn: 0,
    paystackPlanCodeEnv: null,
  },
  {
    plan: SubscriptionPlan.STARTER,
    name: 'Starter',
    description: 'Core sourcing workflows for growing teams.',
    monthlyPriceNgn: 75000,
    paystackPlanCodeEnv: 'PAYSTACK_PLAN_STARTER',
  },
  {
    plan: SubscriptionPlan.PROFESSIONAL,
    name: 'Professional',
    description: 'Full procure-to-pay with AI and analytics.',
    monthlyPriceNgn: 225000,
    paystackPlanCodeEnv: 'PAYSTACK_PLAN_PROFESSIONAL',
  },
  {
    plan: SubscriptionPlan.ENTERPRISE,
    name: 'Enterprise',
    description: 'Advanced controls, SSO, and unlimited scale.',
    monthlyPriceNgn: null,
    paystackPlanCodeEnv: 'PAYSTACK_PLAN_ENTERPRISE',
  },
] as const;

export const TRIAL_DAYS = 14;
