"use client";

import { useState } from "react";
import { Bot, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  VENDOR_FAQ,
  VENDOR_SUGGESTED_PROMPTS,
} from "@/features/vendor-portal/config/navigation";
import { useVendorAssistantChat } from "@/features/vendor-portal/hooks/use-vendor-portal";
import type { VendorAssistantMessage } from "@/features/vendor-portal/types";
import { streamText } from "@/features/assistant/utils/stream-text";
import { ApiClientError } from "@/lib/api";

export function VendorAssistantPanel() {
  const chatMutation = useVendorAssistantChat();
  const [messages, setMessages] = useState<VendorAssistantMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);

  const handleAsk = async (question: string) => {
    const trimmed = question.trim();
    if (!trimmed || isStreaming) return;

    const userMessage: VendorAssistantMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
    };

    setMessages((current) => [...current, userMessage]);
    setInput("");
    setIsStreaming(true);

    const faqAnswer = VENDOR_FAQ[trimmed];
    const assistantId = crypto.randomUUID();

    try {
      if (faqAnswer) {
        setMessages((current) => [
          ...current,
          { id: assistantId, role: "assistant", content: "" },
        ]);
        await streamText(faqAnswer, (partial) => {
          setMessages((current) =>
            current.map((message) =>
              message.id === assistantId
                ? { ...message, content: partial }
                : message,
            ),
          );
        });
        return;
      }

      const response = await chatMutation.mutateAsync({
        question: trimmed,
        context: "Vendor portal assistant for supplier users.",
      });

      setMessages((current) => [
        ...current,
        { id: assistantId, role: "assistant", content: "" },
      ]);

      await streamText(response.answer, (partial) => {
        setMessages((current) =>
          current.map((message) =>
            message.id === assistantId
              ? { ...message, content: partial }
              : message,
          ),
        );
      });
    } catch (error) {
      const fallback =
        error instanceof ApiClientError && error.statusCode === 403
          ? "AI chat is not enabled for vendor accounts in this environment. Use the suggested prompts for quick guidance."
          : "Unable to reach the assistant right now. Try one of the suggested prompts.";

      setMessages((current) => [
        ...current,
        { id: assistantId, role: "assistant", content: fallback },
      ]);
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="flex items-center gap-2 text-xl font-semibold">
          <Bot className="size-5" />
          AI assistant
        </h2>
        <p className="text-muted-foreground text-sm">
          Ask questions about RFQs, bids, orders, and contracts in your vendor
          workspace.
        </p>
      </div>

      <Card className="min-h-[520px]">
        <CardHeader>
          <CardTitle className="text-base">Vendor chat</CardTitle>
          <CardDescription>
            Suggested prompts work offline. Live AI responses depend on your
            organisation&apos;s AI access policy.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex h-[420px] flex-col gap-4">
          <ScrollArea className="flex-1 pr-3">
            {messages.length === 0 ? (
              <div className="space-y-3">
                <p className="text-muted-foreground text-sm">
                  Try a suggested prompt to get started.
                </p>
                <div className="flex flex-wrap gap-2">
                  {VENDOR_SUGGESTED_PROMPTS.map((prompt) => (
                    <Button
                      key={prompt}
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={isStreaming}
                      onClick={() => void handleAsk(prompt)}
                    >
                      {prompt}
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={
                      message.role === "user"
                        ? "bg-primary text-primary-foreground ml-8 rounded-2xl rounded-tr-sm px-4 py-3 text-sm"
                        : "bg-muted mr-8 rounded-2xl rounded-tl-sm px-4 py-3 text-sm"
                    }
                  >
                    {message.content}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          <form
            className="flex gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              void handleAsk(input);
            }}
          >
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask about RFQs, bids, or orders..."
              className="border-input bg-background h-10 flex-1 rounded-md border px-3 text-sm"
              disabled={isStreaming}
            />
            <Button type="submit" disabled={!input.trim() || isStreaming}>
              <Send className="size-4" />
              Send
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
