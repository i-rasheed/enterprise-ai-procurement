"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { goodsReceiptRepository } from "@/features/goods-receipts/api/goods-receipt.repository";
import type { GoodsReceiptFilters } from "@/features/goods-receipts/types";
import type {
  CreateGoodsReceiptFormValues,
  ReceiveGoodsFormValues,
  RejectGoodsFormValues,
  UpdateGoodsReceiptFormValues,
} from "@/features/goods-receipts/schemas/goods-receipt.schema";
import { getErrorMessage } from "@/lib/api";

export const goodsReceiptQueryKeys = {
  all: ["goods-receipts"] as const,
  list: (filters: GoodsReceiptFilters) =>
    ["goods-receipts", "list", filters] as const,
  detail: (id: string) => ["goods-receipts", "detail", id] as const,
  byPurchaseOrder: (purchaseOrderId: string) =>
    ["goods-receipts", "by-po", purchaseOrderId] as const,
};

export function useGoodsReceipts(filters: GoodsReceiptFilters) {
  return useQuery({
    queryKey: goodsReceiptQueryKeys.list(filters),
    queryFn: () => goodsReceiptRepository.list(filters),
    staleTime: 30 * 1000,
    placeholderData: (previous) => previous,
  });
}

export function useGoodsReceipt(id: string) {
  return useQuery({
    queryKey: goodsReceiptQueryKeys.detail(id),
    queryFn: () => goodsReceiptRepository.getById(id),
    enabled: Boolean(id),
    staleTime: 30 * 1000,
  });
}

export function usePurchaseOrderGoodsReceipts(purchaseOrderId: string) {
  return useQuery({
    queryKey: goodsReceiptQueryKeys.byPurchaseOrder(purchaseOrderId),
    queryFn: () => goodsReceiptRepository.listByPurchaseOrder(purchaseOrderId),
    enabled: Boolean(purchaseOrderId),
    staleTime: 30 * 1000,
  });
}

export function useCreateGoodsReceipt() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: CreateGoodsReceiptFormValues) =>
      goodsReceiptRepository.create(values),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: goodsReceiptQueryKeys.all });
      toast.success("Draft goods receipt created");
      router.push(`/dashboard/goods-receipts/${data.id}`);
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useUpdateGoodsReceipt(id: string) {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: UpdateGoodsReceiptFormValues) =>
      goodsReceiptRepository.update(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: goodsReceiptQueryKeys.detail(id),
      });
      queryClient.invalidateQueries({ queryKey: goodsReceiptQueryKeys.all });
      toast.success("Goods receipt updated");
      router.push(`/dashboard/goods-receipts/${id}`);
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useDeleteGoodsReceipt() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => goodsReceiptRepository.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: goodsReceiptQueryKeys.all });
      toast.success("Goods receipt deleted");
      router.push("/dashboard/goods-receipts");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useReceiveGoods(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: ReceiveGoodsFormValues) =>
      goodsReceiptRepository.receive(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: goodsReceiptQueryKeys.detail(id),
      });
      queryClient.invalidateQueries({ queryKey: goodsReceiptQueryKeys.all });
      toast.success("Goods received");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useRejectGoods(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: RejectGoodsFormValues) =>
      goodsReceiptRepository.reject(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: goodsReceiptQueryKeys.detail(id),
      });
      queryClient.invalidateQueries({ queryKey: goodsReceiptQueryKeys.all });
      toast.success("Rejected items recorded");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useCompleteGoodsReceipt(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => goodsReceiptRepository.complete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: goodsReceiptQueryKeys.detail(id),
      });
      queryClient.invalidateQueries({ queryKey: goodsReceiptQueryKeys.all });
      toast.success("Goods receipt completed");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}
