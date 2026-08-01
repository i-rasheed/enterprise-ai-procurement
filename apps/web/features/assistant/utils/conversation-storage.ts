import type { ChatMessage, StoredConversation } from "../types";

const STORAGE_KEY = "procureai-assistant-conversations";
const MAX_CONVERSATIONS = 30;

function readAll(): StoredConversation[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StoredConversation[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(conversations: StoredConversation[]): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
}

function buildTitle(messages: ChatMessage[]): string {
  const firstUser = messages.find((message) => message.role === "user");
  if (!firstUser) return "New conversation";
  return firstUser.content.length > 48
    ? `${firstUser.content.slice(0, 48).trim()}…`
    : firstUser.content;
}

export const conversationStorage = {
  list(): StoredConversation[] {
    return readAll().sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
  },

  get(id: string): StoredConversation | null {
    return readAll().find((conversation) => conversation.id === id) ?? null;
  },

  save(conversation: StoredConversation): StoredConversation {
    const conversations = readAll().filter(
      (item) => item.id !== conversation.id,
    );
    conversations.unshift(conversation);
    writeAll(conversations.slice(0, MAX_CONVERSATIONS));
    return conversation;
  },

  upsertMessages(
    id: string,
    messages: ChatMessage[],
  ): StoredConversation {
    const existing = this.get(id);
    const now = new Date().toISOString();

    const conversation: StoredConversation = {
      id,
      title: buildTitle(messages),
      messages,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };

    return this.save(conversation);
  },

  create(messages: ChatMessage[] = []): StoredConversation {
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

    return this.upsertMessages(id, messages);
  },

  delete(id: string): void {
    writeAll(readAll().filter((conversation) => conversation.id !== id));
  },

  clear(): void {
    writeAll([]);
  },
};
