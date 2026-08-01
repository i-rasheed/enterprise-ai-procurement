import { apiClient } from "@/lib/api/client";

import type {
  ChatRequest,
  ChatResponse,
  ContractSummary,
  SemanticSearchRequest,
  SemanticSearchResponse,
  SpendAnalysis,
  SpendAnalysisRequest,
} from "../types";

const AI_TIMEOUT_MS = 120_000;

async function aiPost<T>(url: string, body?: unknown): Promise<T> {
  const response = await apiClient.post<T>(url, body, {
    timeout: AI_TIMEOUT_MS,
  });
  return response.data;
}

export const assistantRepository = {
  chat(payload: ChatRequest) {
    return aiPost<ChatResponse>("/ai/chat", payload);
  },

  semanticSearch(payload: SemanticSearchRequest) {
    return aiPost<SemanticSearchResponse>("/ai/search", payload);
  },

  summarizeContract(contractId: string) {
    return aiPost<ContractSummary>(`/ai/contracts/${contractId}/summarize`);
  },

  analyzeSpend(payload: SpendAnalysisRequest = {}) {
    return aiPost<SpendAnalysis>("/ai/analytics/spend-analysis", payload);
  },
};
