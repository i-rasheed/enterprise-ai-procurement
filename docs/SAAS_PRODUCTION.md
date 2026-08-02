# ProcureAI Multi-Tenant SaaS — Production Runbook

Operations guide for the subscription-based procurement platform.

## SaaS capabilities

| Capability | Implementation |
|------------|----------------|
| Subscription plans | `FREE`, `STARTER`, `PROFESSIONAL`, `ENTERPRISE` on `Organisation.plan` |
| Stripe billing | Checkout, customer portal, webhooks → `billing` module |
| Usage limits | Users, procurement requests, AI requests per plan |
| Feature flags | Plan-based + per-tenant overrides in `featureOverrides` JSON |
| Tenant isolation | JWT `organisationId` + Prisma row-level scoping |
| Admin console | `/dashboard/admin` + `platform` API (platform admins only) |
| Email templates | DB-backed templates, BullMQ + SMTP delivery |
| Onboarding | 5-step wizard tracked on organisation |
| Support center | Ticket system with platform triage |
| Marketing site | `/`, `/pricing`, `/features`, `/blog`, `/contact` |
| Customer portal | `/dashboard/billing` |

## Plan limits

Defined in `apps/api/src/billing/constants/plan.constants.ts`:

| Plan | Users | Requests | AI | Storage |
|------|-------|----------|-----|---------|
| Free | 3 | 25 | 50 | 256 MB |
| Starter | 10 | 200 | 500 | 2 GB |
| Professional | 50 | 2,000 | 5,000 | 10 GB |
| Enterprise | Unlimited | Unlimited | Unlimited | Unlimited |

## Feature matrix

| Feature | Free | Starter | Pro | Enterprise |
|---------|------|---------|-----|------------|
| Procurement | ✓ | ✓ | ✓ | ✓ |
| RFQs / Bids | | ✓ | ✓ | ✓ |
| PO / GRN / Invoices | | ✓ | ✓ | ✓ |
| Contracts | | | ✓ | ✓ |
| Analytics | | | ✓ | ✓ |
| AI assistant | | | ✓ | ✓ |
| Vendor portal | | | ✓ | ✓ |
| API access / SSO | | | | ✓ |

## API endpoints

| Area | Base path |
|------|-----------|
| Billing | `GET/POST /api/v1/billing/*` |
| Feature flags | `GET /api/v1/feature-flags` |
| Onboarding | `GET/PATCH/POST /api/v1/onboarding/*` |
| Support | `/api/v1/support/tickets` |
| Platform admin | `/api/v1/platform/*` |
| Public blog | `GET /api/v1/content/blog` |
| Stripe webhook | `POST /api/v1/billing/webhooks/stripe` |

## Environment variables

### API (required for SaaS)

```env
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_STARTER=
STRIPE_PRICE_PROFESSIONAL=
STRIPE_PRICE_ENTERPRISE=
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
SMTP_FROM=
FRONTEND_URL=
```

Stripe is optional in development — billing UI shows plans but checkout requires keys.

## Platform admin access

1. Set `isPlatformAdmin = true` on a user (seed sets `admin@demo.com`)
2. Sign in and open `/dashboard/admin`
3. Manage tenant plans via `PATCH /platform/organisations/:id/plan`

Organisation CRUD (`/organisations`) is restricted to platform admins.

## Tenant lifecycle

1. **Register** — Creates organisation with 14-day trial, `billingStatus=TRIALING`
2. **Onboarding** — Wizard steps: profile → invite team → first procurement → vendors → AI
3. **Upgrade** — Stripe Checkout from `/dashboard/billing`
4. **Usage enforcement** — Invitations check user limit; AI increments usage meter
5. **Trial expiry** — `TenantBillingGuard` blocks access when trial ends without subscription

## Email templates

Seeded keys: `welcome`, `email_verification`, `password_reset`, `invitation`.

Templates support `{{variable}}` substitution. Queue jobs via BullMQ `email` queue.

## Monitoring checklist

- API health endpoints responding
- Stripe webhook delivery success rate
- Email queue depth (BullMQ)
- Sentry error volume by release
- RDS CPU/storage and connection count
- Per-plan signup and churn (from `Organisation` table)

## Backup & recovery

See [AWS_DEPLOYMENT.md](./AWS_DEPLOYMENT.md) for RDS snapshots and S3 backup procedures.

**RPO target:** 24 hours (daily snapshots)  
**RTO target:** 4 hours (ECS redeploy + RDS restore)

## Security notes

- All tenant APIs require JWT with `organisationId`
- Platform routes require `isPlatformAdmin`
- Stripe webhook validates signature with raw body
- Unauthenticated organisation listing removed (platform admin only)

## Local development

```bash
docker compose up -d postgres redis
pnpm --filter api exec prisma migrate dev
pnpm --filter api db:seed
pnpm dev
```

Demo platform admin: `admin@demo.com` / `Password123!`

Marketing site: http://localhost:3000  
Docs site: http://localhost:3002  
API Swagger: http://localhost:3001/docs
