import { apiGet, apiPatch, apiPost } from "@/lib/api";

import type {
  AwardBidFormValues,
  EvaluationFormValues,
} from "../schemas/bid.schema";
import type {
  Award,
  Bid,
  BidEvaluationList,
  BidFilters,
  BidEvaluation,
  PaginatedBids,
  ProcurementRankings,
  ProcurementRecommendations,
} from "../types";

function buildQuery(filters?: BidFilters): Record<string, string> {
  const params: Record<string, string> = {};
  if (!filters) return params;
  if (filters.search) params.search = filters.search;
  if (filters.page) params.page = String(filters.page);
  if (filters.limit) params.limit = String(filters.limit);
  if (filters.status) params.status = filters.status;
  return params;
}

export const bidRepository = {
  list(filters?: BidFilters) {
    return apiGet<PaginatedBids>("/bids", buildQuery(filters));
  },

  getById(id: string) {
    return apiGet<Bid>(`/bids/${id}`);
  },

  getEvaluations(bidId: string) {
    return apiGet<BidEvaluationList>(`/bid-evaluations/${bidId}`);
  },

  createEvaluation(values: EvaluationFormValues) {
    return apiPost<BidEvaluation>("/bid-evaluations", {
      bidId: values.bidId,
      technicalScore: values.technicalScore,
      commercialScore: values.commercialScore,
      complianceScore: values.complianceScore,
      deliveryScore: values.deliveryScore,
      comments: values.comments || undefined,
    });
  },

  updateEvaluation(id: string, values: Partial<EvaluationFormValues>) {
    return apiPatch<BidEvaluation>(`/bid-evaluations/${id}`, values);
  },

  getRankings(procurementRequestId: string) {
    return apiGet<ProcurementRankings>(
      `/procurement-requests/${procurementRequestId}/rankings`,
    );
  },

  award(values: AwardBidFormValues) {
    return apiPost<Award>("/awards", values);
  },

  listAwards() {
    return apiGet<{ awards: Award[] }>("/awards");
  },

  getRecommendations(procurementRequestId: string) {
    return apiPost<ProcurementRecommendations>(
      `/ai/procurement/${procurementRequestId}/recommendations`,
    );
  },

  listByRfq(rfqId: string) {
    return apiGet<{ bids: Bid[] }>(`/rfqs/${rfqId}/bids`);
  },
};
