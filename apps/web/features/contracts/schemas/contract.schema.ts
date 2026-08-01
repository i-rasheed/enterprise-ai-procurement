import { z } from "zod";

const contractTypeEnum = z.enum([
  "GOODS",
  "SERVICES",
  "CONSULTING",
  "SOFTWARE",
  "FRAMEWORK",
]);

export const createContractSchema = z
  .object({
    sourceType: z.enum(["award", "purchaseOrder"]),
    awardId: z.string().optional(),
    purchaseOrderId: z.string().optional(),
    title: z.string().min(1, "Title is required").max(255),
    description: z.string().min(1, "Description is required").max(5000),
    contractType: contractTypeEnum,
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
    value: z.number().min(0.01, "Value must be greater than zero"),
    currency: z.string().max(3).optional().or(z.literal("")),
    renewalType: z.string().max(50).optional().or(z.literal("")),
    renewalDate: z.string().optional().or(z.literal("")),
    autoRenew: z.boolean().optional(),
    signedByOrganisation: z.string().max(255).optional().or(z.literal("")),
    signedByVendor: z.string().max(255).optional().or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    if (data.sourceType === "award" && !data.awardId) {
      ctx.addIssue({
        code: "custom",
        message: "Select an award",
        path: ["awardId"],
      });
    }
    if (data.sourceType === "purchaseOrder" && !data.purchaseOrderId) {
      ctx.addIssue({
        code: "custom",
        message: "Select a purchase order",
        path: ["purchaseOrderId"],
      });
    }
  });

export const updateContractSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().min(1).max(5000),
  contractType: contractTypeEnum,
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  value: z.number().min(0.01),
  renewalType: z.string().max(50).optional().or(z.literal("")),
  renewalDate: z.string().optional().or(z.literal("")),
  autoRenew: z.boolean().optional(),
  signedByOrganisation: z.string().max(255).optional().or(z.literal("")),
  signedByVendor: z.string().max(255).optional().or(z.literal("")),
  changeSummary: z.string().max(2000).optional().or(z.literal("")),
});

export const renewContractSchema = z.object({
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  value: z.number().min(0.01).optional(),
  renewalDate: z.string().optional().or(z.literal("")),
  changeSummary: z
    .string()
    .min(1, "Change summary is required")
    .max(2000),
});

export const terminateContractSchema = z.object({
  reason: z.string().min(1, "Termination reason is required").max(2000),
});

export const uploadContractDocumentSchema = z.object({
  fileName: z.string().min(1, "File name is required").max(255),
  fileUrl: z.string().min(1, "File URL is required").max(2000),
  mimeType: z.string().min(1, "MIME type is required").max(100),
});

export type CreateContractFormValues = z.infer<typeof createContractSchema>;
export type UpdateContractFormValues = z.infer<typeof updateContractSchema>;
export type RenewContractFormValues = z.infer<typeof renewContractSchema>;
export type TerminateContractFormValues = z.infer<
  typeof terminateContractSchema
>;
export type UploadContractDocumentFormValues = z.infer<
  typeof uploadContractDocumentSchema
>;
