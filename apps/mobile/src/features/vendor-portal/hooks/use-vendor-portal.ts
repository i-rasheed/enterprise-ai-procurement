import { useQuery } from "@tanstack/react-query";

import { fetchWithOfflineCache } from "@/lib/offline/fetch-with-cache";
import { useAuthStore } from "@/stores/auth-store";
import { useOfflineStore } from "@/stores/offline-store";

import { vendorPortalRepository } from "../api/vendor-portal.repository";
import { useVendorPortalStore } from "../stores/vendor-portal-store";

export const vendorPortalQueryKeys = {
  account: (email: string) => ["vendor-portal", "account", email] as const,
  rfqs: (vendorId: string) => ["vendor-portal", "rfqs", vendorId] as const,
  bids: (vendorId: string) => ["vendor-portal", "bids", vendorId] as const,
  purchaseOrders: (vendorId: string) =>
    ["vendor-portal", "purchase-orders", vendorId] as const,
  invoices: (vendorId: string) => ["vendor-portal", "invoices", vendorId] as const,
  contracts: (vendorId: string) => ["vendor-portal", "contracts", vendorId] as const,
};

export function useVendorAccount() {
  const email = useAuthStore((state) => state.user?.email);
  const setVendor = useVendorPortalStore((state) => state.setVendor);
  const network = useOfflineStore((state) => state.network);

  return useQuery({
    queryKey: vendorPortalQueryKeys.account(email ?? ""),
    queryFn: async () => {
      const vendor = await fetchWithOfflineCache(
        `vendor.account.${email}`,
        () => vendorPortalRepository.resolveVendorByEmail(email!),
        network,
      );
      setVendor(vendor);
      return vendor;
    },
    enabled: Boolean(email),
    staleTime: 5 * 60 * 1000,
  });
}

export function useVendorRfqs(vendorId?: string) {
  const network = useOfflineStore((state) => state.network);

  return useQuery({
    queryKey: vendorPortalQueryKeys.rfqs(vendorId ?? ""),
    queryFn: async () => {
      const response = await fetchWithOfflineCache(
        `vendor.rfqs.${vendorId}`,
        () => vendorPortalRepository.listRfqs(),
        network,
      );
      return response.rfqs.filter((rfq) =>
        rfq.vendors?.some((entry) => entry.vendor.id === vendorId),
      );
    },
    enabled: Boolean(vendorId),
  });
}

export function useVendorBids(vendorId?: string) {
  const network = useOfflineStore((state) => state.network);

  return useQuery({
    queryKey: vendorPortalQueryKeys.bids(vendorId ?? ""),
    queryFn: () =>
      fetchWithOfflineCache(
        `vendor.bids.${vendorId}`,
        () => vendorPortalRepository.listBids(vendorId!),
        network,
      ).then((response) => response.bids),
    enabled: Boolean(vendorId),
  });
}

export function useVendorPurchaseOrders(vendorId?: string) {
  const network = useOfflineStore((state) => state.network);

  return useQuery({
    queryKey: vendorPortalQueryKeys.purchaseOrders(vendorId ?? ""),
    queryFn: () =>
      fetchWithOfflineCache(
        `vendor.pos.${vendorId}`,
        () => vendorPortalRepository.listPurchaseOrders(vendorId!),
        network,
      ).then((response) => response.purchaseOrders),
    enabled: Boolean(vendorId),
  });
}

export function useVendorInvoices(vendorId?: string) {
  const network = useOfflineStore((state) => state.network);

  return useQuery({
    queryKey: vendorPortalQueryKeys.invoices(vendorId ?? ""),
    queryFn: () =>
      fetchWithOfflineCache(
        `vendor.invoices.${vendorId}`,
        () => vendorPortalRepository.listInvoices(vendorId!),
        network,
      ).then((response) => response.invoices),
    enabled: Boolean(vendorId),
  });
}

export function useVendorContracts(vendorId?: string) {
  const network = useOfflineStore((state) => state.network);

  return useQuery({
    queryKey: vendorPortalQueryKeys.contracts(vendorId ?? ""),
    queryFn: () =>
      fetchWithOfflineCache(
        `vendor.contracts.${vendorId}`,
        () => vendorPortalRepository.listContracts(vendorId!),
        network,
      ).then((response) => response.contracts),
    enabled: Boolean(vendorId),
  });
}
