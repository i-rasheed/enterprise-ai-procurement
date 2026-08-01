"use client";

import { Bot, UserRound } from "lucide-react";

import { cn } from "@/lib/utils";

import type { ChatMessage } from "../types";
import { RelevantRecordsList } from "./relevant-records-list";

type ChatMessageBubbleProps = {
  message: ChatMessage;
};

export function ChatMessageBubble({ message }: ChatMessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex gap-3",
        isUser ? "flex-row-reverse text-right" : "flex-row",
      )}
    >
      <div
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-full",
          isUser ? "bg-primary text-primary-foreground" : "bg-muted",
        )}
      >
        {isUser ? <UserRound className="size-4" /> : <Bot className="size-4" />}
      </div>

      <div
        className={cn(
          "max-w-[85%] space-y-2",
          isUser ? "items-end" : "items-start",
        )}
      >
        <div
          className={cn(
            "rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap",
            isUser
              ? "bg-primary text-primary-foreground rounded-tr-sm"
              : "bg-muted rounded-tl-sm",
          )}
        >
          {message.content}
          {message.isStreaming ? (
            <span className="ml-1 inline-block h-4 w-1 animate-pulse bg-current align-middle" />
          ) : null}
        </div>

        {!isUser && message.relevantRecords?.length ? (
          <RelevantRecordsList records={message.relevantRecords} />
        ) : null}
      </div>
    </div>
  );
}
