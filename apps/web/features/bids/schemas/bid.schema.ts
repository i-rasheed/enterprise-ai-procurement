import { z } from "zod";

const scoreField = z.number().min(0, "Minimum score is 0").max(100, "Maximum score is 100");

export const evaluationSchema = z.object({
  bidId: z.string().min(1),
  technicalScore: scoreField,
  commercialScore: scoreField,
  complianceScore: scoreField,
  deliveryScore: scoreField,
  comments: z.string().max(2000).optional().or(z.literal("")),
});

export const awardBidSchema = z.object({
  bidId: z.string().min(1, "Select a bid to award"),
  awardReason: z.string().min(1, "Award reason is required").max(2000),
});

export type EvaluationFormValues = z.infer<typeof evaluationSchema>;
export type AwardBidFormValues = z.infer<typeof awardBidSchema>;

export function calculateTotalScore(values: Pick<
  EvaluationFormValues,
  "technicalScore" | "commercialScore" | "complianceScore" | "deliveryScore"
>): number {
  return (
    Number(values.technicalScore) +
    Number(values.commercialScore) +
    Number(values.complianceScore) +
    Number(values.deliveryScore)
  );
}
