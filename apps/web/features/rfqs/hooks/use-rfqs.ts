"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { rfqRepository } from "@/features/rfqs/api/rfq.repository";
import type { RFQFilters } from "@/features/rfqs/types";
import type {
  InviteVendorFormValues,
  PublishRfqFormValues,
  RfqFormValues,
} from "@/features/rfqs/schemas/rfq.schema";
import { getErrorMessage } from "@/lib/api";

export const rfqQueryKeys = {
  all: ["rfqs"] as const,
  list: (filters: RFQFilters) => ["rfqs", "list", filters] as const,
  detail: (id: string) => ["rfqs", "detail", id] as const,
};

export function useRfqs(filters: RFQFilters) {
  return useQuery({
    queryKey: rfqQueryKeys.list(filters),
    queryFn: () => rfqRepository.list(filters),
    staleTime: 30 * 1000,
    placeholderData: (previous) => previous,
  });
}

export function useRfq(id: string) {
  return useQuery({
    queryKey: rfqQueryKeys.detail(id),
    queryFn: () => rfqRepository.getById(id),
    enabled: Boolean(id),
    staleTime: 30 * 1000,
  });
}

export function useCreateRfq() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: RfqFormValues) => rfqRepository.create(values),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: rfqQueryKeys.all });
      toast.success("RFQ created");
      router.push(`/dashboard/rfqs/${data.id}`);
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useUpdateRfq(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: Partial<RfqFormValues>) =>
      rfqRepository.update(id, values),
    onSuccess: (data) => {
      queryClient.setQueryData(rfqQueryKeys.detail(id), data);
      queryClient.invalidateQueries({ queryKey: rfqQueryKeys.all });
      toast.success("RFQ updated");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useDeleteRfq() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => rfqRepository.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rfqQueryKeys.all });
      toast.success("RFQ deleted");
      router.push("/dashboard/rfqs");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function usePublishRfq(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values?: PublishRfqFormValues) =>
      rfqRepository.publish(id, values),
    onSuccess: (data) => {
      queryClient.setQueryData(rfqQueryKeys.detail(id), data);
      queryClient.invalidateQueries({ queryKey: rfqQueryKeys.all });
      toast.success("RFQ published");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useCloseRfq(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => rfqRepository.close(id),
    onSuccess: (data) => {
      queryClient.setQueryData(rfqQueryKeys.detail(id), data);
      queryClient.invalidateQueries({ queryKey: rfqQueryKeys.all });
      toast.success("RFQ closed");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useCancelRfq(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => rfqRepository.cancel(id),
    onSuccess: (data) => {
      queryClient.setQueryData(rfqQueryKeys.detail(id), data);
      queryClient.invalidateQueries({ queryKey: rfqQueryKeys.all });
      toast.success("RFQ cancelled");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useInviteVendor(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: InviteVendorFormValues) =>
      rfqRepository.inviteVendor(id, values),
    onSuccess: (data) => {
      queryClient.setQueryData(rfqQueryKeys.detail(id), data);
      toast.success("Vendor invited");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}
