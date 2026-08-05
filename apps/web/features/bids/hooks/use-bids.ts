"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { bidRepository } from "@/features/bids/api/bid.repository";
import type { BidFilters } from "@/features/bids/types";
import type {
  AwardBidFormValues,
  EvaluationFormValues,
} from "@/features/bids/schemas/bid.schema";
import { getErrorMessage } from "@/lib/api";

export const bidQueryKeys = {
  all: ["bids"] as const,
  list: (filters: BidFilters) => ["bids", "list", filters] as const,
  detail: (id: string) => ["bids", "detail", id] as const,
  evaluations: (bidId: string) => ["bids", "evaluations", bidId] as const,
  rankings: (procurementRequestId: string) =>
    ["bids", "rankings", procurementRequestId] as const,
  awards: ["bids", "awards"] as const,
  recommendations: (procurementRequestId: string) =>
    ["bids", "recommendations", procurementRequestId] as const,
};

export function useBids(filters: BidFilters) {
  return useQuery({
    queryKey: bidQueryKeys.list(filters),
    queryFn: () => bidRepository.list(filters),
    staleTime: 30 * 1000,
    placeholderData: (previous) => previous,
  });
}

export function useBid(id: string) {
  return useQuery({
    queryKey: bidQueryKeys.detail(id),
    queryFn: () => bidRepository.getById(id),
    enabled: Boolean(id),
    staleTime: 30 * 1000,
  });
}

export function useBidEvaluations(bidId: string) {
  return useQuery({
    queryKey: bidQueryKeys.evaluations(bidId),
    queryFn: () => bidRepository.getEvaluations(bidId),
    enabled: Boolean(bidId),
    staleTime: 30 * 1000,
  });
}

export function useCreateEvaluation(bidId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: EvaluationFormValues) =>
      bidRepository.createEvaluation(values),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: bidQueryKeys.evaluations(bidId),
      });
      queryClient.invalidateQueries({ queryKey: bidQueryKeys.all });
      toast.success("Evaluation saved");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useProcurementRankings(procurementRequestId: string) {
  return useQuery({
    queryKey: bidQueryKeys.rankings(procurementRequestId),
    queryFn: () => bidRepository.getRankings(procurementRequestId),
    enabled: Boolean(procurementRequestId),
    staleTime: 30 * 1000,
  });
}

export function useAwardBid(procurementRequestId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: AwardBidFormValues) => bidRepository.award(values),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: bidQueryKeys.rankings(procurementRequestId),
      });
      queryClient.invalidateQueries({ queryKey: bidQueryKeys.awards });
      queryClient.invalidateQueries({ queryKey: bidQueryKeys.all });
      toast.success("Bid awarded successfully");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useProcurementRecommendations(procurementRequestId: string) {
  return useMutation({
    mutationFn: () => bidRepository.getRecommendations(procurementRequestId),
    onSuccess: () => toast.success("Recommendations generated"),
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useAwards() {
  return useQuery({
    queryKey: bidQueryKeys.awards,
    queryFn: () => bidRepository.listAwards(),
    staleTime: 60 * 1000,
  });
}
