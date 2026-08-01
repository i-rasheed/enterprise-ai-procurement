"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import {
  clearSessionCookie,
  getRememberMePreference,
  setSessionCookie,
} from "@/lib/auth/session";
import type { OrganisationSummary, SafeUser, UserProfile } from "@/lib/api/types";
import {
  clearStoredTokens,
  getStoredAccessToken,
  getStoredRefreshToken,
  setStoredTokens,
  subscribeToTokenChanges,
} from "@/lib/api/client";

export type AuthState = {
  user: SafeUser | null;
  organisation: OrganisationSummary | null;
  accessToken: string | null;
  refreshToken: string | null;
  rememberMe: boolean;
  isAuthenticated: boolean;
  isHydrated: boolean;
  setSession: (payload: {
    user: SafeUser;
    organisation?: OrganisationSummary | null;
    accessToken: string;
    refreshToken: string;
    rememberMe?: boolean;
  }) => void;
  setUserProfile: (profile: UserProfile) => void;
  clearSession: () => void;
  setHydrated: (value: boolean) => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      organisation: null,
      accessToken: null,
      refreshToken: null,
      rememberMe: true,
      isAuthenticated: false,
      isHydrated: false,

      setSession: ({
        user,
        organisation,
        accessToken,
        refreshToken,
        rememberMe = getRememberMePreference(),
      }) => {
        setStoredTokens(accessToken, refreshToken, rememberMe);
        setSessionCookie();
        set({
          user,
          organisation: organisation ?? null,
          accessToken,
          refreshToken,
          rememberMe,
          isAuthenticated: true,
        });
      },

      setUserProfile: (profile) => {
        set((state) => ({
          user: {
            id: profile.id,
            email: profile.email,
            firstName: profile.firstName,
            lastName: profile.lastName,
            role: profile.role,
            isVerified: profile.isVerified,
            organisationId: profile.organisationId,
            createdAt: profile.createdAt,
            updatedAt: profile.updatedAt,
          },
          organisation: profile.organisationName
            ? {
                id: profile.organisationId,
                name: profile.organisationName,
              }
            : state.organisation,
          isAuthenticated: true,
        }));
      },

      clearSession: () => {
        clearStoredTokens();
        clearSessionCookie();
        set({
          user: null,
          organisation: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },

      setHydrated: (value) => set({ isHydrated: value }),
    }),
    {
      name: "procureai-auth",
      partialize: (state) => ({
        user: state.user,
        organisation: state.organisation,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        rememberMe: state.rememberMe,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        const token = getStoredAccessToken();
        const refreshToken = getStoredRefreshToken();
        if (token && state) {
          state.accessToken = token;
          state.refreshToken = refreshToken;
          state.isAuthenticated = Boolean(state.user);
          if (state.isAuthenticated) {
            setSessionCookie();
          }
        }
        state?.setHydrated(true);
      },
    },
  ),
);

if (typeof window !== "undefined") {
  subscribeToTokenChanges(({ accessToken, refreshToken }) => {
    useAuthStore.setState({
      accessToken,
      refreshToken,
      isAuthenticated: Boolean(accessToken && useAuthStore.getState().user),
    });
  });
}
