#!/bin/sh
set -e

APP_DIR="$(CDPATH= cd "$(dirname "$0")/.." && pwd)"
cd "$APP_DIR"

echo "=== SpendWise API startup ==="
echo "Working directory: $APP_DIR"
echo "NODE_ENV=${NODE_ENV:-unset} PORT=${PORT:-unset}"

if [ -z "$DATABASE_URL" ]; then
  echo "ERROR: DATABASE_URL is required. Link Postgres in Railway variables."
  exit 1
fi

if [ -z "$JWT_ACCESS_SECRET" ] || [ -z "$JWT_REFRESH_SECRET" ]; then
  echo "ERROR: JWT_ACCESS_SECRET and JWT_REFRESH_SECRET are required."
  exit 1
fi

if [ -f "$APP_DIR/dist/prisma/schema.prisma" ]; then
  SCHEMA="$APP_DIR/dist/prisma/schema.prisma"
elif [ -f "$APP_DIR/prisma/schema.prisma" ]; then
  SCHEMA="$APP_DIR/prisma/schema.prisma"
else
  echo "ERROR: Prisma schema not found in dist/prisma or prisma."
  ls -la "$APP_DIR" || true
  exit 1
fi

echo "Running database migrations with schema: $SCHEMA"
pnpm exec prisma migrate deploy --schema="$SCHEMA"

echo "Starting API on port ${PORT:-3001}..."
exec node dist/src/main.js
