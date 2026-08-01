# Contributing

## Development Setup

1. Fork and clone the repository
2. `pnpm install`
3. `docker compose up -d postgres redis`
4. Copy `.env.example` to `.env`
5. `pnpm --filter api exec prisma migrate dev`
6. `pnpm --filter api dev`

## Code Standards

- Follow existing NestJS module patterns (repository → service → controller)
- All endpoints must have Swagger documentation
- Scope queries by `organisationId`
- Run `pnpm lint` and `pnpm --filter api test` before submitting PRs

## Commit Messages

Use conventional commits: `feat:`, `fix:`, `chore:`, `docs:`, `test:`

## Pull Requests

- Target `develop` branch
- CI must pass (lint, build, tests, Docker build)
- Include test coverage for new logic
