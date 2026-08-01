"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { authRepository } from "@/features/auth/api/auth.repository";
import type {
  LoginFormValues,
  RegisterFormValues,
} from "@/features/auth/schemas/auth.schema";
import { getErrorMessage } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";

export const authQueryKeys = {
  profile: ["auth", "profile"] as const,
};

export function useAuthProfile(enabled = true) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const setProfile = useAuthStore((state) => state.setProfile);

  return useQuery({
    queryKey: authQueryKeys.profile,
    queryFn: async () => {
      const profile = await authRepository.getProfile();
      setProfile(profile);
      return profile;
    },
    enabled: enabled && isAuthenticated,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}

export function useLogin() {
  const router = useRouter();
  const setSession = useAuthStore((state) => state.setSession);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: LoginFormValues) => authRepository.login(values),
    onSuccess: (data) => {
      setSession({
        user: data.user,
        organisation: data.organisation,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      });
      queryClient.invalidateQueries({ queryKey: authQueryKeys.profile });
      toast.success("Welcome back!");
      router.push("/dashboard");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useRegister() {
  const router = useRouter();
  const setSession = useAuthStore((state) => state.setSession);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: RegisterFormValues) => authRepository.register(values),
    onSuccess: (data) => {
      setSession({
        user: data.user,
        organisation: data.organisation,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      });
      queryClient.invalidateQueries({ queryKey: authQueryKeys.profile });
      toast.success("Account created successfully");
      router.push("/dashboard");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useLogout() {
  const router = useRouter();
  const refreshToken = useAuthStore((state) => state.refreshToken);
  const clearSession = useAuthStore((state) => state.clearSession);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (refreshToken) {
        await authRepository.logout(refreshToken);
        return;
      }
      clearSession();
    },
    onSuccess: () => {
      clearSession();
      queryClient.clear();
      toast.success("Signed out");
      router.push("/login");
    },
    onError: (error) => {
      clearSession();
      queryClient.clear();
      toast.error(getErrorMessage(error));
      router.push("/login");
    },
  });
}
