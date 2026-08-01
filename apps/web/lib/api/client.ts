"use client";

import axios, {
  type AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";

import { env } from "@/lib/env";

import { parseApiError } from "./errors";
import type { ApiSuccessResponse } from "./types";

const ACCESS_TOKEN_KEY = "procureai_access_token";
const REFRESH_TOKEN_KEY = "procureai_refresh_token";
const CORRELATION_ID_HEADER = "x-correlation-id";

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

type TokenListener = (tokens: {
  accessToken: string | null;
  refreshToken: string | null;
}) => void;

let refreshPromise: Promise<string | null> | null = null;
const tokenListeners = new Set<TokenListener>();

function generateCorrelationId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function getStoredAccessToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getStoredRefreshToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setStoredTokens(
  accessToken: string | null,
  refreshToken: string | null,
): void {
  if (typeof window === "undefined") {
    return;
  }

  if (accessToken) {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  } else {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
  }

  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  } else {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }

  tokenListeners.forEach((listener) =>
    listener({ accessToken, refreshToken }),
  );
}

export function clearStoredTokens(): void {
  setStoredTokens(null, null);
}

export function subscribeToTokenChanges(listener: TokenListener): () => void {
  tokenListeners.add(listener);
  return () => tokenListeners.delete(listener);
}

function unwrapResponse<T>(payload: unknown): T {
  if (
    payload &&
    typeof payload === "object" &&
    "success" in payload &&
    (payload as ApiSuccessResponse<T>).success === true &&
    "data" in payload
  ) {
    return (payload as ApiSuccessResponse<T>).data;
  }

  return payload as T;
}

async function refreshAccessToken(client: AxiosInstance): Promise<string | null> {
  const refreshToken = getStoredRefreshToken();

  if (!refreshToken) {
    clearStoredTokens();
    return null;
  }

  try {
    const response = await client.post<unknown>("/auth/refresh", {
      refreshToken,
    });
    const data = unwrapResponse<{
      accessToken: string;
      refreshToken: string;
    }>(response.data);

    setStoredTokens(data.accessToken, data.refreshToken);
    return data.accessToken;
  } catch {
    clearStoredTokens();
    return null;
  }
}

function createApiClient(): AxiosInstance {
  const client = axios.create({
    baseURL: env.apiUrl,
    headers: {
      "Content-Type": "application/json",
    },
    timeout: 30_000,
  });

  client.interceptors.request.use((config) => {
    const accessToken = getStoredAccessToken();

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    config.headers[CORRELATION_ID_HEADER] = generateCorrelationId();
    return config;
  });

  client.interceptors.response.use(
    (response) => {
      response.data = unwrapResponse(response.data);
      return response;
    },
    async (error: AxiosError) => {
      const originalRequest = error.config as RetryableRequestConfig | undefined;

      if (
        error.response?.status === 401 &&
        originalRequest &&
        !originalRequest._retry &&
        !originalRequest.url?.includes("/auth/login") &&
        !originalRequest.url?.includes("/auth/register") &&
        !originalRequest.url?.includes("/auth/refresh")
      ) {
        originalRequest._retry = true;

        refreshPromise ??= refreshAccessToken(client).finally(() => {
          refreshPromise = null;
        });

        const newAccessToken = await refreshPromise;

        if (newAccessToken) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return client(originalRequest);
        }
      }

      return Promise.reject(parseApiError(error));
    },
  );

  return client;
}

export const apiClient = createApiClient();

export async function apiGet<T>(url: string, params?: Record<string, unknown>) {
  const response = await apiClient.get<T>(url, { params });
  return response.data;
}

export async function apiPost<T>(url: string, body?: unknown) {
  const response = await apiClient.post<T>(url, body);
  return response.data;
}

export async function apiPatch<T>(url: string, body?: unknown) {
  const response = await apiClient.patch<T>(url, body);
  return response.data;
}

export async function apiPut<T>(url: string, body?: unknown) {
  const response = await apiClient.put<T>(url, body);
  return response.data;
}

export async function apiDelete<T>(url: string) {
  const response = await apiClient.delete<T>(url);
  return response.data;
}
