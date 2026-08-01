import { z } from "zod";

const priorityEnum = z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]);
const statusEnum = z.enum([
  "DRAFT",
  "SUBMITTED",
  "CANCELLED",
  "REJECTED",
  "APPROVED",
]);

export const procurementRequestSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters").max(255),
  description: z.string().min(10, "Description is required").max(5000),
  justification: z.string().min(10, "Justification is required").max(5000),
  department: z.string().min(1, "Department is required").max(100),
  estimatedBudget: z
    .number({ error: "Estimated budget must be a number" })
    .positive("Estimated budget must be greater than zero"),
  currency: z.string().max(3).optional(),
  priority: priorityEnum.optional(),
  requiredDeliveryDate: z.string().min(1, "Delivery date is required"),
});

export const procurementItemSchema = z.object({
  description: z.string().min(1, "Item description is required").max(500),
  quantity: z
    .number({ error: "Quantity must be a number" })
    .int()
    .positive("Quantity must be at least 1"),
  unitPrice: z
    .number({ error: "Unit price must be a number" })
    .positive("Unit price must be greater than zero"),
});

export const submitProcurementSchema = z.object({
  submissionNote: z.string().max(1000).optional().or(z.literal("")),
});

export const approveStepSchema = z.object({
  comments: z.string().max(2000).optional().or(z.literal("")),
});

export const rejectStepSchema = z.object({
  comments: z.string().min(1, "Rejection reason is required").max(2000),
});

export type ProcurementRequestFormValues = z.infer<
  typeof procurementRequestSchema
>;
export type ProcurementItemFormValues = z.infer<typeof procurementItemSchema>;
export type SubmitProcurementFormValues = z.infer<typeof submitProcurementSchema>;
export type ApproveStepFormValues = z.infer<typeof approveStepSchema>;
export type RejectStepFormValues = z.infer<typeof rejectStepSchema>;

export { priorityEnum, statusEnum };
