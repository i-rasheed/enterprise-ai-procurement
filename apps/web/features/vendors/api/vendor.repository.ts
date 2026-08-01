import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api";
import type { MessageResponse } from "@/lib/api/types";

import type {
  PaginatedVendors,
  Vendor,
  VendorFilters,
  VendorRiskAnalysis,
} from "../types";
import type { VendorFormValues } from "../schemas/vendor.schema";

function buildQuery(filters?: VendorFilters): Record<string, string> {
  const params: Record<string, string> = {};

  if (!filters) {
    return params;
  }

  if (filters.q) params.q = filters.q;
  if (filters.page) params.page = String(filters.page);
  if (filters.limit) params.limit = String(filters.limit);
  if (filters.name) params.name = filters.name;
  if (filters.category) params.category = filters.category;
  if (filters.status) params.status = filters.status;
  if (filters.complianceStatus) {
    params.complianceStatus = filters.complianceStatus;
  }

  return params;
}

function toVendorPayload(values: VendorFormValues) {
  return {
    name: values.name,
    email: values.email,
    phone: values.phone || undefined,
    address: values.address || undefined,
    website: values.website || undefined,
    registrationNumber: values.registrationNumber || undefined,
    taxIdentificationNumber: values.taxIdentificationNumber || undefined,
    category: values.category || undefined,
    status: values.status,
    rating:
      !values.rating || values.rating.trim() === ""
        ? undefined
        : Number(values.rating),
    complianceStatus: values.complianceStatus,
    notes: values.notes || undefined,
  };
}

function toPartialVendorPayload(values: Partial<VendorFormValues>) {
  const payload: Record<string, unknown> = {};

  if (values.name !== undefined) payload.name = values.name;
  if (values.email !== undefined) payload.email = values.email;
  if (values.phone !== undefined) payload.phone = values.phone || undefined;
  if (values.address !== undefined) payload.address = values.address || undefined;
  if (values.website !== undefined) payload.website = values.website || undefined;
  if (values.registrationNumber !== undefined) {
    payload.registrationNumber = values.registrationNumber || undefined;
  }
  if (values.taxIdentificationNumber !== undefined) {
    payload.taxIdentificationNumber = values.taxIdentificationNumber || undefined;
  }
  if (values.category !== undefined) payload.category = values.category || undefined;
  if (values.status !== undefined) payload.status = values.status;
  if (values.rating !== undefined) {
    payload.rating =
      values.rating === "" || values.rating === undefined
        ? undefined
        : Number(values.rating);
  }
  if (values.complianceStatus !== undefined) {
    payload.complianceStatus = values.complianceStatus;
  }
  if (values.notes !== undefined) payload.notes = values.notes || undefined;

  return payload;
}

export const vendorRepository = {
  list(filters?: VendorFilters) {
    const endpoint = filters?.q ? "/vendors/search" : "/vendors";
    return apiGet<PaginatedVendors>(endpoint, buildQuery(filters));
  },

  getById(id: string) {
    return apiGet<Vendor>(`/vendors/${id}`);
  },

  create(values: VendorFormValues) {
    return apiPost<Vendor>("/vendors", toVendorPayload(values));
  },

  update(id: string, values: Partial<VendorFormValues>) {
    return apiPatch<Vendor>(`/vendors/${id}`, toPartialVendorPayload(values));
  },

  delete(id: string) {
    return apiDelete<MessageResponse>(`/vendors/${id}`);
  },

  analyzeRisk(id: string) {
    return apiPost<VendorRiskAnalysis>(`/ai/vendors/${id}/risk`);
  },
};
