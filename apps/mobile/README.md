# ProcureAI Mobile

Expo React Native app for the enterprise procurement platform.

## Features

- JWT authentication with secure token storage
- Dashboard with executive KPIs and quick links
- Approvals inbox with approve/reject (offline queue support)
- Purchase orders, invoices, and contracts lists + detail views
- Vendor portal hub (RFQs, bids, POs, invoices, contracts)
- AI assistant chat with persisted conversation history
- Push notification registration, preferences, and local alerts
- Offline cache, React Query persistence, and reconnect sync queue
- Reusable UI components and tab + stack navigation

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
