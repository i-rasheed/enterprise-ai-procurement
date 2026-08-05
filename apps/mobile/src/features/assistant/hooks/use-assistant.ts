import { useMutation, useQuery } from "@tanstack/react-query";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

import type { ChatMessage, ChatRequest } from "@/lib/api/types";
import { getErrorMessage } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";

import { assistantRepository } from "../api/assistant.repository";

type AssistantState = {
  messages: ChatMessage[];
  addMessage: (message: ChatMessage) => void;
  clearMessages: () => void;
};

export const useAssistantStore = create<AssistantState>()(
  persist(
    (set) => ({
      messages: [],
      addMessage: (message) =>
        set((state) => ({ messages: [...state.messages, message] })),
      clearMessages: () => set({ messages: [] }),
    }),
    {
      name: "spendwise-mobile-assistant",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ messages: state.messages }),
    },
  ),
);

export function useAssistantChat() {
  const addMessage = useAssistantStore((state) => state.addMessage);
  const messages = useAssistantStore((state) => state.messages);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useMutation({
    mutationFn: async (question: string) => {
      const payload: ChatRequest = {
        question,
        conversationHistory: messages.slice(-8).map((message) => ({
          role: message.role,
          content: message.content,
        })),
      };

      const userMessage: ChatMessage = {
        id: `${Date.now()}-user`,
        role: "user",
        content: question,
        createdAt: new Date().toISOString(),
      };
      addMessage(userMessage);

      const response = await assistantRepository.chat(payload);
      const assistantMessage: ChatMessage = {
        id: `${Date.now()}-assistant`,
        role: "assistant",
        content: response.answer,
        createdAt: new Date().toISOString(),
      };
      addMessage(assistantMessage);
      return response;
    },
    onError: (error) => {
      addMessage({
        id: `${Date.now()}-error`,
        role: "assistant",
        content: getErrorMessage(error),
        createdAt: new Date().toISOString(),
      });
    },
    meta: { enabled: isAuthenticated },
  });
}

export function useSuggestedPrompts() {
  return useQuery({
    queryKey: ["assistant", "prompts"],
    queryFn: async () => [
      "What approvals are waiting for me?",
      "Summarize outstanding purchase orders.",
      "Which invoices need attention?",
      "Show active contracts expiring soon.",
    ],
    staleTime: Infinity,
  });
}
