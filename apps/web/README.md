# SpendWise Web

Next.js frontend for the enterprise procurement platform.

## Development

```bash
cp .env.example .env.local
pnpm --filter web dev
```

## Production Features

- Accessibility: skip link, focus-visible styles, semantic landmarks, reduced-motion support
- SEO: metadata, Open Graph, Twitter cards, sitemap, robots, JSON-LD
- Performance: standalone build, package import optimization, route-level code splitting
- Images: Next.js Image wrapper with AVIF/WebP formats
- Testing: Vitest unit tests and Playwright e2e smoke tests
- Monitoring: optional Sentry error reporting
- PWA: web manifest and service worker precache

## Scripts

| Script | Description |
|--------|-------------|
| `pnpm --filter web dev` | Start dev server on port 3000 |
| `pnpm --filter web build` | Production build |
| `pnpm --filter web start` | Start production server |
| `pnpm --filter web test` | Run Vitest unit tests |
| `pnpm --filter web test:e2e` | Run Playwright e2e tests |
| `pnpm --filter web lint` | ESLint |
| `pnpm --filter web check-types` | TypeScript check |

See [Frontend Deployment Guide](../../docs/FRONTEND_DEPLOYMENT.md) for Docker and production setup.
