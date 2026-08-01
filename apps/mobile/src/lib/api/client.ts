import axios, {
  type AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";

import { env } from "@/lib/env";
import {
  clearStoredTokens,
  getStoredAccessToken,
  getStoredRefreshToken,
  setStoredTokens,
} from "@/lib/storage/token-storage";

import { parseApiError } from "./errors";
import type { ApiSuccessResponse, LoginResponse } from "./types";

const CORRELATION_ID_HEADER = "x-correlation-id";

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

function generateCorrelationId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
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

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(client: AxiosInstance): Promise<string | null> {
  const refreshToken = await getStoredRefreshToken();

  if (!refreshToken) {
    await clearStoredTokens();
    return null;
  }

  try {
    const response = await client.post<unknown>("/auth/refresh", {
      refreshToken,
    });
    const data = unwrapResponse<LoginResponse>(response.data);
    await setStoredTokens(data.accessToken, data.refreshToken);
    return data.accessToken;
  } catch {
    await clearStoredTokens();
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

  client.interceptors.request.use(async (config) => {
    const accessToken = await getStoredAccessToken();

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
      const url = originalRequest?.url ?? "";

      if (
        error.response?.status === 401 &&
        originalRequest &&
        !originalRequest._retry &&
        !url.includes("/auth/login") &&
        !url.includes("/auth/register") &&
        !url.includes("/auth/refresh")
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

export async function apiDelete<T>(url: string) {
  const response = await apiClient.delete<T>(url);
  return response.data;
}
