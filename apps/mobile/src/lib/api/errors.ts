import type { AxiosError } from "axios";

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

export function parseApiError(error: unknown): ApiClientError {
  if (error instanceof ApiClientError) {
    return error;
  }

  const axiosError = error as AxiosError<ApiErrorResponse>;

  if (axiosError.response?.data?.error) {
    const { code, message, details } = axiosError.response.data.error;
    return new ApiClientError(
      message,
      axiosError.response.status,
      code,
      details,
    );
  }

  if (axiosError.response?.status) {
    return new ApiClientError(
      axiosError.message || "Request failed",
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
    error instanceof Error ? error.message : "Unexpected error",
    500,
  );
}

export function getErrorMessage(error: unknown): string {
  return parseApiError(error).message;
}
