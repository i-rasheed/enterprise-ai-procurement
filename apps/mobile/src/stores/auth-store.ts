import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

import type { OrganisationSummary, SafeUser, UserProfile } from "@/lib/api/types";
import {
  clearStoredTokens,
  getStoredAccessToken,
  setStoredTokens,
} from "@/lib/storage/token-storage";

export type AuthState = {
  user: SafeUser | null;
  organisation: OrganisationSummary | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  setSession: (payload: {
    user: SafeUser;
    organisation?: OrganisationSummary | null;
    accessToken: string;
    refreshToken: string;
  }) => Promise<void>;
  setUserProfile: (profile: UserProfile) => void;
  clearSession: () => Promise<void>;
  setHydrated: (value: boolean) => void;
  bootstrap: () => Promise<void>;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      organisation: null,
      isAuthenticated: false,
      isHydrated: false,

      setSession: async ({ user, organisation, accessToken, refreshToken }) => {
        await setStoredTokens(accessToken, refreshToken);
        set({
          user,
          organisation: organisation ?? null,
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

      clearSession: async () => {
        await clearStoredTokens();
        set({
          user: null,
          organisation: null,
          isAuthenticated: false,
        });
      },

      setHydrated: (value) => set({ isHydrated: value }),

      bootstrap: async () => {
        const accessToken = await getStoredAccessToken();
        const { user } = get();
        set({
          isAuthenticated: Boolean(accessToken && user),
          isHydrated: true,
        });
      },
    }),
    {
      name: "procureai-mobile-auth",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        organisation: state.organisation,
      }),
      onRehydrateStorage: () => async (state) => {
        await state?.bootstrap();
      },
    },
  ),
);
