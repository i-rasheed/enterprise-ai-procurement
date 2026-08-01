import { brandingSchema, type BrandingFormValues } from "../schemas/settings.schema";
import type { BrandingPreferences } from "../types";

export function toBrandingFormValues(
  preferences: BrandingPreferences,
  fallbackName: string,
): BrandingFormValues {
  return brandingSchema.parse({
    displayName: preferences.displayName || fallbackName,
    tagline: preferences.tagline,
    logoUrl: preferences.logoUrl,
    primaryColor: preferences.primaryColor,
  });
}

export function fromBrandingFormValues(
  values: BrandingFormValues,
): BrandingPreferences {
  return {
    displayName: values.displayName.trim(),
    tagline: (values.tagline ?? "").trim(),
    logoUrl: values.logoUrl.trim(),
    primaryColor: values.primaryColor,
  };
}
