"use client";

import { HelpCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { RFQQuestion } from "@/features/rfqs/types";

const PLACEHOLDER_QUESTIONS: RFQQuestion[] = [
  {
    id: "1",
    question: "Can vendors propose alternative specifications?",
    answer: null,
    askedAt: new Date().toISOString(),
    status: "OPEN",
  },
];

type RfqQuestionsPanelProps = {
  canManage: boolean;
};

export function RfqQuestionsPanel({ canManage }: RfqQuestionsPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HelpCircle className="size-5" />
          Vendor questions
        </CardTitle>
        <CardDescription>
          Q&A thread for vendor clarifications during the RFQ period.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg border border-dashed p-6 text-center">
          <p className="text-sm font-medium">Questions API pending</p>
          <p className="text-muted-foreground mt-1 text-sm">
            Vendor Q&A will be available when the RFQ questions endpoint is
            enabled. The UI below shows the planned layout.
          </p>
        </div>

        <div className="space-y-3">
          {PLACEHOLDER_QUESTIONS.map((item) => (
            <div key={item.id} className="rounded-lg border p-4">
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="font-medium">{item.question}</p>
                <Badge variant="outline">{item.status.toLowerCase()}</Badge>
              </div>
              <p className="text-muted-foreground text-sm">
                {item.answer ?? "Awaiting response from procurement team."}
              </p>
            </div>
          ))}
        </div>

        {canManage ? (
          <Button type="button" variant="outline" disabled>
            Post answer
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
