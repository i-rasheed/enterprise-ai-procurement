"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { invoiceRepository } from "@/features/invoices/api/invoice.repository";
import type { InvoiceFilters } from "@/features/invoices/types";
import type {
  ApproveInvoiceFormValues,
  MarkPaidFormValues,
  RejectInvoiceFormValues,
} from "@/features/invoices/schemas/invoice.schema";
import { getErrorMessage } from "@/lib/api";

export const invoiceQueryKeys = {
  all: ["invoices"] as const,
  list: (filters: InvoiceFilters) => ["invoices", "list", filters] as const,
  detail: (id: string) => ["invoices", "detail", id] as const,
  matchingResult: (invoiceId: string) =>
    ["invoices", "matching-result", invoiceId] as const,
};

export function useInvoices(filters: InvoiceFilters) {
  return useQuery({
    queryKey: invoiceQueryKeys.list(filters),
    queryFn: () => invoiceRepository.list(filters),
    staleTime: 30 * 1000,
    placeholderData: (previous) => previous,
  });
}

export function useInvoice(id: string) {
  return useQuery({
    queryKey: invoiceQueryKeys.detail(id),
    queryFn: () => invoiceRepository.getById(id),
    enabled: Boolean(id),
    staleTime: 30 * 1000,
  });
}

export function useMatchingResult(invoiceId: string, enabled = true) {
  return useQuery({
    queryKey: invoiceQueryKeys.matchingResult(invoiceId),
    queryFn: () => invoiceRepository.getMatchingResult(invoiceId),
    enabled: Boolean(invoiceId) && enabled,
    staleTime: 30 * 1000,
    retry: false,
  });
}

function invalidateInvoice(id: string, queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: invoiceQueryKeys.detail(id) });
  queryClient.invalidateQueries({
    queryKey: invoiceQueryKeys.matchingResult(id),
  });
  queryClient.invalidateQueries({ queryKey: invoiceQueryKeys.all });
}

export function useMatchInvoice(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => invoiceRepository.match(id),
    onSuccess: (data) => {
      invalidateInvoice(id, queryClient);
      const passed = data.matchingResult.matchStatus === "MATCHED";
      toast.success(
        passed ? "Three-way match passed" : "Matching completed with discrepancies",
      );
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useApproveInvoice(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: ApproveInvoiceFormValues) =>
      invoiceRepository.approve(id, values),
    onSuccess: () => {
      invalidateInvoice(id, queryClient);
      toast.success("Invoice approved");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useRejectInvoice(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: RejectInvoiceFormValues) =>
      invoiceRepository.reject(id, values),
    onSuccess: () => {
      invalidateInvoice(id, queryClient);
      toast.success("Invoice rejected");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useMarkInvoicePaid(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: MarkPaidFormValues) =>
      invoiceRepository.markPaid(id, values),
    onSuccess: () => {
      invalidateInvoice(id, queryClient);
      toast.success("Invoice marked as paid");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}
