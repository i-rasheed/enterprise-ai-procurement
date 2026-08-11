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

if [ -f ./dist/prisma/schema.prisma ]; then
  SCHEMA="./dist/prisma/schema.prisma"
elif [ -f ./prisma/schema.prisma ]; then
  SCHEMA="./prisma/schema.prisma"
else
  echo "ERROR: Prisma schema not found."
  exit 1
fi

echo "Running database migrations with schema: $SCHEMA"
if [ -x ./node_modules/.bin/prisma ]; then
  ./node_modules/.bin/prisma migrate deploy --schema="$SCHEMA"
elif command -v pnpm >/dev/null 2>&1; then
  pnpm exec prisma migrate deploy --schema="$SCHEMA"
else
  echo "ERROR: prisma CLI not found in ./node_modules/.bin"
  exit 1
fi

echo "Starting API on port ${PORT:-3001}..."
exec node dist/src/main.js
