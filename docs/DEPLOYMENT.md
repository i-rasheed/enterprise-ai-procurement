# Deployment Guide

## Prerequisites

- Node.js 22+
- PostgreSQL 16+
- Redis 7+
- pnpm 10+

## Production Checklist

- [ ] Set strong JWT secrets (32+ characters)
- [ ] Configure `CORS_ORIGINS` for your frontend domains
- [ ] Set `NODE_ENV=production`
- [ ] Enable `OTEL_ENABLED=true` with observability stack
- [ ] Configure S3/storage provider for file uploads
- [ ] Set up SMTP for email notifications
- [ ] Run `prisma migrate deploy`
- [ ] Configure Redis for cache and job queues

## Docker Production

```bash
docker build -f apps/api/Dockerfile -t enterprise-procurement-api:latest .
docker run -p 3001:3001 \
  -e DATABASE_URL=postgresql://... \
  -e REDIS_URL=redis://... \
  -e JWT_ACCESS_SECRET=... \
  -e JWT_REFRESH_SECRET=... \
  enterprise-procurement-api:latest
```

## Health Probes

| Endpoint | Purpose |
|----------|---------|
| `GET /api/v1/health/live` | Liveness — process is running |
| `GET /api/v1/health/ready` | Readiness — database connected |
| `GET /api/v1/health/metrics` | Application metrics |

## Kubernetes Example

```yaml
livenessProbe:
  httpGet:
    path: /api/v1/health/live
    port: 3001
readinessProbe:
  httpGet:
    path: /api/v1/health/ready
    port: 3001
```

## CI/CD

GitHub Actions runs lint, build, web unit/e2e tests, API tests, and Docker builds for both API and web on every PR to `develop`/`main`.

See also [Frontend Deployment Guide](./FRONTEND_DEPLOYMENT.md).
