#!/bin/sh
set -e

echo "=== SpendWise API startup ==="
echo "NODE_ENV=${NODE_ENV:-unset} PORT=${PORT:-unset}"

if [ -z "$DATABASE_URL" ]; then
  echo "ERROR: DATABASE_URL is required. Link Postgres in Railway variables."
  exit 1
fi

if [ -z "$JWT_ACCESS_SECRET" ] || [ -z "$JWT_REFRESH_SECRET" ]; then
  echo "ERROR: JWT_ACCESS_SECRET and JWT_REFRESH_SECRET are required."
  exit 1
fi

echo "Running database migrations..."
npx prisma migrate deploy --schema=prisma/schema.prisma

echo "Starting API on port ${PORT:-3001}..."
exec node dist/main.js
