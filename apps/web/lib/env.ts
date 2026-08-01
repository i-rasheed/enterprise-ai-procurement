const requiredEnv = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL,
  appName: process.env.NEXT_PUBLIC_APP_NAME ?? "ProcureAI",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  apiDocsUrl: process.env.NEXT_PUBLIC_API_DOCS_URL ?? "http://localhost:3001/docs",
  sentryDsn: process.env.NEXT_PUBLIC_SENTRY_DSN ?? "",
} as const;

const nodeEnv = process.env.NODE_ENV;

export const env = {
  apiUrl: requiredEnv.apiUrl ?? "http://localhost:3001/api/v1",
  apiDocsUrl: requiredEnv.apiDocsUrl,
  appName: requiredEnv.appName,
  siteUrl: requiredEnv.siteUrl,
  sentryDsn: requiredEnv.sentryDsn,
  isDevelopment: nodeEnv !== "production",
  isProduction: nodeEnv === "production",
  isSentryEnabled: Boolean(requiredEnv.sentryDsn),
} as const;

export function assertClientEnv(): void {
  if (typeof window === "undefined") {
    return;
  }

  if (!requiredEnv.apiUrl && env.isProduction) {
    console.error("NEXT_PUBLIC_API_URL is not configured.");
  }
}
