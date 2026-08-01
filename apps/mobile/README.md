# ProcureAI Mobile

Expo React Native app for the enterprise procurement platform.

## Features

- JWT authentication with secure token storage
- Expo Router navigation with auth and tab flows
- Axios API client with refresh-token handling
- Light/dark theme system
- Offline cache and React Query persistence
- Push notification registration and in-app alerts
- Reusable UI components

## Setup

1. Copy environment variables:

```bash
cp .env.example .env
```

2. Install dependencies from the repo root:

```bash
pnpm install
```

3. Start the app:

```bash
pnpm --filter mobile start
```

Set `EXPO_PUBLIC_API_URL` to your API base URL (default `http://localhost:3001/api/v1`).

## Scripts

- `pnpm --filter mobile start` — start Expo dev server
- `pnpm --filter mobile ios` — run on iOS simulator
- `pnpm --filter mobile android` — run on Android emulator
- `pnpm --filter mobile typecheck` — TypeScript check
