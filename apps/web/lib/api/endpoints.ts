import { env } from "@/lib/env";

/**
 * Auth endpoints aligned with NestJS Swagger `@ApiTags('auth')` and `@ApiTags('users')`.
 * @see {env.apiDocsUrl}
 */
export const authEndpoints = {
  login: { method: "POST", path: "/auth/login", tag: "auth" },
  register: { method: "POST", path: "/auth/register", tag: "auth" },
  refresh: { method: "POST", path: "/auth/refresh", tag: "auth" },
  logout: { method: "POST", path: "/auth/logout", tag: "auth" },
  forgotPassword: { method: "POST", path: "/auth/forgot-password", tag: "auth" },
  resetPassword: { method: "POST", path: "/auth/reset-password", tag: "auth" },
  verifyEmail: { method: "POST", path: "/auth/verify-email", tag: "auth" },
  resendVerification: {
    method: "POST",
    path: "/auth/resend-verification",
    tag: "auth",
    auth: true,
  },
  revokeAllSessions: {
    method: "POST",
    path: "/auth/revoke-all",
    tag: "auth",
    auth: true,
  },
  profile: { method: "GET", path: "/users/me", tag: "users", auth: true },
  updateProfile: { method: "PATCH", path: "/users/me", tag: "users", auth: true },
  changePassword: {
    method: "PATCH",
    path: "/users/me/password",
    tag: "users",
    auth: true,
  },
} as const;

export function getSwaggerDocsUrl(): string {
  return env.apiDocsUrl;
}
