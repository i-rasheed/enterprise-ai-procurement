"use client";

import { MessageSquarePlus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

import type { StoredConversation } from "../types";

type ConversationHistorySidebarProps = {
  conversations: StoredConversation[];
  activeConversationId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
};

export function ConversationHistorySidebar({
  conversations,
  activeConversationId,
  onSelect,
  onNew,
  onDelete,
}: ConversationHistorySidebarProps) {
  return (
    <aside className="flex h-full flex-col rounded-xl border bg-card">
      <div className="flex items-center justify-between border-b p-4">
        <div>
          <h2 className="font-semibold">History</h2>
          <p className="text-muted-foreground text-xs">
            Saved on this device
          </p>
        </div>
        <Button type="button" size="sm" variant="outline" onClick={onNew}>
          <MessageSquarePlus className="size-4" />
          New
        </Button>
      </div>

      <ScrollArea className="flex-1 p-2">
        {conversations.length === 0 ? (
          <p className="text-muted-foreground px-2 py-6 text-center text-sm">
            No conversations yet. Start chatting to build history.
          </p>
        ) : (
          <div className="space-y-1">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                className={cn(
                  "group flex items-start gap-2 rounded-lg p-2",
                  activeConversationId === conversation.id && "bg-muted",
                )}
              >
                <button
                  type="button"
                  className="min-w-0 flex-1 text-left"
                  onClick={() => onSelect(conversation.id)}
                >
                  <p className="truncate text-sm font-medium">
                    {conversation.title}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {new Date(conversation.updatedAt).toLocaleString()}
                  </p>
                </button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-7 shrink-0 opacity-0 group-hover:opacity-100"
                  onClick={() => onDelete(conversation.id)}
                  aria-label="Delete conversation"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </aside>
  );
}
