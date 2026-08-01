"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { Vendor } from "@/features/vendors/types";

type VendorContextState = {
  vendor: Vendor | null;
  setVendor: (vendor: Vendor | null) => void;
  clearVendor: () => void;
};

export const useVendorContextStore = create<VendorContextState>()(
  persist(
    (set) => ({
      vendor: null,
      setVendor: (vendor) => set({ vendor }),
      clearVendor: () => set({ vendor: null }),
    }),
    {
      name: "vendor-portal-context",
      partialize: (state) => ({ vendor: state.vendor }),
    },
  ),
);
