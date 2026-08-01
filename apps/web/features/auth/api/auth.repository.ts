import {
  apiGet,
  apiPatch,
  apiPost,
  clearStoredTokens,
  setStoredTokens,
} from "@/lib/api";
import type {
  LoginResponse,
  MessageResponse,
  RegisterResponse,
  RevokeSessionsResponse,
  UserProfile,
  VerifyEmailResponse,
} from "@/lib/api/types";

export type LoginInput = {
  email: string;
  password: string;
  rememberMe?: boolean;
};

export type RegisterInput = {
  organisationName: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  rememberMe?: boolean;
};

export type UpdateProfileInput = {
  firstName: string;
  lastName: string;
};

export type ChangePasswordInput = {
  currentPassword: string;
  newPassword: string;
};

export const authRepository = {
  async login(input: LoginInput): Promise<LoginResponse> {
    const { rememberMe = true, ...credentials } = input;
    const response = await apiPost<LoginResponse>("/auth/login", credentials);
    setStoredTokens(
      response.accessToken,
      response.refreshToken,
      rememberMe,
    );
    return response;
  },

  async register(input: RegisterInput): Promise<RegisterResponse> {
    const { rememberMe = true, ...payload } = input;
    const response = await apiPost<RegisterResponse>("/auth/register", payload);
    setStoredTokens(
      response.accessToken,
      response.refreshToken,
      rememberMe,
    );
    return response;
  },

  async logout(refreshToken: string): Promise<void> {
    try {
      await apiPost<MessageResponse>("/auth/logout", { refreshToken });
    } finally {
      clearStoredTokens();
    }
  },

  async forgotPassword(email: string): Promise<MessageResponse> {
    return apiPost<MessageResponse>("/auth/forgot-password", { email });
  },

  async resetPassword(token: string, password: string): Promise<MessageResponse> {
    return apiPost<MessageResponse>("/auth/reset-password", { token, password });
  },

  async verifyEmail(token: string): Promise<VerifyEmailResponse> {
    return apiPost<VerifyEmailResponse>("/auth/verify-email", { token });
  },

  async resendVerification(): Promise<VerifyEmailResponse> {
    return apiPost<VerifyEmailResponse>("/auth/resend-verification");
  },

  async revokeAllSessions(): Promise<RevokeSessionsResponse> {
    return apiPost<RevokeSessionsResponse>("/auth/revoke-all");
  },

  async getProfile(): Promise<UserProfile> {
    return apiGet<UserProfile>("/users/me");
  },

  async updateProfile(input: UpdateProfileInput): Promise<UserProfile> {
    return apiPatch<UserProfile>("/users/me", input);
  },

  async changePassword(input: ChangePasswordInput): Promise<MessageResponse> {
    return apiPatch<MessageResponse>("/users/me/password", input);
  },
};
