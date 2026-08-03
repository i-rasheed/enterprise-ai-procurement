# SpendWise Testing Guide

How to run automated tests and manually verify the platform locally.

---

## Prerequisites

1. **Dependencies installed**

   ```bash
   pnpm install
   ```

2. **Infrastructure running**

   ```bash
   docker compose up -d postgres redis
   ```

3. **Environment configured**

   ```bash
   cp .env.example .env
   ```

4. **Database migrated and seeded** (for manual testing)

   ```bash
   pnpm --filter api exec prisma migrate deploy
   pnpm --filter api db:seed
   ```

### Local URLs

| Service | URL |
|---------|-----|
| Web app | http://localhost:3000 |
| API | http://localhost:3001/api/v1 |
| Swagger | http://localhost:3001/docs |
| Docs app | http://localhost:3002 |

Start everything:

```bash
pnpm dev
```

---

## Demo credentials (after seed)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@demo.com | Password123! |
| Finance | finance@demo.com | Password123! |
| Procurement Manager | procurement@demo.com | Password123! |
| Department Head | depthead@demo.com | Password123! |
| Vendor User | vendor@demo.com | Password123! |

---

## Run all automated tests

From the repo root:

```bash
pnpm lint
pnpm build
pnpm test
```

This runs tests in each app via Turborepo. For more control, run per app (see below).

---

## API tests

### Unit tests

```bash
pnpm --filter api test
```

Watch mode:

```bash
pnpm --filter api test:watch
```

With coverage:

```bash
pnpm --filter api test:cov
```

Coverage thresholds are configured in `apps/api/package.json`.

### API end-to-end tests

E2E tests boot the full NestJS app against your configured `DATABASE_URL`. They create unique tenants per run and do not require seed data.

**Recommended:** use a separate test database so dev data is not affected.

```bash
docker exec enterprise-postgres psql -U postgres -c "CREATE DATABASE procurement_test;"
```

```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/procurement_test \
  pnpm --filter api exec prisma migrate deploy

DATABASE_URL=postgresql://postgres:postgres@localhost:5432/procurement_test \
  ENABLE_RESPONSE_WRAPPER=false \
  pnpm --filter api test:e2e
```

E2E suites live in `apps/api/test/`:

| File | Area |
|------|------|
| `auth.e2e-spec.ts` | Register, login, refresh, logout |
| `organisations.e2e-spec.ts` | Tenant setup |
| `organisations-crud.e2e-spec.ts` | Organisation CRUD |
| `invitations.e2e-spec.ts` | Member invitations |
| `vendors.e2e-spec.ts` | Vendor management |
| `procurement.e2e-spec.ts` | Procurement requests |
| `approval-workflows.e2e-spec.ts` | Approval flow |
| `rfqs.e2e-spec.ts` | RFQ lifecycle |
| `bids.e2e-spec.ts` | Bid submission |
| `bid-evaluations.e2e-spec.ts` | Bid evaluation |
| `purchase-orders.e2e-spec.ts` | Purchase orders |
| `goods-receipts.e2e-spec.ts` | Goods receipts |
| `invoices.e2e-spec.ts` | Invoices & matching |
| `contracts.e2e-spec.ts` | Contracts |

Run a single suite:

```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/procurement_test \
  ENABLE_RESPONSE_WRAPPER=false \
  pnpm --filter api exec jest --config ./test/jest-e2e.json auth.e2e-spec.ts
```

---

## Web tests

### Unit tests (Vitest)

```bash
pnpm --filter web test
```

Watch mode:

```bash
pnpm --filter web test:watch
```

Tests live next to source files, e.g. `apps/web/lib/api/errors.test.ts`.

### Playwright E2E (smoke)

Playwright checks public routes, login UI, and basic SEO.

**Option A — CI-style (standalone build)**

```bash
pnpm --filter web build
pnpm --filter web test:e2e
```

**Option B — against running dev server**

```bash
# Terminal 1
pnpm --filter web dev

# Terminal 2
PLAYWRIGHT_BASE_URL=http://127.0.0.1:3000 pnpm --filter web test:e2e
```

Install browsers once:

```bash
pnpm --filter web exec playwright install --with-deps chromium
```

View the HTML report after a run:

```bash
pnpm --filter web exec playwright show-report
```

---

## Manual testing

### 1. Health checks

With the API running:

```bash
curl http://localhost:3001/api/v1/health
curl http://localhost:3001/api/v1/health/live
curl http://localhost:3001/api/v1/health/ready
```

`ready` should report database and Redis as up when infrastructure is healthy.

### 2. Swagger (API)

1. Open http://localhost:3001/docs
2. Click **Authorize** and paste a JWT from login/register
3. Exercise endpoints interactively

Quick login via curl:

```bash
curl -s -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@demo.com","password":"Password123!"}' | jq
```

Use the `accessToken` value as `Bearer <token>` in Swagger or curl.

### 3. Web app flows

| Flow | Steps |
|------|-------|
| **Register** | `/register` → create org + admin → land in dashboard |
| **Login** | `/login` → use demo credentials above |
| **Procurement** | Dashboard → Procurement → New request → Submit |
| **Approvals** | Sign in as dept head/finance → Approvals → approve/reject |
| **Vendors** | Dashboard → Vendors → create, search, archive |
| **RFQ → Bid → Award** | Create RFQ → invite vendor → submit bid → evaluate → award |
| **PO → GRN → Invoice** | Issue PO → record goods receipt → match invoice |
| **Billing** | Admin → Settings/Billing → view plan and usage (Paystack test mode) |
| **Vendor portal** | `/vendor/login` → vendor@demo.com |

Full walkthrough: [SpendWise User Guide](./SpendWise-User-Guide.md)

### 4. Paystack webhooks (local)

1. Start ngrok: `ngrok http 3001`
2. Set Paystack webhook URL to:

   ```
   https://<your-ngrok-host>/api/v1/billing/webhooks/paystack
   ```

3. Ensure `PAYSTACK_SECRET_KEY` and plan IDs are in `.env`
4. Complete a test checkout and confirm webhook delivery in the Paystack dashboard or ngrok inspector (`http://127.0.0.1:4040`)

### 5. AI features (optional)

Set `OPENAI_API_KEY` in `.env`, restart the API, then test via Swagger under **ai** or the dashboard **Assistant** (admin / procurement / finance roles).

Without a key, non-AI modules still work; AI endpoints return a configuration error.

---

## CI pipeline

GitHub Actions (`.github/workflows/ci.yml`) runs on push/PR to `develop` and `main`:

1. Postgres + Redis service containers
2. `pnpm install`
3. Prisma generate + migrate (`procurement_test` database)
4. `pnpm lint`
5. `pnpm build`
6. Web unit tests
7. Playwright smoke tests
8. API unit tests with coverage
9. API e2e tests
10. Docker image builds (API + web)

Reproduce CI locally:

```bash
export DATABASE_URL=postgresql://postgres:postgres@localhost:5432/procurement_test
export REDIS_URL=redis://localhost:6379
export JWT_ACCESS_SECRET=ci-access-secret-minimum-32-chars
export JWT_REFRESH_SECRET=ci-refresh-secret-minimum-32-chars
export ENABLE_RESPONSE_WRAPPER=false
export NODE_ENV=test

pnpm install
pnpm --filter api exec prisma generate
pnpm --filter api exec prisma migrate deploy
pnpm lint
pnpm build
pnpm --filter web test
pnpm --filter web exec playwright install --with-deps chromium
pnpm --filter web test:e2e
pnpm --filter api test:cov
pnpm --filter api test:e2e
```

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `Database does not exist` | Create DB: `docker exec enterprise-postgres psql -U postgres -c "CREATE DATABASE procurement;"` then migrate |
| API e2e writes to dev DB | Use `procurement_test` and a separate `DATABASE_URL` |
| Playwright cannot reach app | Run `pnpm --filter web build` first, or set `PLAYWRIGHT_BASE_URL` to a running dev server |
| `401` in Swagger | Token expired (15m default); login again and re-authorize |
| Paystack webhook fails | Check ngrok is running, webhook URL path, and `PAYSTACK_SECRET_KEY` matches dashboard |
| Redis errors in dev | Start Redis: `docker compose up -d redis` |

---

## Related docs

- [API Guide](./API_GUIDE.md)
- [Environment Variables](./ENVIRONMENT.md)
- [SpendWise User Guide](./SpendWise-User-Guide.md)
- [Contributing](../CONTRIBUTING.md)
