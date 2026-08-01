import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api";

import type {
  CreateContractFormValues,
  RenewContractFormValues,
  TerminateContractFormValues,
  UpdateContractFormValues,
  UploadContractDocumentFormValues,
} from "../schemas/contract.schema";
import type {
  Contract,
  ContractFilters,
  ContractHistory,
  PaginatedContracts,
} from "../types";

function buildQuery(filters?: ContractFilters): Record<string, string> {
  const params: Record<string, string> = {};
  if (!filters) return params;
  if (filters.search) params.search = filters.search;
  if (filters.page) params.page = String(filters.page);
  if (filters.limit) params.limit = String(filters.limit);
  if (filters.status) params.status = filters.status;
  if (filters.contractType) params.contractType = filters.contractType;
  if (filters.vendorId) params.vendorId = filters.vendorId;
  return params;
}

function toIsoDate(date: string): string {
  if (date.includes("T")) return date;
  return new Date(`${date}T00:00:00.000Z`).toISOString();
}

export const contractRepository = {
  list(filters?: ContractFilters) {
    return apiGet<PaginatedContracts>("/contracts", buildQuery(filters));
  },

  getById(id: string) {
    return apiGet<Contract>(`/contracts/${id}`);
  },

  getHistory(id: string) {
    return apiGet<ContractHistory>(`/contracts/${id}/history`);
  },

  create(values: CreateContractFormValues) {
    return apiPost<Contract>("/contracts", {
      awardId: values.sourceType === "award" ? values.awardId : undefined,
      purchaseOrderId:
        values.sourceType === "purchaseOrder"
          ? values.purchaseOrderId
          : undefined,
      title: values.title,
      description: values.description,
      contractType: values.contractType,
      startDate: toIsoDate(values.startDate),
      endDate: toIsoDate(values.endDate),
      value: values.value,
      currency: values.currency || undefined,
      renewalType: values.renewalType || undefined,
      renewalDate: values.renewalDate
        ? toIsoDate(values.renewalDate)
        : undefined,
      autoRenew: values.autoRenew,
      signedByOrganisation: values.signedByOrganisation || undefined,
      signedByVendor: values.signedByVendor || undefined,
    });
  },

  update(id: string, values: UpdateContractFormValues) {
    return apiPatch<Contract>(`/contracts/${id}`, {
      title: values.title,
      description: values.description,
      contractType: values.contractType,
      startDate: toIsoDate(values.startDate),
      endDate: toIsoDate(values.endDate),
      value: values.value,
      renewalType: values.renewalType || undefined,
      renewalDate: values.renewalDate
        ? toIsoDate(values.renewalDate)
        : undefined,
      autoRenew: values.autoRenew,
      signedByOrganisation: values.signedByOrganisation || undefined,
      signedByVendor: values.signedByVendor || undefined,
      changeSummary: values.changeSummary || undefined,
    });
  },

  delete(id: string) {
    return apiDelete<{ message: string }>(`/contracts/${id}`);
  },

  activate(id: string) {
    return apiPost<Contract>(`/contracts/${id}/activate`);
  },

  renew(id: string, values: RenewContractFormValues) {
    return apiPost<Contract>(`/contracts/${id}/renew`, {
      startDate: toIsoDate(values.startDate),
      endDate: toIsoDate(values.endDate),
      value: values.value,
      renewalDate: values.renewalDate
        ? toIsoDate(values.renewalDate)
        : undefined,
      changeSummary: values.changeSummary,
    });
  },

  terminate(id: string, values: TerminateContractFormValues) {
    return apiPost<Contract>(`/contracts/${id}/terminate`, values);
  },

  expire(id: string) {
    return apiPost<Contract>(`/contracts/${id}/expire`);
  },

  uploadDocument(id: string, values: UploadContractDocumentFormValues) {
    return apiPost<{ contract: Contract; document: Contract["documents"][0] }>(
      `/contracts/${id}/documents`,
      values,
    );
  },
};
