"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { purchaseOrderRepository } from "@/features/purchase-orders/api/purchase-order.repository";
import type { PurchaseOrderFilters } from "@/features/purchase-orders/types";
import type {
  AcknowledgePurchaseOrderFormValues,
  CreatePurchaseOrderFormValues,
  IssuePurchaseOrderFormValues,
  UpdatePurchaseOrderFormValues,
} from "@/features/purchase-orders/schemas/purchase-order.schema";
import { getErrorMessage } from "@/lib/api";

export const purchaseOrderQueryKeys = {
  all: ["purchase-orders"] as const,
  list: (filters: PurchaseOrderFilters) =>
    ["purchase-orders", "list", filters] as const,
  detail: (id: string) => ["purchase-orders", "detail", id] as const,
};

export function usePurchaseOrders(filters: PurchaseOrderFilters) {
  return useQuery({
    queryKey: purchaseOrderQueryKeys.list(filters),
    queryFn: () => purchaseOrderRepository.list(filters),
    staleTime: 30 * 1000,
    placeholderData: (previous) => previous,
  });
}

export function usePurchaseOrder(id: string) {
  return useQuery({
    queryKey: purchaseOrderQueryKeys.detail(id),
    queryFn: () => purchaseOrderRepository.getById(id),
    enabled: Boolean(id),
    staleTime: 30 * 1000,
  });
}

export function useCreatePurchaseOrder() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: CreatePurchaseOrderFormValues) =>
      purchaseOrderRepository.create(values),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: purchaseOrderQueryKeys.all });
      toast.success("Draft purchase order created");
      router.push(`/dashboard/purchase-orders/${data.id}`);
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useUpdatePurchaseOrder(id: string) {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: UpdatePurchaseOrderFormValues) =>
      purchaseOrderRepository.update(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: purchaseOrderQueryKeys.detail(id),
      });
      queryClient.invalidateQueries({ queryKey: purchaseOrderQueryKeys.all });
      toast.success("Purchase order updated");
      router.push(`/dashboard/purchase-orders/${id}`);
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useDeletePurchaseOrder() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => purchaseOrderRepository.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: purchaseOrderQueryKeys.all });
      toast.success("Purchase order deleted");
      router.push("/dashboard/purchase-orders");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useIssuePurchaseOrder(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: IssuePurchaseOrderFormValues) =>
      purchaseOrderRepository.issue(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: purchaseOrderQueryKeys.detail(id),
      });
      queryClient.invalidateQueries({ queryKey: purchaseOrderQueryKeys.all });
      toast.success("Purchase order issued to vendor");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useAcknowledgePurchaseOrder(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: AcknowledgePurchaseOrderFormValues) =>
      purchaseOrderRepository.acknowledge(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: purchaseOrderQueryKeys.detail(id),
      });
      queryClient.invalidateQueries({ queryKey: purchaseOrderQueryKeys.all });
      toast.success("Purchase order acknowledged");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useCancelPurchaseOrder(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => purchaseOrderRepository.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: purchaseOrderQueryKeys.detail(id),
      });
      queryClient.invalidateQueries({ queryKey: purchaseOrderQueryKeys.all });
      toast.success("Purchase order cancelled");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}
