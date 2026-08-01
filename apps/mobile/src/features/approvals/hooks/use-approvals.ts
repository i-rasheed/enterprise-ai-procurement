import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getErrorMessage } from "@/lib/api";
import { fetchWithOfflineCache } from "@/lib/offline/fetch-with-cache";
import { enqueueSyncItem } from "@/lib/offline/sync-queue";
import { isOnline } from "@/lib/offline/network";
import { useAuthStore } from "@/stores/auth-store";
import { useOfflineStore } from "@/stores/offline-store";

import { approvalRepository } from "../api/approval.repository";

export const approvalQueryKeys = {
  pending: ["approvals", "pending"] as const,
  preferences: ["notifications", "preferences"] as const,
};

export function usePendingApprovals() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const network = useOfflineStore((state) => state.network);
  const markSynced = useOfflineStore((state) => state.markSynced);

  return useQuery({
    queryKey: approvalQueryKeys.pending,
    queryFn: () =>
      fetchWithOfflineCache(
        "approvals.pending",
        () => approvalRepository.getPendingApprovals(),
        network,
        markSynced,
      ),
    enabled: isAuthenticated,
    select: (data) => data.pendingApprovals,
    staleTime: 30_000,
  });
}

export function useApproveWorkflow() {
  const queryClient = useQueryClient();
  const network = useOfflineStore((state) => state.network);
  const setPendingSyncCount = useOfflineStore((state) => state.setPendingSyncCount);

  return useMutation({
    mutationFn: async ({
      workflowId,
      comments,
    }: {
      workflowId: string;
      comments?: string;
    }) => {
      if (!isOnline(network)) {
        const queue = await enqueueSyncItem({
          id: `${workflowId}-approve-${Date.now()}`,
          type: "approve",
          payload: { workflowId, comments },
        });
        setPendingSyncCount(queue.length);
        return { queued: true };
      }

      return approvalRepository.approve(workflowId, { comments });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: approvalQueryKeys.pending });
    },
    onError: (error) => {
      console.warn(getErrorMessage(error));
    },
  });
}

export function useRejectWorkflow() {
  const queryClient = useQueryClient();
  const network = useOfflineStore((state) => state.network);
  const setPendingSyncCount = useOfflineStore((state) => state.setPendingSyncCount);

  return useMutation({
    mutationFn: async ({
      workflowId,
      comments,
      reason,
    }: {
      workflowId: string;
      comments: string;
      reason: string;
    }) => {
      if (!isOnline(network)) {
        const queue = await enqueueSyncItem({
          id: `${workflowId}-reject-${Date.now()}`,
          type: "reject",
          payload: { workflowId, comments, reason },
        });
        setPendingSyncCount(queue.length);
        return { queued: true };
      }

      return approvalRepository.reject(workflowId, { comments, reason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: approvalQueryKeys.pending });
    },
    onError: (error) => {
      console.warn(getErrorMessage(error));
    },
  });
}

export function useNotificationPreferences() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: approvalQueryKeys.preferences,
    queryFn: () => approvalRepository.getNotificationPreferences(),
    enabled: isAuthenticated,
  });
}

export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: approvalRepository.updateNotificationPreferences,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: approvalQueryKeys.preferences });
    },
  });
}
