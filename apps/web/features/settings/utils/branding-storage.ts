import type { BrandingPreferences } from "../types";

const STORAGE_KEY = "procureai-branding";

const DEFAULTS: BrandingPreferences = {
  displayName: "",
  tagline: "",
  logoUrl: "",
  primaryColor: "#2563eb",
};

function readAll(): Record<string, BrandingPreferences> {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, BrandingPreferences>;
  } catch {
    return {};
  }
}

function writeAll(data: Record<string, BrandingPreferences>): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export const brandingStorage = {
  get(organisationId: string): BrandingPreferences {
    return readAll()[organisationId] ?? { ...DEFAULTS };
  },

  save(organisationId: string, preferences: BrandingPreferences): BrandingPreferences {
    const all = readAll();
    all[organisationId] = preferences;
    writeAll(all);
    return preferences;
  },

  reset(organisationId: string): void {
    const all = readAll();
    delete all[organisationId];
    writeAll(all);
  },
};
