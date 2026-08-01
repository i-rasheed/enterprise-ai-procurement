"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { authRepository } from "@/features/auth/api/auth.repository";
import type { VendorLoginFormValues } from "@/features/vendor-portal/schemas/vendor-portal.schema";
import type { VendorBidDraft } from "@/features/vendor-portal/types";
import { getErrorMessage } from "@/lib/api";
import type { LoginResponse } from "@/lib/api/types";
import { useAuthStore } from "@/stores/auth-store";

import { vendorPortalRepository } from "../api/vendor-portal.repository";
import { useVendorContextStore } from "../stores/vendor-context-store";

export const vendorPortalQueryKeys = {
  all: ["vendor-portal"] as const,
  account: (email: string) => ["vendor-portal", "account", email] as const,
  rfqs: ["vendor-portal", "rfqs"] as const,
  rfq: (id: string) => ["vendor-portal", "rfq", id] as const,
  bids: (vendorId: string) => ["vendor-portal", "bids", vendorId] as const,
  bid: (id: string) => ["vendor-portal", "bid", id] as const,
  purchaseOrders: (vendorId: string) =>
    ["vendor-portal", "purchase-orders", vendorId] as const,
  purchaseOrder: (id: string) =>
    ["vendor-portal", "purchase-order", id] as const,
  invoices: (vendorId: string) => ["vendor-portal", "invoices", vendorId] as const,
  invoice: (id: string) => ["vendor-portal", "invoice", id] as const,
  contracts: (vendorId: string) =>
    ["vendor-portal", "contracts", vendorId] as const,
  contract: (id: string) => ["vendor-portal", "contract", id] as const,
  dashboard: (vendorId: string) => ["vendor-portal", "dashboard", vendorId] as const,
};

function applySession(
  data: LoginResponse,
  rememberMe: boolean,
  setSession: ReturnType<typeof useAuthStore.getState>["setSession"],
) {
  setSession({
    user: data.user,
    organisation: data.organisation,
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    rememberMe,
  });
}

export function useVendorAccount(email?: string, enabled = true) {
  const setVendor = useVendorContextStore((state) => state.setVendor);

  return useQuery({
    queryKey: vendorPortalQueryKeys.account(email ?? ""),
    queryFn: async () => {
      const vendor = await vendorPortalRepository.resolveVendorByEmail(email!);
      setVendor(vendor);
      return vendor;
    },
    enabled: Boolean(email) && enabled,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}

export function useVendorLogin() {
  const router = useRouter();
  const setSession = useAuthStore((state) => state.setSession);
  const setVendor = useVendorContextStore((state) => state.setVendor);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: VendorLoginFormValues) => authRepository.login(values),
    onSuccess: async (data, variables) => {
      applySession(data, variables.rememberMe, setSession);
      const vendor = await vendorPortalRepository.resolveVendorByEmail(
        data.user.email,
      );
      setVendor(vendor);
      queryClient.invalidateQueries({ queryKey: vendorPortalQueryKeys.all });
      if (!vendor) {
        toast.error(
          "No vendor profile matches this account email. Use the email registered on your vendor record.",
        );
        return;
      }
      toast.success(`Welcome, ${vendor.name}`);
      router.push("/vendor");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useVendorRfqs(vendorId?: string) {
  return useQuery({
    queryKey: vendorPortalQueryKeys.rfqs,
    queryFn: () => vendorPortalRepository.listRfqs(),
    enabled: Boolean(vendorId),
    select: (data) =>
      data.rfqs.filter((rfq) =>
        rfq.vendors?.some((entry) => entry.vendor.id === vendorId),
      ),
    staleTime: 30 * 1000,
  });
}

export function useVendorRfq(id: string, vendorId?: string) {
  return useQuery({
    queryKey: vendorPortalQueryKeys.rfq(id),
    queryFn: () => vendorPortalRepository.getRfq(id),
    enabled: Boolean(id) && Boolean(vendorId),
    staleTime: 30 * 1000,
  });
}

export function useVendorBids(vendorId?: string) {
  return useQuery({
    queryKey: vendorPortalQueryKeys.bids(vendorId ?? ""),
    queryFn: () => vendorPortalRepository.listBids(vendorId!),
    enabled: Boolean(vendorId),
    staleTime: 30 * 1000,
  });
}

export function useVendorBid(id: string) {
  return useQuery({
    queryKey: vendorPortalQueryKeys.bid(id),
    queryFn: () => vendorPortalRepository.getBid(id),
    enabled: Boolean(id),
    staleTime: 30 * 1000,
  });
}

export function useSubmitVendorBid(vendorId?: string) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (draft: VendorBidDraft) =>
      vendorPortalRepository.createBidWithItems(vendorId!, draft),
    onSuccess: async (bid) => {
      await vendorPortalRepository.submitBid(bid.id);
      queryClient.invalidateQueries({ queryKey: vendorPortalQueryKeys.all });
      toast.success("Bid submitted successfully");
      router.push(`/vendor/bids/${bid.id}`);
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useVendorPurchaseOrders(vendorId?: string) {
  return useQuery({
    queryKey: vendorPortalQueryKeys.purchaseOrders(vendorId ?? ""),
    queryFn: () => vendorPortalRepository.listPurchaseOrders(vendorId!),
    enabled: Boolean(vendorId),
    staleTime: 30 * 1000,
  });
}

export function useVendorPurchaseOrder(id: string) {
  return useQuery({
    queryKey: vendorPortalQueryKeys.purchaseOrder(id),
    queryFn: () => vendorPortalRepository.getPurchaseOrder(id),
    enabled: Boolean(id),
    staleTime: 30 * 1000,
  });
}

export function useAcknowledgePurchaseOrder(vendorId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) =>
      vendorPortalRepository.acknowledgePurchaseOrder(id, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vendorPortalQueryKeys.all });
      toast.success("Purchase order acknowledged");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useVendorInvoices(vendorId?: string) {
  return useQuery({
    queryKey: vendorPortalQueryKeys.invoices(vendorId ?? ""),
    queryFn: () => vendorPortalRepository.listInvoices(vendorId!),
    enabled: Boolean(vendorId),
    staleTime: 30 * 1000,
  });
}

export function useVendorInvoice(id: string) {
  return useQuery({
    queryKey: vendorPortalQueryKeys.invoice(id),
    queryFn: () => vendorPortalRepository.getInvoice(id),
    enabled: Boolean(id),
    staleTime: 30 * 1000,
  });
}

export function useVendorContracts(vendorId?: string) {
  return useQuery({
    queryKey: vendorPortalQueryKeys.contracts(vendorId ?? ""),
    queryFn: () => vendorPortalRepository.listContracts(vendorId!),
    enabled: Boolean(vendorId),
    staleTime: 30 * 1000,
  });
}

export function useVendorContract(id: string) {
  return useQuery({
    queryKey: vendorPortalQueryKeys.contract(id),
    queryFn: () => vendorPortalRepository.getContract(id),
    enabled: Boolean(id),
    staleTime: 30 * 1000,
  });
}

export function useVendorDashboard(vendorId?: string) {
  return useQuery({
    queryKey: vendorPortalQueryKeys.dashboard(vendorId ?? ""),
    queryFn: async () => {
      const [rfqs, bids, purchaseOrders, invoices, contracts] =
        await Promise.all([
          vendorPortalRepository.listRfqs(),
          vendorPortalRepository.listBids(vendorId!),
          vendorPortalRepository.listPurchaseOrders(vendorId!),
          vendorPortalRepository.listInvoices(vendorId!),
          vendorPortalRepository.listContracts(vendorId!),
        ]);

      const invitedRfqs = rfqs.rfqs.filter((rfq) =>
        rfq.vendors?.some((entry) => entry.vendor.id === vendorId),
      );

      return {
        openRfqs: invitedRfqs.filter((rfq) => rfq.status === "PUBLISHED")
          .length,
        activeBids: bids.bids.filter(
          (bid) => bid.status === "DRAFT" || bid.status === "SUBMITTED",
        ).length,
        issuedPurchaseOrders: purchaseOrders.purchaseOrders.filter(
          (po) => po.status === "ISSUED" || po.status === "ACKNOWLEDGED",
        ).length,
        pendingInvoices: invoices.invoices.filter(
          (invoice) =>
            invoice.status === "SUBMITTED" || invoice.status === "MATCHED",
        ).length,
        activeContracts: contracts.contracts.filter(
          (contract) => contract.status === "ACTIVE",
        ).length,
      };
    },
    enabled: Boolean(vendorId),
    staleTime: 60 * 1000,
  });
}

export function useVendorAssistantChat() {
  return useMutation({
    mutationFn: vendorPortalRepository.chat,
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}
