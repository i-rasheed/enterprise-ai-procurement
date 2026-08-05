# Architecture

## Overview

```
┌─────────────┐     ┌──────────────────────────────────────────┐
│   Clients   │────▶│  NestJS API (apps/api)                   │
│  Web/Mobile │     │  ┌─────────┐  ┌──────────┐  ┌─────────┐ │
└─────────────┘     │  │  Auth   │  │ Business │  │   AI    │ │
                    │  │ Guards  │  │ Modules  │  │ Module  │ │
                    │  └────┬────┘  └────┬─────┘  └────┬────┘ │
                    │       │            │              │      │
                    │  ┌────▼────────────▼──────────────▼────┐ │
                    │  │  Core: Logging, Audit, Cache, Jobs  │ │
                    │  └────┬────────────┬──────────────┬────┘ │
                    └───────┼────────────┼──────────────┼──────┘
                            │            │              │
                    ┌───────▼───┐  ┌─────▼─────┐  ┌─────▼─────┐
                    │ PostgreSQL │  │   Redis   │  │  Storage  │
                    └───────────┘  └───────────┘  └───────────┘
```

## Modules

| Layer | Modules |
|-------|---------|
| Core | `core`, `audit`, `cache`, `jobs`, `storage`, `notifications` |
| Business | `procurement`, `vendors`, `rfqs`, `bids`, `purchase-orders`, `goods-receipts`, `invoices`, `contracts` |
| Intelligence | `ai`, `analytics` |

## Patterns

- **Repository Pattern** — data access isolated from business logic
- **Provider Abstraction** — LLM and storage providers are swappable
- **Multi-tenancy** — all data scoped by `organisationId`
- **Audit Trail** — immutable log of security and business events

## Request Flow

1. Correlation ID middleware assigns trace ID
2. Pino logs request with correlation ID
3. JWT + tenant + role guards authenticate/authorize
4. Service executes business logic
5. Audit events recorded asynchronously
6. Unified response wrapper returns `{ success, data, meta }`

## ADR

See [docs/adr/001-production-hardening.md](adr/001-production-hardening.md).
