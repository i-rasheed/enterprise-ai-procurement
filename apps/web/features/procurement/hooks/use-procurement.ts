"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { procurementRepository } from "@/features/procurement/api/procurement.repository";
import type { ProcurementFilters } from "@/features/procurement/types";
import type {
  ApproveStepFormValues,
  ProcurementItemFormValues,
  ProcurementRequestFormValues,
  RejectStepFormValues,
  SubmitProcurementFormValues,
} from "@/features/procurement/schemas/procurement.schema";
import { getErrorMessage } from "@/lib/api";

export const procurementQueryKeys = {
  all: ["procurement-requests"] as const,
  list: (filters: ProcurementFilters) =>
    ["procurement-requests", "list", filters] as const,
  detail: (id: string) => ["procurement-requests", "detail", id] as const,
  approvalHistory: (id: string) =>
    ["procurement-requests", "approval-history", id] as const,
};

export function useProcurementRequests(filters: ProcurementFilters) {
  return useQuery({
    queryKey: procurementQueryKeys.list(filters),
    queryFn: () => procurementRepository.list(filters),
    staleTime: 30 * 1000,
    placeholderData: (previous) => previous,
  });
}

export function useProcurementRequest(id: string) {
  return useQuery({
    queryKey: procurementQueryKeys.detail(id),
    queryFn: () => procurementRepository.getById(id),
    enabled: Boolean(id),
    staleTime: 30 * 1000,
  });
}

export function useApprovalHistory(requestId: string, enabled = true) {
  return useQuery({
    queryKey: procurementQueryKeys.approvalHistory(requestId),
    queryFn: () => procurementRepository.getApprovalHistory(requestId),
    enabled: Boolean(requestId) && enabled,
    staleTime: 30 * 1000,
  });
}

export function useCreateProcurementRequest() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: ProcurementRequestFormValues) =>
      procurementRepository.create(values),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: procurementQueryKeys.all });
      toast.success("Procurement request created");
      router.push(`/dashboard/procurement/${data.id}`);
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useUpdateProcurementRequest(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: Partial<ProcurementRequestFormValues>) =>
      procurementRepository.update(id, values),
    onSuccess: (data) => {
      queryClient.setQueryData(procurementQueryKeys.detail(id), data);
      queryClient.invalidateQueries({ queryKey: procurementQueryKeys.all });
      toast.success("Procurement request updated");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useDeleteProcurementRequest() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => procurementRepository.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: procurementQueryKeys.all });
      toast.success("Procurement request deleted");
      router.push("/dashboard/procurement");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useSubmitProcurementRequest(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values?: SubmitProcurementFormValues) =>
      procurementRepository.submit(id, values),
    onSuccess: (data) => {
      queryClient.setQueryData(procurementQueryKeys.detail(id), data);
      queryClient.invalidateQueries({ queryKey: procurementQueryKeys.all });
      queryClient.invalidateQueries({
        queryKey: procurementQueryKeys.approvalHistory(id),
      });
      toast.success("Procurement request submitted for approval");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useAddProcurementItem(requestId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: ProcurementItemFormValues) =>
      procurementRepository.addItem(requestId, values),
    onSuccess: (data) => {
      queryClient.setQueryData(procurementQueryKeys.detail(requestId), data);
      toast.success("Line item added");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useRemoveProcurementItem(requestId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemId: string) => procurementRepository.removeItem(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: procurementQueryKeys.detail(requestId),
      });
      toast.success("Line item removed");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useApproveWorkflow(requestId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      workflowId,
      values,
    }: {
      workflowId: string;
      values?: ApproveStepFormValues;
    }) => procurementRepository.approveWorkflow(workflowId, values),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: procurementQueryKeys.detail(requestId),
      });
      queryClient.invalidateQueries({
        queryKey: procurementQueryKeys.approvalHistory(requestId),
      });
      queryClient.invalidateQueries({ queryKey: procurementQueryKeys.all });
      toast.success("Approval recorded");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useRejectWorkflow(requestId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      workflowId,
      values,
    }: {
      workflowId: string;
      values: RejectStepFormValues;
    }) => procurementRepository.rejectWorkflow(workflowId, values),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: procurementQueryKeys.detail(requestId),
      });
      queryClient.invalidateQueries({
        queryKey: procurementQueryKeys.approvalHistory(requestId),
      });
      queryClient.invalidateQueries({ queryKey: procurementQueryKeys.all });
      toast.success("Request rejected");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}
