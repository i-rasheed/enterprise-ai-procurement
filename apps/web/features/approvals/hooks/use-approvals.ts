"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { approvalRepository } from "@/features/approvals/api/approval.repository";
import type { AuditLogFilters } from "@/features/approvals/types";
import type {
  ApproveStepFormValues,
  RejectStepFormValues,
} from "@/features/procurement/schemas/procurement.schema";
import { procurementQueryKeys } from "@/features/procurement/hooks/use-procurement";
import { getErrorMessage } from "@/lib/api";

export const approvalQueryKeys = {
  all: ["approvals"] as const,
  pending: ["approvals", "pending"] as const,
  history: (requestId: string) => ["approvals", "history", requestId] as const,
  notifications: ["approvals", "notifications"] as const,
  auditLogs: (filters: AuditLogFilters) =>
    ["approvals", "audit-logs", filters] as const,
};

export function usePendingApprovals() {
  return useQuery({
    queryKey: approvalQueryKeys.pending,
    queryFn: () => approvalRepository.getPendingApprovals(),
    staleTime: 15 * 1000,
  });
}

export function useApprovalHistory(requestId: string, enabled = true) {
  return useQuery({
    queryKey: approvalQueryKeys.history(requestId),
    queryFn: () => approvalRepository.getHistory(requestId),
    enabled: Boolean(requestId) && enabled,
    staleTime: 30 * 1000,
  });
}

export function useApproveFromQueue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      workflowId,
      values,
    }: {
      workflowId: string;
      requestId: string;
      values?: ApproveStepFormValues;
    }) => approvalRepository.approve(workflowId, values),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: approvalQueryKeys.pending });
      queryClient.invalidateQueries({
        queryKey: approvalQueryKeys.history(variables.requestId),
      });
      queryClient.invalidateQueries({
        queryKey: procurementQueryKeys.detail(variables.requestId),
      });
      queryClient.invalidateQueries({ queryKey: procurementQueryKeys.all });
      queryClient.invalidateQueries({
        queryKey: approvalQueryKeys.auditLogs({ page: 1, limit: 20 }),
      });
      toast.success("Approval recorded");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useRejectFromQueue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      workflowId,
      values,
    }: {
      workflowId: string;
      requestId: string;
      values: RejectStepFormValues;
    }) => approvalRepository.reject(workflowId, values),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: approvalQueryKeys.pending });
      queryClient.invalidateQueries({
        queryKey: approvalQueryKeys.history(variables.requestId),
      });
      queryClient.invalidateQueries({
        queryKey: procurementQueryKeys.detail(variables.requestId),
      });
      queryClient.invalidateQueries({ queryKey: procurementQueryKeys.all });
      queryClient.invalidateQueries({
        queryKey: approvalQueryKeys.auditLogs({ page: 1, limit: 20 }),
      });
      toast.success("Request rejected");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useNotifications() {
  return useQuery({
    queryKey: approvalQueryKeys.notifications,
    queryFn: () => approvalRepository.getNotifications(),
    staleTime: 30 * 1000,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => approvalRepository.markNotificationRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: approvalQueryKeys.notifications,
      });
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useAuditLogs(filters: AuditLogFilters) {
  return useQuery({
    queryKey: approvalQueryKeys.auditLogs(filters),
    queryFn: () => approvalRepository.getAuditLogs(filters),
    staleTime: 30 * 1000,
    placeholderData: (previous) => previous,
  });
}
