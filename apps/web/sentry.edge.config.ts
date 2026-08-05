import * as Sentry from "@sentry/nextjs";

import { env } from "@/lib/env";

if (env.isSentryEnabled) {
  Sentry.init({
    dsn: env.sentryDsn,
    tracesSampleRate: env.isProduction ? 0.1 : 1,
    environment: env.isProduction ? "production" : "development",
    enabled: env.isSentryEnabled,
  });
}
