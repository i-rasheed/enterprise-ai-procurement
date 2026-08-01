# API Guide

Base URL: `/api/v1`

## Authentication

All protected endpoints require `Authorization: Bearer <accessToken>`.

| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/register` | Register tenant + admin |
| POST | `/auth/login` | Login |
| POST | `/auth/refresh` | Rotate refresh token |
| POST | `/auth/logout` | Revoke refresh token |
| POST | `/auth/revoke-all` | Revoke all sessions |
| GET | `/auth/mfa/status` | MFA status |
| POST | `/auth/mfa/setup` | Generate MFA secret |

## Response Format

```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "correlationId": "uuid",
    "timestamp": "2026-08-01T12:00:00.000Z"
  }
}
```

Disable wrapper in tests: `ENABLE_RESPONSE_WRAPPER=false`

## Pagination

Offset: `?page=1&limit=20`

Cursor: `?cursor=<id>&limit=20`

## Swagger

Interactive docs at `/docs`

## Correlation IDs

Send `x-correlation-id` header to trace requests across services.
