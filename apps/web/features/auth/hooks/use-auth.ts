"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

import { authRepository } from "@/features/auth/api/auth.repository";
import type {
  ChangePasswordFormValues,
  ForgotPasswordFormValues,
  LoginFormValues,
  ProfileFormValues,
  RegisterFormValues,
  ResetPasswordFormValues,
} from "@/features/auth/schemas/auth.schema";
import { getErrorMessage } from "@/lib/api";
import type { LoginResponse, UserProfile } from "@/lib/api/types";
import { useAuthStore } from "@/stores/auth-store";

export const authQueryKeys = {
  profile: ["auth", "profile"] as const,
};

export function useAuthProfile(enabled = true) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const setUserProfile = useAuthStore((state) => state.setUserProfile);

  return useQuery({
    queryKey: authQueryKeys.profile,
    queryFn: async () => {
      const profile = await authRepository.getProfile();
      setUserProfile(profile);
      return profile;
    },
    enabled: enabled && isAuthenticated,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}

function applySession(
  data: LoginResponse,
  rememberMe: boolean | undefined,
  setSession: ReturnType<typeof useAuthStore.getState>["setSession"],
) {
  setSession({
    user: data.user,
    organisation: data.organisation,
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    rememberMe: rememberMe ?? true,
  });
}

export function useLogin() {
  const router = useRouter();
  const setSession = useAuthStore((state) => state.setSession);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: LoginFormValues) => authRepository.login(values),
    onSuccess: (data, variables) => {
      applySession(data, variables.rememberMe, setSession);
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

  return useMutation({
    mutationFn: (values: RegisterFormValues) => authRepository.register(values),
    onSuccess: (data) => {
      toast.success("Check your email");
      router.push(
        `/register/pending?email=${encodeURIComponent(data.email)}`,
      );
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (values: ForgotPasswordFormValues) =>
      authRepository.forgotPassword(values.email),
    onSuccess: (data) => {
      toast.success(data.message);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useResetPassword() {
  const router = useRouter();

  return useMutation({
    mutationFn: ({
      token,
      values,
    }: {
      token: string;
      values: ResetPasswordFormValues;
    }) => authRepository.resetPassword(token, values.password),
    onSuccess: (data) => {
      toast.success(data.message);
      router.push("/login");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useVerifyEmail() {
  const router = useRouter();
  const setSession = useAuthStore((state) => state.setSession);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (token: string) => authRepository.verifyEmail(token),
    onSuccess: (data) => {
      toast.success(data.message);

      if (data.user && data.accessToken && data.refreshToken) {
        setSession({
          user: data.user,
          organisation: data.organisation ?? null,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          rememberMe: true,
        });
        queryClient.invalidateQueries({ queryKey: authQueryKeys.profile });
        router.push("/dashboard");
      }
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useResendVerification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authRepository.resendVerification(),
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: authQueryKeys.profile });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const setUserProfile = useAuthStore((state) => state.setUserProfile);

  return useMutation({
    mutationFn: (values: ProfileFormValues) =>
      authRepository.updateProfile(values),
    onSuccess: (profile) => {
      setUserProfile(profile);
      queryClient.setQueryData(authQueryKeys.profile, profile);
      toast.success("Profile updated");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (values: ChangePasswordFormValues) =>
      authRepository.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      }),
    onSuccess: (data) => {
      toast.success(data.message);
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

export function useRevokeAllSessions() {
  const logout = useLogout();

  return useMutation({
    mutationFn: () => authRepository.revokeAllSessions(),
    onSuccess: (data) => {
      toast.success(`${data.message} (${data.revokedCount} sessions)`);
      logout.mutate();
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useAuthSessionSync() {
  const setSession = useAuthStore((state) => state.setSession);
  const clearSession = useAuthStore((state) => state.clearSession);
  const setUserProfile = useAuthStore((state) => state.setUserProfile);

  useEffect(() => {
    function handleRefresh(event: Event) {
      const detail = (event as CustomEvent<LoginResponse>).detail;
      setSession({
        user: detail.user,
        organisation: detail.organisation,
        accessToken: detail.accessToken,
        refreshToken: detail.refreshToken,
      });
    }

    window.addEventListener("auth:session-refreshed", handleRefresh);
    return () =>
      window.removeEventListener("auth:session-refreshed", handleRefresh);
  }, [setSession]);

  useEffect(() => {
    function handleProfileRefresh(event: Event) {
      const detail = (event as CustomEvent<UserProfile>).detail;
      setUserProfile(detail);
    }

    window.addEventListener("auth:profile-updated", handleProfileRefresh);
    return () =>
      window.removeEventListener("auth:profile-updated", handleProfileRefresh);
  }, [setUserProfile, clearSession]);
}
