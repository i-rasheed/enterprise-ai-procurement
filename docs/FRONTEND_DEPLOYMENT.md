# Frontend Deployment Guide

## Overview

The ProcureAI web app is a Next.js 16 application with standalone output, optional Sentry monitoring, PWA support, and production Docker images.

## Environment Variables

Copy `apps/web/.env.example` and configure:

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Yes (prod) | Backend API base URL |
| `NEXT_PUBLIC_SITE_URL` | Yes (prod) | Public frontend URL for SEO/PWA |
| `NEXT_PUBLIC_APP_NAME` | No | Application display name |
| `NEXT_PUBLIC_SENTRY_DSN` | No | Sentry browser/server DSN |
| `SENTRY_AUTH_TOKEN` | No | Source map upload in CI |
| `SENTRY_ORG` | No | Sentry organization slug |
| `SENTRY_PROJECT` | No | Sentry project slug |

## Local Production Build

```bash
pnpm install
pnpm --filter web build
pnpm --filter web start
```

## Docker

```bash
docker build -f apps/web/Dockerfile \
  --build-arg NEXT_PUBLIC_API_URL=https://api.example.com/api/v1 \
  --build-arg NEXT_PUBLIC_SITE_URL=https://app.example.com \
  -t enterprise-procurement-web:latest .

docker run -p 3000:3000 enterprise-procurement-web:latest
```

Or with Docker Compose:

```bash
docker compose up web
```

## Testing

```bash
# Unit tests (Vitest)
pnpm --filter web test

# End-to-end tests (Playwright)
pnpm --filter web build
pnpm --filter web exec playwright install --with-deps chromium
pnpm --filter web test:e2e
```

## Production Checklist

- [ ] Set `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_SITE_URL`
- [ ] Configure API `CORS_ORIGINS` to include the frontend domain
- [ ] Enable Sentry DSN for error monitoring
- [ ] Serve over HTTPS with reverse proxy (nginx, ALB, Cloudflare)
- [ ] Verify `/robots.txt`, `/sitemap.xml`, and `/manifest.webmanifest`
- [ ] Confirm service worker registers in production
- [ ] Run Playwright smoke tests against staging
- [ ] Set cache headers for static assets at CDN/proxy layer

## Observability

- Client and server errors are reported to Sentry when `NEXT_PUBLIC_SENTRY_DSN` is set
- Use browser devtools Lighthouse for performance and accessibility audits
- Monitor Core Web Vitals via your hosting provider or Sentry performance

## CI/CD

GitHub Actions validates lint, build, API tests, web unit tests, Playwright smoke tests, and Docker image builds for both API and web on every PR to `develop`/`main`.
