import type { StoredApiKey } from "../types";

const STORAGE_KEY = "spendwise-api-keys";

function readAll(): StoredApiKey[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StoredApiKey[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(keys: StoredApiKey[]): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(keys));
}

function generateKey(): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return `pk_${Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("")}`;
}

export const apiKeyStorage = {
  list(organisationId: string): StoredApiKey[] {
    return readAll().filter((key) => key.keyHash.startsWith(organisationId));
  },

  create(organisationId: string, name: string): { record: StoredApiKey; secret: string } {
    const secret = generateKey();
    const record: StoredApiKey = {
      id:
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name,
      prefix: secret.slice(0, 12),
      keyHash: `${organisationId}:${secret.slice(-8)}`,
      createdAt: new Date().toISOString(),
      lastUsedAt: null,
    };

    writeAll([record, ...readAll()]);
    return { record, secret };
  },

  revoke(id: string): void {
    writeAll(readAll().filter((key) => key.id !== id));
  },
};
