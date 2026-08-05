import { z } from "zod";

export const brandingSchema = z.object({
  displayName: z.string().min(1, "Display name is required").max(100),
  tagline: z.string().max(160).optional().or(z.literal("")),
  logoUrl: z
    .string()
    .refine(
      (value) => value === "" || /^https?:\/\/.+/i.test(value),
      "Enter a valid logo URL",
    ),
  primaryColor: z
    .string()
    .regex(/^#([0-9a-fA-F]{6})$/, "Use a valid hex color"),
});

export type BrandingFormValues = z.infer<typeof brandingSchema>;

export const apiKeySchema = z.object({
  name: z.string().min(2, "Key name is required").max(80),
});

export type ApiKeyFormValues = z.infer<typeof apiKeySchema>;
