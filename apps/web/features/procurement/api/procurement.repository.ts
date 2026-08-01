import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api";
import type { MessageResponse } from "@/lib/api/types";

import type {
  ApprovalHistory,
  ApprovalWorkflow,
  PaginatedProcurementRequests,
  ProcurementFilters,
  ProcurementRequest,
} from "../types";
import type {
  ApproveStepFormValues,
  ProcurementItemFormValues,
  ProcurementRequestFormValues,
  RejectStepFormValues,
  SubmitProcurementFormValues,
} from "../schemas/procurement.schema";

function buildQuery(filters?: ProcurementFilters): Record<string, string> {
  const params: Record<string, string> = {};

  if (!filters) return params;

  if (filters.search) params.search = filters.search;
  if (filters.page) params.page = String(filters.page);
  if (filters.limit) params.limit = String(filters.limit);
  if (filters.status) params.status = filters.status;
  if (filters.priority) params.priority = filters.priority;
  if (filters.department) params.department = filters.department;

  return params;
}

function toRequestPayload(values: ProcurementRequestFormValues) {
  return {
    title: values.title,
    description: values.description,
    justification: values.justification,
    department: values.department,
    estimatedBudget: values.estimatedBudget,
    currency: values.currency || "USD",
    priority: values.priority || "MEDIUM",
    requiredDeliveryDate: new Date(values.requiredDeliveryDate).toISOString(),
  };
}

export const procurementRepository = {
  list(filters?: ProcurementFilters) {
    return apiGet<PaginatedProcurementRequests>(
      "/procurement-requests",
      buildQuery(filters),
    );
  },

  getById(id: string) {
    return apiGet<ProcurementRequest>(`/procurement-requests/${id}`);
  },

  create(values: ProcurementRequestFormValues) {
    return apiPost<ProcurementRequest>(
      "/procurement-requests",
      toRequestPayload(values),
    );
  },

  update(id: string, values: Partial<ProcurementRequestFormValues>) {
    const payload: Record<string, unknown> = {};

    if (values.title !== undefined) payload.title = values.title;
    if (values.description !== undefined) payload.description = values.description;
    if (values.justification !== undefined) {
      payload.justification = values.justification;
    }
    if (values.department !== undefined) payload.department = values.department;
    if (values.estimatedBudget !== undefined) {
      payload.estimatedBudget = values.estimatedBudget;
    }
    if (values.currency !== undefined) payload.currency = values.currency;
    if (values.priority !== undefined) payload.priority = values.priority;
    if (values.requiredDeliveryDate !== undefined) {
      payload.requiredDeliveryDate = new Date(
        values.requiredDeliveryDate,
      ).toISOString();
    }

    return apiPatch<ProcurementRequest>(`/procurement-requests/${id}`, payload);
  },

  delete(id: string) {
    return apiDelete<MessageResponse>(`/procurement-requests/${id}`);
  },

  submit(id: string, values?: SubmitProcurementFormValues) {
    return apiPost<ProcurementRequest & { submissionNote?: string }>(
      `/procurement-requests/${id}/submit`,
      {
        submissionNote: values?.submissionNote || undefined,
      },
    );
  },

  addItem(requestId: string, values: ProcurementItemFormValues) {
    return apiPost<ProcurementRequest>(
      `/procurement-requests/${requestId}/items`,
      values,
    );
  },

  removeItem(itemId: string) {
    return apiDelete<MessageResponse>(`/procurement-requests/items/${itemId}`);
  },

  getApprovalHistory(requestId: string) {
    return apiGet<ApprovalHistory>(`/approval-workflows/history/${requestId}`);
  },

  approveWorkflow(workflowId: string, values?: ApproveStepFormValues) {
    return apiPost<ApprovalWorkflow>(
      `/approval-workflows/${workflowId}/approve`,
      { comments: values?.comments || undefined },
    );
  },

  rejectWorkflow(workflowId: string, values: RejectStepFormValues) {
    return apiPost<ApprovalWorkflow>(
      `/approval-workflows/${workflowId}/reject`,
      values,
    );
  },
};
