const apiUrl = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3001/api/v1";
const appName = process.env.EXPO_PUBLIC_APP_NAME ?? "ProcureAI";

export const env = {
  apiUrl,
  appName,
  isDevelopment: __DEV__,
} as const;
