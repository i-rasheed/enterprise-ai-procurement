# ADR 001: Production Hardening

## Status

Accepted — Sprint 20

## Context

The platform needed production-ready security, observability, and operational infrastructure before deployment.

## Decisions

1. **Pino** for structured logging with correlation IDs
2. **Zod** for environment validation at startup
3. **Unified response wrapper** — opt-out via `ENABLE_RESPONSE_WRAPPER=false` for tests
4. **BullMQ + Redis** for background jobs (email, reports, scheduled tasks)
5. **Audit trail** in PostgreSQL — immutable append-only log
6. **CSRF not implemented** — JWT bearer API; CSRF applies to cookie-based sessions only
7. **MFA foundation** — secret generation without TOTP verification enforcement (future sprint)
8. **OpenTelemetry** — hook only; full SDK wired at deployment time

## Consequences

- E2E tests disable response wrapper to maintain backward-compatible assertions
- Redis optional in development; required for cache and jobs in production
- Account lockout protects against brute-force login attempts
