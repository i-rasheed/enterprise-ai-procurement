"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api";

import { settingsRepository } from "../api/settings.repository";
import type { AuditLogFilters } from "../types";
import { apiKeyStorage } from "../utils/api-key-storage";
import { brandingStorage } from "../utils/branding-storage";
import type { BrandingPreferences } from "../types";

export const settingsQueryKeys = {
  all: ["settings"] as const,
  notifications: ["settings", "notifications"] as const,
  auditLogs: (filters: AuditLogFilters) =>
    ["settings", "audit-logs", filters] as const,
  apiKeys: (organisationId: string) =>
    ["settings", "api-keys", organisationId] as const,
  branding: (organisationId: string) =>
    ["settings", "branding", organisationId] as const,
};

export function useNotificationPreferences() {
  return useQuery({
    queryKey: settingsQueryKeys.notifications,
    queryFn: () => settingsRepository.getNotificationPreferences(),
    staleTime: 60 * 1000,
  });
}

export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { emailEnabled: boolean; inAppEnabled: boolean }) =>
      settingsRepository.updateNotificationPreferences(input),
    onSuccess: (data) => {
      queryClient.setQueryData(settingsQueryKeys.notifications, data);
      toast.success("Notification preferences updated");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useSettingsAuditLogs(filters: AuditLogFilters) {
  return useQuery({
    queryKey: settingsQueryKeys.auditLogs(filters),
    queryFn: () => settingsRepository.getAuditLogs(filters),
    staleTime: 30 * 1000,
    placeholderData: (previous) => previous,
  });
}

export function useApiKeys(organisationId?: string) {
  return useQuery({
    queryKey: settingsQueryKeys.apiKeys(organisationId ?? ""),
    queryFn: () => apiKeyStorage.list(organisationId!),
    enabled: Boolean(organisationId),
    staleTime: 0,
  });
}

export function useCreateApiKey(organisationId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name: string) => {
      if (!organisationId) {
        throw new Error("Organisation context is required");
      }
      return Promise.resolve(apiKeyStorage.create(organisationId, name));
    },
    onSuccess: () => {
      if (organisationId) {
        queryClient.invalidateQueries({
          queryKey: settingsQueryKeys.apiKeys(organisationId),
        });
      }
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useRevokeApiKey(organisationId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => {
      apiKeyStorage.revoke(id);
      return Promise.resolve();
    },
    onSuccess: () => {
      if (organisationId) {
        queryClient.invalidateQueries({
          queryKey: settingsQueryKeys.apiKeys(organisationId),
        });
      }
      toast.success("API key revoked");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useBrandingPreferences(organisationId?: string) {
  return useQuery({
    queryKey: settingsQueryKeys.branding(organisationId ?? ""),
    queryFn: () => brandingStorage.get(organisationId!),
    enabled: Boolean(organisationId),
    staleTime: 0,
  });
}

export function useSaveBrandingPreferences(organisationId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (preferences: BrandingPreferences) => {
      if (!organisationId) {
        throw new Error("Organisation context is required");
      }
      return Promise.resolve(
        brandingStorage.save(organisationId, preferences),
      );
    },
    onSuccess: (data) => {
      if (organisationId) {
        queryClient.setQueryData(
          settingsQueryKeys.branding(organisationId),
          data,
        );
      }
      toast.success("Branding preferences saved");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}
