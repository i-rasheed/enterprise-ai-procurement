const requiredEnv = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL,
  appName: process.env.NEXT_PUBLIC_APP_NAME ?? "ProcureAI",
  apiDocsUrl: process.env.NEXT_PUBLIC_API_DOCS_URL ?? "http://localhost:3001/docs",
} as const;

const nodeEnv = process.env.NODE_ENV;

export const env = {
  apiUrl: requiredEnv.apiUrl ?? "http://localhost:3001/api/v1",
  apiDocsUrl: requiredEnv.apiDocsUrl,
  appName: requiredEnv.appName,
  isDevelopment: nodeEnv !== "production",
  isProduction: nodeEnv === "production",
} as const;

export function assertClientEnv(): void {
  if (typeof window === "undefined") {
    return;
  }

  if (!requiredEnv.apiUrl && env.isProduction) {
    console.error("NEXT_PUBLIC_API_URL is not configured.");
  }
}
