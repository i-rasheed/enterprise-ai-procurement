"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Send, Square } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

import { useAssistantChat } from "../hooks/use-assistant";
import type { ChatMessage } from "../types";
import { conversationStorage } from "../utils/conversation-storage";
import { streamText } from "../utils/stream-text";
import { ChatMessageBubble } from "./chat-message-bubble";
import { ConversationHistorySidebar } from "./conversation-history-sidebar";
import { SuggestedPrompts } from "./suggested-prompts";

function createMessage(
  role: ChatMessage["role"],
  content: string,
  extra?: Partial<ChatMessage>,
): ChatMessage {
  return {
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    role,
    content,
    createdAt: new Date().toISOString(),
    ...extra,
  };
}

export function ChatWindow() {
  const chatMutation = useAssistantChat();
  const [conversations, setConversations] = useState(
    conversationStorage.list(),
  );
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(conversations[0]?.id ?? null);
  const [messages, setMessages] = useState<ChatMessage[]>(
    conversations[0]?.messages ?? [],
  );
  const [input, setInput] = useState("");
  const [contextHint, setContextHint] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const persistConversation = useCallback(
    (nextMessages: ChatMessage[], conversationId = activeConversationId) => {
      let id = conversationId;
      if (!id) {
        const created = conversationStorage.create(nextMessages);
        id = created.id;
        setActiveConversationId(id);
      } else {
        conversationStorage.upsertMessages(id, nextMessages);
      }
      setConversations(conversationStorage.list());
      return id;
    },
    [activeConversationId],
  );

  const handleStop = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    setIsStreaming(false);
    setMessages((current) =>
      current.map((message) =>
        message.isStreaming ? { ...message, isStreaming: false } : message,
      ),
    );
  };

  const handleSend = async (question: string) => {
    const trimmed = question.trim();
    if (!trimmed || chatMutation.isPending || isStreaming) {
      return;
    }

    const userMessage = createMessage("user", trimmed);
    const historyForApi = [...messages, userMessage]
      .filter((message) => !message.isStreaming && message.content.trim())
      .slice(-20)
      .map((message) => ({
        role: message.role,
        content: message.content,
      }));

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    persistConversation(nextMessages);

    const assistantPlaceholder = createMessage("assistant", "", {
      isStreaming: true,
    });
    setMessages((current) => [...current, assistantPlaceholder]);
    setIsStreaming(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const response = await chatMutation.mutateAsync({
        question: trimmed,
        context: contextHint.trim() || undefined,
        conversationHistory: historyForApi.slice(0, -1),
      });

      if (controller.signal.aborted) {
        return;
      }

      await streamText(
        response.answer,
        (partial) => {
          setMessages((current) =>
            current.map((message) =>
              message.id === assistantPlaceholder.id
                ? {
                    ...message,
                    content: partial,
                    relevantRecords: response.relevantRecords,
                    isStreaming: true,
                  }
                : message,
            ),
          );
        },
        { signal: controller.signal },
      );

      const finalMessages = [
        ...nextMessages,
        {
          ...assistantPlaceholder,
          content: response.answer,
          relevantRecords: response.relevantRecords,
          isStreaming: false,
        },
      ];
      setMessages(finalMessages);
      persistConversation(finalMessages);
    } catch {
      setMessages((current) =>
        current.filter((message) => message.id !== assistantPlaceholder.id),
      );
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
    }
  };

  const handleNewConversation = () => {
    handleStop();
    const created = conversationStorage.create([]);
    setActiveConversationId(created.id);
    setMessages([]);
    setConversations(conversationStorage.list());
  };

  const handleSelectConversation = (id: string) => {
    handleStop();
    const conversation = conversationStorage.get(id);
    if (!conversation) return;
    setActiveConversationId(id);
    setMessages(conversation.messages);
  };

  const handleDeleteConversation = (id: string) => {
    conversationStorage.delete(id);
    const remaining = conversationStorage.list();
    setConversations(remaining);

    if (activeConversationId === id) {
      const next = remaining[0];
      setActiveConversationId(next?.id ?? null);
      setMessages(next?.messages ?? []);
    }
  };

  const isBusy = chatMutation.isPending || isStreaming;

  return (
    <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
      <ConversationHistorySidebar
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelect={handleSelectConversation}
        onNew={handleNewConversation}
        onDelete={handleDeleteConversation}
      />

      <div className="flex min-h-[640px] flex-col rounded-xl border bg-card">
        <div className="space-y-3 border-b p-4">
          <div className="space-y-2">
            <label
              htmlFor="assistantContext"
              className="text-muted-foreground text-xs font-medium uppercase tracking-wide"
            >
              Optional context
            </label>
            <input
              id="assistantContext"
              className="border-input bg-background flex h-9 w-full rounded-md border px-3 text-sm"
              placeholder="e.g. Focus on IT hardware procurement for Q3"
              value={contextHint}
              onChange={(event) => setContextHint(event.target.value)}
              disabled={isBusy}
            />
          </div>
        </div>

        <ScrollArea className="flex-1 px-4 py-4">
          {messages.length === 0 ? (
            <div className="space-y-6 py-8">
              <div className="text-center">
                <h3 className="text-lg font-semibold">
                  Ask anything about procurement
                </h3>
                <p className="text-muted-foreground mt-1 text-sm">
                  The assistant uses your organisation data and semantic search
                  to answer questions.
                </p>
              </div>
              <SuggestedPrompts onSelect={handleSend} disabled={isBusy} />
            </div>
          ) : (
            <div className="space-y-6 pb-4">
              {messages.map((message) => (
                <ChatMessageBubble key={message.id} message={message} />
              ))}
              <div ref={bottomRef} />
            </div>
          )}
        </ScrollArea>

        {messages.length > 0 ? (
          <div className="border-t p-4">
            <SuggestedPrompts onSelect={handleSend} disabled={isBusy} />
          </div>
        ) : null}

        <form
          className="flex items-end gap-2 border-t p-4"
          onSubmit={(event) => {
            event.preventDefault();
            void handleSend(input);
          }}
        >
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                void handleSend(input);
              }
            }}
            placeholder="Ask about vendors, contracts, spend, or approvals..."
            rows={2}
            disabled={isBusy}
            className={cn(
              "border-input bg-background min-h-[72px] flex-1 resize-none rounded-md border px-3 py-2 text-sm",
              "focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none",
            )}
          />
          {isBusy ? (
            <Button type="button" variant="outline" onClick={handleStop}>
              <Square className="size-4" />
              Stop
            </Button>
          ) : (
            <Button type="submit" disabled={!input.trim()}>
              {chatMutation.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Send className="size-4" />
              )}
              Send
            </Button>
          )}
        </form>
      </div>
    </div>
  );
}
