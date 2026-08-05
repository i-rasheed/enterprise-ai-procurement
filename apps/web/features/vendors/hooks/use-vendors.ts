"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { vendorRepository } from "@/features/vendors/api/vendor.repository";
import type { VendorFilters } from "@/features/vendors/types";
import type { VendorFormValues } from "@/features/vendors/schemas/vendor.schema";
import { getErrorMessage } from "@/lib/api";

export const vendorQueryKeys = {
  all: ["vendors"] as const,
  list: (filters: VendorFilters) => ["vendors", "list", filters] as const,
  detail: (id: string) => ["vendors", "detail", id] as const,
  risk: (id: string) => ["vendors", "risk", id] as const,
};

export function useVendors(filters: VendorFilters) {
  return useQuery({
    queryKey: vendorQueryKeys.list(filters),
    queryFn: () => vendorRepository.list(filters),
    staleTime: 30 * 1000,
    placeholderData: (previous) => previous,
  });
}

export function useVendor(id: string) {
  return useQuery({
    queryKey: vendorQueryKeys.detail(id),
    queryFn: () => vendorRepository.getById(id),
    enabled: Boolean(id),
    staleTime: 30 * 1000,
  });
}

export function useCreateVendor() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: VendorFormValues) => vendorRepository.create(values),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: vendorQueryKeys.all });
      toast.success("Vendor registered successfully");
      router.push(`/dashboard/vendors/${data.id}`);
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useUpdateVendor(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: Partial<VendorFormValues>) =>
      vendorRepository.update(id, values),
    onSuccess: (data) => {
      queryClient.setQueryData(vendorQueryKeys.detail(id), data);
      queryClient.invalidateQueries({ queryKey: vendorQueryKeys.all });
      toast.success("Vendor updated");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useDeleteVendor() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => vendorRepository.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vendorQueryKeys.all });
      toast.success("Vendor deleted");
      router.push("/dashboard/vendors");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useVendorRiskAnalysis(id: string) {
  return useMutation({
    mutationFn: () => vendorRepository.analyzeRisk(id),
    onSuccess: () => toast.success("Risk analysis complete"),
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}
