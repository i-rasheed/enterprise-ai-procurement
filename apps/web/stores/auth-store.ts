"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { JwtPayload, OrganisationSummary, SafeUser } from "@/lib/api/types";
import {
  clearStoredTokens,
  getStoredAccessToken,
  setStoredTokens,
  subscribeToTokenChanges,
} from "@/lib/api/client";

export type AuthState = {
  user: SafeUser | null;
  organisation: OrganisationSummary | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  setSession: (payload: {
    user: SafeUser;
    organisation?: OrganisationSummary | null;
    accessToken: string;
    refreshToken: string;
  }) => void;
  setProfile: (profile: JwtPayload) => void;
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
      isAuthenticated: false,
      isHydrated: false,

      setSession: ({ user, organisation, accessToken, refreshToken }) => {
        setStoredTokens(accessToken, refreshToken);
        set({
          user,
          organisation: organisation ?? null,
          accessToken,
          refreshToken,
          isAuthenticated: true,
        });
      },

      setProfile: (profile) => {
        set((state) => ({
          user: state.user
            ? {
                ...state.user,
                id: profile.sub,
                email: profile.email,
                role: profile.role,
                organisationId: profile.organisationId ?? null,
              }
            : {
                id: profile.sub,
                email: profile.email,
                firstName: "",
                lastName: "",
                role: profile.role,
                isVerified: true,
                organisationId: profile.organisationId ?? null,
                createdAt: "",
                updatedAt: "",
              },
          isAuthenticated: true,
        }));
      },

      clearSession: () => {
        clearStoredTokens();
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
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        const token = getStoredAccessToken();
        if (token && state) {
          state.accessToken = token;
          state.isAuthenticated = Boolean(state.user);
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
