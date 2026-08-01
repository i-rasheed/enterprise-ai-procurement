import { apiClient } from "@/lib/api/client";
import type { ChatRequest, ChatResponse } from "@/lib/api/types";

const AI_TIMEOUT_MS = 120_000;

export const assistantRepository = {
  async chat(payload: ChatRequest) {
    const response = await apiClient.post<ChatResponse>("/ai/chat", payload, {
      timeout: AI_TIMEOUT_MS,
    });
    return response.data;
  },
};
