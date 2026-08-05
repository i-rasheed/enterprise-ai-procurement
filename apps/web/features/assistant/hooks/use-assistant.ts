"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api";

import { assistantRepository } from "../api/assistant.repository";
import type {
  ChatRequest,
  SemanticSearchRequest,
  SpendAnalysisRequest,
} from "../types";

export const assistantQueryKeys = {
  all: ["assistant"] as const,
};

export function useAssistantChat() {
  return useMutation({
    mutationFn: (payload: ChatRequest) => assistantRepository.chat(payload),
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useSemanticSearch() {
  return useMutation({
    mutationFn: (payload: SemanticSearchRequest) =>
      assistantRepository.semanticSearch(payload),
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useContractSummary() {
  return useMutation({
    mutationFn: (contractId: string) =>
      assistantRepository.summarizeContract(contractId),
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useSpendAnalysis() {
  return useMutation({
    mutationFn: (payload: SpendAnalysisRequest = {}) =>
      assistantRepository.analyzeSpend(payload),
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}
