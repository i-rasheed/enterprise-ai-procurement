export const SESSION_COOKIE = "spendwise_session";
export const REMEMBER_ME_KEY = "spendwise_remember_me";
export const ACCESS_TOKEN_KEY = "spendwise_access_token";
export const REFRESH_TOKEN_KEY = "spendwise_refresh_token";

export type TokenStorage = Storage;

export function getRememberMePreference(): boolean {
  if (typeof window === "undefined") {
    return true;
  }

  return localStorage.getItem(REMEMBER_ME_KEY) !== "false";
}

export function setRememberMePreference(remember: boolean): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(REMEMBER_ME_KEY, remember ? "true" : "false");
}

export function getTokenStorage(): TokenStorage {
  if (typeof window === "undefined") {
    return localStorage;
  }

  return getRememberMePreference() ? localStorage : sessionStorage;
}

export function setSessionCookie(): void {
  if (typeof document === "undefined") {
    return;
  }

  const maxAge = getRememberMePreference() ? 60 * 60 * 24 * 30 : undefined;
  const parts = [
    `${SESSION_COOKIE}=1`,
    "path=/",
    "SameSite=Lax",
    maxAge ? `max-age=${maxAge}` : "",
  ].filter(Boolean);

  document.cookie = parts.join("; ");
}

export function clearSessionCookie(): void {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = `${SESSION_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
}

export function hasSessionCookie(): boolean {
  if (typeof document === "undefined") {
    return false;
  }

  return document.cookie.split(";").some((part) => {
    const [name, value] = part.trim().split("=");
    return name === SESSION_COOKIE && value === "1";
  });
}
