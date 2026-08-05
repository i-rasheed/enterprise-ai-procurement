# SpendWise

Production-ready multi-tenant procurement platform for smart spend control — AI intelligence, analytics, and full procure-to-pay lifecycle.

## Stack

- **API:** NestJS 11, Prisma, PostgreSQL, Redis, BullMQ
- **Auth:** JWT + refresh token rotation, account lockout, MFA foundation
- **AI:** OpenAI provider abstraction with semantic search
- **Observability:** Pino logging, health/readiness probes, audit trail

## Quick Start

```bash
# Install dependencies
pnpm install

# Start infrastructure
docker compose up -d postgres redis

# Configure environment
cp .env.example .env

# Run migrations & seed
pnpm --filter api exec prisma migrate deploy
pnpm --filter api db:seed

# Start API
pnpm --filter api dev
```

- API: http://localhost:3001/api/v1
- Swagger: http://localhost:3001/docs

## Demo Credentials (after seed)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@demo.com | Password123! |
| Finance | finance@demo.com | Password123! |
| Procurement Manager | procurement@demo.com | Password123! |
| Department Head | depthead@demo.com | Password123! |
| Vendor User | vendor@demo.com | Password123! |

## Docker

```bash
# Development (API + Postgres + Redis)
docker compose up

# Production build
docker build -f apps/api/Dockerfile -t enterprise-procurement-api .
```

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [Testing Guide](docs/TESTING.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [API Guide](docs/API_GUIDE.md)
- [Environment Variables](docs/ENVIRONMENT.md)
- [Contributing](CONTRIBUTING.md)

## Production Features

- Helmet, CORS, compression, global rate limiting
- Zod environment validation
- Unified API response format with correlation IDs
- Pino structured logging
- Audit trail for auth, approvals, exports, AI usage
- Redis caching & BullMQ background jobs
- Pluggable storage (local, S3, MinIO, R2)
- PDF/Excel/CSV report exports
- Executive dashboard & AI insights

## License

Private — All rights reserved.
