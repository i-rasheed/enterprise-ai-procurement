# syntax=docker/dockerfile:1

FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@10.15.1 --activate
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/api/package.json ./apps/api/
COPY packages ./packages
RUN pnpm install --frozen-lockfile --filter api...

FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules
COPY . .
# Prisma schema references DATABASE_URL; a placeholder is enough at build time.
ENV DATABASE_URL=postgresql://build:build@localhost:5432/build
RUN pnpm --filter api build

FROM node:22-alpine AS production
RUN corepack enable && corepack prepare pnpm@10.15.1 --activate
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/apps/api/dist ./dist
COPY --from=build /app/apps/api/package.json ./
COPY --from=build /app/apps/api/prisma ./prisma
COPY --from=build /app/node_modules ./node_modules
COPY scripts/railway-start-api.sh ./start.sh
RUN chmod +x ./start.sh
EXPOSE 3001
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD wget -qO- http://localhost:3001/api/v1/health/ready || exit 1
CMD ["./start.sh"]
