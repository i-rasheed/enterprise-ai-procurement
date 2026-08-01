import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

import type { Vendor } from "@/lib/api/types";

type VendorPortalState = {
  vendor: Vendor | null;
  setVendor: (vendor: Vendor | null) => void;
};

export const useVendorPortalStore = create<VendorPortalState>()(
  persist(
    (set) => ({
      vendor: null,
      setVendor: (vendor) => set({ vendor }),
    }),
    {
      name: "procureai-mobile-vendor",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ vendor: state.vendor }),
    },
  ),
);
