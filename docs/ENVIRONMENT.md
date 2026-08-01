# Environment Variables

See [.env.example](../.env.example) for the full list.

## Required

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_ACCESS_SECRET` | JWT signing secret (min 8 chars, 32+ recommended for production) |
| `JWT_REFRESH_SECRET` | Refresh token secret |

## Recommended for Production

| Variable | Description |
|----------|-------------|
| `REDIS_URL` | Redis for cache and job queues |
| `CORS_ORIGINS` | Comma-separated allowed origins |
| `RATE_LIMIT_MAX` | Requests per window (default 100) |
| `LOG_LEVEL` | Pino log level |
| `STORAGE_PROVIDER` | `local`, `s3`, `minio`, `r2` |
| `OPENAI_API_KEY` | Required for AI features |

## Security

| Variable | Default | Description |
|----------|---------|-------------|
| `ACCOUNT_LOCKOUT_THRESHOLD` | 5 | Failed logins before lockout |
| `ACCOUNT_LOCKOUT_DURATION_MINUTES` | 15 | Lockout duration |
| `ENABLE_RESPONSE_WRAPPER` | true | Unified API response format |
