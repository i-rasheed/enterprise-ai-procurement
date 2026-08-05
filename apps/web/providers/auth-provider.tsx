"use client";

import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
} from "react";

import {
  useAuthProfile,
  useAuthSessionSync,
} from "@/features/auth/hooks/use-auth";
import type { OrganisationSummary, SafeUser, UserProfile } from "@/lib/api/types";
import { useAuthStore } from "@/stores/auth-store";

type AuthContextValue = {
  user: SafeUser | null;
  organisation: OrganisationSummary | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  isLoading: boolean;
  profile: UserProfile | undefined;
  requireAuth: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  useAuthSessionSync();

  const user = useAuthStore((state) => state.user);
  const organisation = useAuthStore((state) => state.organisation);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isHydrated = useAuthStore((state) => state.isHydrated);

  const { data: profile, isLoading, isFetching } = useAuthProfile(
    isHydrated && isAuthenticated,
  );

  const requireAuth = useCallback(() => {
    if (isHydrated && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, isHydrated, router]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      organisation,
      isAuthenticated,
      isHydrated,
      isLoading: !isHydrated || (isAuthenticated && (isLoading || isFetching)),
      profile,
      requireAuth,
    }),
    [
      user,
      organisation,
      isAuthenticated,
      isHydrated,
      isLoading,
      isFetching,
      profile,
      requireAuth,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
