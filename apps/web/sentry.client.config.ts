import * as Sentry from "@sentry/nextjs";

import { env } from "@/lib/env";

if (env.isSentryEnabled) {
  Sentry.init({
    dsn: env.sentryDsn,
    tracesSampleRate: env.isProduction ? 0.1 : 1,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: env.isProduction ? 0.25 : 0,
    environment: env.isProduction ? "production" : "development",
    enabled: env.isSentryEnabled,
  });
}
