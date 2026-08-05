import { z } from "zod";

const vendorStatusEnum = z.enum([
  "ACTIVE",
  "INACTIVE",
  "SUSPENDED",
  "BLACKLISTED",
]);

const complianceStatusEnum = z.enum(["PENDING", "VERIFIED", "REJECTED"]);

export const vendorFormSchema = z.object({
  name: z.string().min(2, "Vendor name must be at least 2 characters"),
  email: z.string().email("Enter a valid email address"),
  phone: z.string().max(50).optional().or(z.literal("")),
  address: z.string().max(500).optional().or(z.literal("")),
  website: z
    .string()
    .url("Enter a valid URL")
    .optional()
    .or(z.literal("")),
  registrationNumber: z.string().max(100).optional().or(z.literal("")),
  taxIdentificationNumber: z.string().max(100).optional().or(z.literal("")),
  category: z.string().max(100).optional().or(z.literal("")),
  status: vendorStatusEnum.optional(),
  rating: z.string().optional(),
  complianceStatus: complianceStatusEnum.optional(),
  notes: z.string().max(2000).optional().or(z.literal("")),
});

export const vendorStatusSchema = z.object({
  status: vendorStatusEnum,
});

export const vendorComplianceSchema = z.object({
  complianceStatus: complianceStatusEnum,
});

export type VendorFormValues = z.infer<typeof vendorFormSchema>;
export type VendorStatusFormValues = z.infer<typeof vendorStatusSchema>;
export type VendorComplianceFormValues = z.infer<typeof vendorComplianceSchema>;
