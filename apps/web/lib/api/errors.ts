import type { AxiosError } from "axios";

import {
  formatErrorMessage,
  shouldFormatForClient,
} from "./format-error-message";
import type { ApiErrorResponse } from "./types";

export class ApiClientError extends Error {
  readonly statusCode: number;
  readonly code: string;
  readonly details?: unknown;

  constructor(
    message: string,
    statusCode: number,
    code = "UNKNOWN_ERROR",
    details?: unknown,
  ) {
    super(message);
    this.name = "ApiClientError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

function normalizeMessage(message: string, statusCode: number): string {
  const trimmed = message.trim();
  if (!trimmed) {
    return statusCode >= 500
      ? "Internal server error"
      : "Request failed. Please try again.";
  }

  if (shouldFormatForClient(trimmed) || statusCode >= 500) {
    return formatErrorMessage(trimmed);
  }

  return stripPlainText(trimmed);
}

function stripPlainText(message: string): string {
  return message.replace(/`/g, "").replace(/\s+/g, " ").trim();
}

export function parseApiError(error: unknown): ApiClientError {
  if (error instanceof ApiClientError) {
    return error;
  }

  const axiosError = error as AxiosError<
    ApiErrorResponse | { statusCode?: number; message?: string | string[] }
  >;

  if (axiosError.response?.data) {
    const data = axiosError.response.data;

    if ("error" in data && data.error?.message) {
      const { code, message, details } = data.error;
      return new ApiClientError(
        normalizeMessage(message, axiosError.response.status),
        axiosError.response.status,
        code,
        details,
      );
    }

    if ("message" in data && data.message) {
      const message = Array.isArray(data.message)
        ? data.message.join(", ")
        : data.message;
      return new ApiClientError(
        normalizeMessage(message, axiosError.response.status),
        axiosError.response.status,
      );
    }
  }

  if (axiosError.response?.status) {
    return new ApiClientError(
      normalizeMessage(
        axiosError.message || "Request failed",
        axiosError.response.status,
      ),
      axiosError.response.status,
    );
  }

  if (axiosError.request) {
    return new ApiClientError(
      "Unable to reach the server. Check your connection.",
      0,
      "NETWORK_ERROR",
    );
  }

  return new ApiClientError(
    normalizeMessage(
      error instanceof Error ? error.message : "Unexpected error",
      500,
    ),
    500,
  );
}

export function getErrorMessage(error: unknown): string {
  return parseApiError(error).message;
}
