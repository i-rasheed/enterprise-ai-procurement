import { apiGet } from "@/lib/api";
import type { Contract, PaginatedContracts } from "@/lib/api/types";

export const contractRepository = {
  list(params?: { page?: number; limit?: number; status?: string; vendorId?: string }) {
    return apiGet<PaginatedContracts>("/contracts", {
      page: params?.page ?? 1,
      limit: params?.limit ?? 50,
      status: params?.status,
      vendorId: params?.vendorId,
    });
  },

  getById(id: string) {
    return apiGet<Contract>(`/contracts/${id}`);
  },
};
