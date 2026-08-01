import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getErrorMessage } from "@/lib/api";
import { getOfflineCache, setOfflineCache } from "@/lib/offline/cache";
import { isOnline } from "@/lib/offline/network";
import { useAuthStore } from "@/stores/auth-store";
import { useOfflineStore } from "@/stores/offline-store";
import { getStoredRefreshToken } from "@/lib/storage/token-storage";

import { authRepository } from "../api/auth.repository";
import type { LoginFormValues } from "../schemas/login.schema";

export const authQueryKeys = {
  profile: ["auth", "profile"] as const,
};

export function useLogin() {
  const setSession = useAuthStore((state) => state.setSession);

  return useMutation({
    mutationFn: (values: LoginFormValues) => authRepository.login(values),
    onSuccess: async (data) => {
      await setSession({
        user: data.user,
        organisation: data.organisation,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      });
    },
  });
}

export function useLogout() {
  const clearSession = useAuthStore((state) => state.clearSession);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const refreshToken = await getStoredRefreshToken();
      if (refreshToken) {
        await authRepository.logout(refreshToken);
      } else {
        await clearSession();
      }
    },
    onSettled: async () => {
      await clearSession();
      queryClient.clear();
    },
  });
}

export function useProfile() {
  const setUserProfile = useAuthStore((state) => state.setUserProfile);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const network = useOfflineStore((state) => state.network);

  return useQuery({
    queryKey: authQueryKeys.profile,
    queryFn: async () => {
      try {
        const profile = await authRepository.getProfile();
        setUserProfile(profile);
        await setOfflineCache("profile", profile);
        return profile;
      } catch (error) {
        if (!isOnline(network)) {
          const cached = await getOfflineCache<
            Awaited<ReturnType<typeof authRepository.getProfile>>
          >("profile");
          if (cached) {
            setUserProfile(cached);
            return cached;
          }
        }
        throw error;
      }
    },
    enabled: isAuthenticated,
    staleTime: 60_000,
  });
}

export function getLoginErrorMessage(error: unknown): string {
  return getErrorMessage(error);
}
