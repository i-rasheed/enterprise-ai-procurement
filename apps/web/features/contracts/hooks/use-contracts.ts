"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { contractRepository } from "@/features/contracts/api/contract.repository";
import type { ContractFilters } from "@/features/contracts/types";
import type {
  CreateContractFormValues,
  RenewContractFormValues,
  TerminateContractFormValues,
  UpdateContractFormValues,
  UploadContractDocumentFormValues,
} from "@/features/contracts/schemas/contract.schema";
import { getErrorMessage } from "@/lib/api";

export const contractQueryKeys = {
  all: ["contracts"] as const,
  list: (filters: ContractFilters) => ["contracts", "list", filters] as const,
  detail: (id: string) => ["contracts", "detail", id] as const,
  history: (id: string) => ["contracts", "history", id] as const,
};

export function useContracts(filters: ContractFilters) {
  return useQuery({
    queryKey: contractQueryKeys.list(filters),
    queryFn: () => contractRepository.list(filters),
    staleTime: 30 * 1000,
    placeholderData: (previous) => previous,
  });
}

export function useContract(id: string) {
  return useQuery({
    queryKey: contractQueryKeys.detail(id),
    queryFn: () => contractRepository.getById(id),
    enabled: Boolean(id),
    staleTime: 30 * 1000,
  });
}

export function useContractHistory(id: string) {
  return useQuery({
    queryKey: contractQueryKeys.history(id),
    queryFn: () => contractRepository.getHistory(id),
    enabled: Boolean(id),
    staleTime: 30 * 1000,
  });
}

export function useCreateContract() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: CreateContractFormValues) =>
      contractRepository.create(values),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: contractQueryKeys.all });
      toast.success("Draft contract created");
      router.push(`/dashboard/contracts/${data.id}`);
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useUpdateContract(id: string) {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: UpdateContractFormValues) =>
      contractRepository.update(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contractQueryKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: contractQueryKeys.history(id) });
      queryClient.invalidateQueries({ queryKey: contractQueryKeys.all });
      toast.success("Contract updated");
      router.push(`/dashboard/contracts/${id}`);
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useDeleteContract() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => contractRepository.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contractQueryKeys.all });
      toast.success("Contract deleted");
      router.push("/dashboard/contracts");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useActivateContract(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => contractRepository.activate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contractQueryKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: contractQueryKeys.history(id) });
      queryClient.invalidateQueries({ queryKey: contractQueryKeys.all });
      toast.success("Contract activated");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useRenewContract(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: RenewContractFormValues) =>
      contractRepository.renew(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contractQueryKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: contractQueryKeys.history(id) });
      queryClient.invalidateQueries({ queryKey: contractQueryKeys.all });
      toast.success("Contract renewed");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useTerminateContract(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: TerminateContractFormValues) =>
      contractRepository.terminate(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contractQueryKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: contractQueryKeys.history(id) });
      queryClient.invalidateQueries({ queryKey: contractQueryKeys.all });
      toast.success("Contract terminated");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useExpireContract(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => contractRepository.expire(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contractQueryKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: contractQueryKeys.history(id) });
      queryClient.invalidateQueries({ queryKey: contractQueryKeys.all });
      toast.success("Contract marked as expired");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useUploadContractDocument(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: UploadContractDocumentFormValues) =>
      contractRepository.uploadDocument(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contractQueryKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: contractQueryKeys.history(id) });
      toast.success("Document uploaded");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}
