import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api";
import type { MessageResponse } from "@/lib/api/types";

import type {
  InviteVendorFormValues,
  PublishRfqFormValues,
  RfqFormValues,
} from "../schemas/rfq.schema";
import type { PaginatedRfqs, RFQ, RFQFilters } from "../types";

function buildQuery(filters?: RFQFilters): Record<string, string> {
  const params: Record<string, string> = {};
  if (!filters) return params;
  if (filters.search) params.search = filters.search;
  if (filters.page) params.page = String(filters.page);
  if (filters.limit) params.limit = String(filters.limit);
  if (filters.status) params.status = filters.status;
  return params;
}

function toRfqPayload(values: RfqFormValues) {
  return {
    procurementRequestId: values.procurementRequestId,
    title: values.title,
    description: values.description,
    closingDate: new Date(values.closingDate).toISOString(),
  };
}

export const rfqRepository = {
  list(filters?: RFQFilters) {
    return apiGet<PaginatedRfqs>("/rfqs", buildQuery(filters));
  },

  getById(id: string) {
    return apiGet<RFQ>(`/rfqs/${id}`);
  },

  create(values: RfqFormValues) {
    return apiPost<RFQ>("/rfqs", toRfqPayload(values));
  },

  update(id: string, values: Partial<RfqFormValues>) {
    const payload: Record<string, unknown> = {};
    if (values.title !== undefined) payload.title = values.title;
    if (values.description !== undefined) payload.description = values.description;
    if (values.closingDate !== undefined) {
      payload.closingDate = new Date(values.closingDate).toISOString();
    }
    return apiPatch<RFQ>(`/rfqs/${id}`, payload);
  },

  delete(id: string) {
    return apiDelete<MessageResponse>(`/rfqs/${id}`);
  },

  publish(id: string, values?: PublishRfqFormValues) {
    return apiPost<RFQ>(`/rfqs/${id}/publish`, {
      publicationNote: values?.publicationNote || undefined,
    });
  },

  close(id: string) {
    return apiPost<RFQ>(`/rfqs/${id}/close`);
  },

  cancel(id: string) {
    return apiPost<RFQ>(`/rfqs/${id}/cancel`);
  },

  inviteVendor(id: string, values: InviteVendorFormValues) {
    return apiPost<RFQ>(`/rfqs/${id}/vendors`, values);
  },

  listVendors(id: string) {
    return apiGet<{ vendors: RFQ["vendors"] }>(`/rfqs/${id}/vendors`);
  },
};
