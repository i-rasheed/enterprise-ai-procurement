import { apiGet, apiPatch, apiPost } from "@/lib/api";
import type {
  LoginResponse,
  MessageResponse,
  UserProfile,
} from "@/lib/api/types";
import {
  clearStoredTokens,
  setStoredTokens,
} from "@/lib/storage/token-storage";

export type LoginInput = {
  email: string;
  password: string;
};

export const authRepository = {
  async login(input: LoginInput): Promise<LoginResponse> {
    const response = await apiPost<LoginResponse>("/auth/login", input);
    await setStoredTokens(response.accessToken, response.refreshToken);
    return response;
  },

  async logout(refreshToken: string): Promise<void> {
    try {
      await apiPost<MessageResponse>("/auth/logout", { refreshToken });
    } finally {
      await clearStoredTokens();
    }
  },

  async getProfile(): Promise<UserProfile> {
    return apiGet<UserProfile>("/users/me");
  },

  async updateProfile(input: {
    firstName: string;
    lastName: string;
  }): Promise<UserProfile> {
    return apiPatch<UserProfile>("/users/me", input);
  },
};
