import {
  apiGet,
  apiPost,
  clearStoredTokens,
  setStoredTokens,
} from "@/lib/api";
import type {
  JwtPayload,
  LoginResponse,
  RegisterResponse,
} from "@/lib/api/types";

export type LoginInput = {
  email: string;
  password: string;
};

export type RegisterInput = {
  organisationName: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
};

export const authRepository = {
  async login(input: LoginInput): Promise<LoginResponse> {
    const response = await apiPost<LoginResponse>("/auth/login", input);
    setStoredTokens(response.accessToken, response.refreshToken);
    return response;
  },

  async register(input: RegisterInput): Promise<RegisterResponse> {
    const response = await apiPost<RegisterResponse>("/auth/register", input);
    setStoredTokens(response.accessToken, response.refreshToken);
    return response;
  },

  async logout(refreshToken: string): Promise<void> {
    try {
      await apiPost<{ message: string }>("/auth/logout", { refreshToken });
    } finally {
      clearStoredTokens();
    }
  },

  async getProfile(): Promise<JwtPayload> {
    return apiGet<JwtPayload>("/users/me");
  },
};
