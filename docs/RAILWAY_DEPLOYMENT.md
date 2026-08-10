# Railway Deployment Guide

Deploy SpendWise on [Railway](https://railway.com) with **PostgreSQL**, **Redis**, **API**, and **Web** services.

## Monorepo auto-detection

Railway may create **api**, **docs**, and **mobile** automatically but **not web**. Each app has a `railway.toml` with explicit **build** and **start** commands (Railpack).

Leave the default **Root Directory** as the app folder (e.g. `apps/api`) so Railway auto-loads `apps/api/railway.toml`. Do **not** leave Root Directory as `/` unless you set a config file path manually.

| Service | Root Directory | Config file (auto or manual) |
|---------|----------------|------------------------------|
| **api** | `apps/api` | `apps/api/railway.toml` |
| **web** | `apps/web` | `apps/web/railway.toml` |
| **docs** | `apps/docs` | `apps/docs/railway.toml` |
| **mobile** | — | Delete this service (Expo app) |

Redeploy after pushing. If you see **"No start command detected"**, the service Root Directory is probably `/` — change it to the app folder above.

## Architecture

| Service | Dockerfile | Port | Notes |
|---------|------------|------|-------|
| **PostgreSQL** | Railway plugin | — | Auto-injects `DATABASE_URL` |
| **Redis** | Railway plugin | — | Auto-injects `REDIS_URL` |
| **API** | `apps/api/Dockerfile` | 3001 | Runs migrations on startup |
| **Web** | `apps/web/Dockerfile` | 3000 | Next.js standalone |

## 1. Create the Railway project

1. Go to [railway.com/new](https://railway.com/new) → **Deploy from GitHub repo**
2. Select `enterprise-ai-procurement` (or your fork)
3. Choose branch `develop` or `main`

## 2. Add PostgreSQL and Redis

In the project canvas:

1. **+ New** → **Database** → **PostgreSQL**
2. **+ New** → **Database** → **Redis**

Railway injects `DATABASE_URL` and `REDIS_URL` into services that reference them (see step 4).

## 3. Create the API service

1. **+ New** → **GitHub Repo** → same repository (or duplicate the existing service)
2. Rename the service to `api`
3. **Settings** → **Build**:
   - **Root Directory:** `apps/api`
   - (Config file `apps/api/railway.toml` is picked up automatically)
4. **Settings** → **Networking** → **Generate Domain** (e.g. `spendwise-api-production.up.railway.app`)
5. **Settings** → **Deploy** → **Healthcheck Path:** `/api/v1/health/ready`

### API environment variables

In **api** → **Variables**, set:

| Variable | Value |
|----------|-------|
| `NODE_ENV` | `production` |
| `PORT` | `3001` |
| `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` |
| `REDIS_URL` | `${{Redis.REDIS_URL}}` |
| `JWT_ACCESS_SECRET` | *(32+ char random string)* |
| `JWT_REFRESH_SECRET` | *(32+ char random string)* |
| `CORS_ORIGINS` | `https://YOUR-WEB-DOMAIN.up.railway.app` |
| `FRONTEND_URL` | `https://YOUR-WEB-DOMAIN.up.railway.app` |
| `ENABLE_RESPONSE_WRAPPER` | `true` |
| `SMTP_HOST` | `smtp.gmail.com` |
| `SMTP_PORT` | `465` |
| `SMTP_USER` | your SMTP user |
| `SMTP_PASS` | your SMTP app password |
| `SMTP_FROM` | `SpendWise <you@company.com>` |
| `REGISTRATION_ALLOW_PERSONAL_EMAIL` | `false` |

Reference plugin URLs with Railway’s variable syntax, e.g. `${{Postgres.DATABASE_URL}}`.

**Required before first deploy** — without these the API crashes on startup:

| Variable | Example |
|----------|---------|
| `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` |
| `JWT_ACCESS_SECRET` | random 32+ character string |
| `JWT_REFRESH_SECRET` | random 32+ character string |
| `NODE_ENV` | `production` |

Optional but recommended: add a **Redis** plugin and set `REDIS_URL=${{Redis.REDIS_URL}}` for background jobs and email.

Optional: Paystack, OpenAI, S3 — see [Environment Variables](./ENVIRONMENT.md).

## 4. Create the Web service

Railway often skips **web** during monorepo import — add it manually:

1. **+ New** → **GitHub Repo** → same repository
2. Rename to `web`
3. **Settings** → **Build**:
   - **Root Directory:** `apps/web`
   - Set these **service variables** before the first deploy (baked in at build time):

     | Variable | Value |
     |----------|-------|
     | `NEXT_PUBLIC_API_URL` | `https://YOUR-API-DOMAIN.up.railway.app/api/v1` |
     | `NEXT_PUBLIC_SITE_URL` | `https://YOUR-WEB-DOMAIN.up.railway.app` |
     | `NEXT_PUBLIC_APP_NAME` | `SpendWise` |

4. **Settings** → **Networking** → **Generate Domain**
5. **Settings** → **Deploy** → **Healthcheck Path:** `/login`

### Web runtime variables

| Variable | Value |
|----------|-------|
| `NODE_ENV` | `production` |
| `PORT` | `3000` |
| `HOSTNAME` | `0.0.0.0` |

> **Important:** `NEXT_PUBLIC_*` values are baked in at **build time**. After changing API URL or web domain, trigger a **Rebuild** on the web service.

## 5. Link services (variable references)

After both domains exist:

1. Update **api** `CORS_ORIGINS` and `FRONTEND_URL` to the **web** public URL
2. Update **web** build args / redeploy if API URL changed
3. Redeploy **api** then **web**

## 6. Seed demo data (optional)

One-time, from your machine with [Railway CLI](https://docs.railway.com/guides/cli):

```bash
npm i -g @railway/cli
railway login
railway link   # select project + api service

railway run pnpm --filter api db:seed
```

Demo login: `admin@demo.com` / `Password123!`

## 7. Verify deployment

| Check | URL |
|-------|-----|
| API health | `https://YOUR-API-DOMAIN/api/v1/health/ready` |
| Swagger | `https://YOUR-API-DOMAIN/docs` |
| Web app | `https://YOUR-WEB-DOMAIN/login` |

## Local parity

```bash
docker compose up -d postgres redis
pnpm --filter api exec prisma migrate deploy
pnpm dev
```

## Troubleshooting

| Issue | Fix |
|-------|-----|
| API crash on boot | Check **Deploy Logs** — usually missing `DATABASE_URL` or JWT secrets |
| CORS errors in browser | Set `CORS_ORIGINS` to exact web URL (no trailing slash) |
| Web shows wrong API | Rebuild web with correct `NEXT_PUBLIC_API_URL` build arg |
| Emails not sending | Confirm SMTP vars; Gmail needs app password + port `465` |
| Migrations failed | Ensure Postgres plugin is linked; check `DATABASE_URL` |
| **No start command detected** | Set Root Directory to the app folder (`apps/api`, `apps/web`, …), not `/` |
| Registration DB error | Run `railway run pnpm --filter api exec prisma migrate deploy` |

## Cost note

Railway Hobby/Pro billing applies per service (API, Web, Postgres, Redis). Start with one environment; use staging/production projects for separation.

## Related docs

- [Deployment Guide](./DEPLOYMENT.md)
- [Frontend Deployment](./FRONTEND_DEPLOYMENT.md)
- [AWS Deployment](./AWS_DEPLOYMENT.md)
