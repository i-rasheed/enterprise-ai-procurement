"use client";

import { FileText, Upload } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ProcurementRequest } from "@/features/procurement/types";

const REQUIRED_ATTACHMENTS = [
  "Purchase justification memo",
  "Budget approval reference",
  "Vendor quote or estimate",
  "Technical specification",
];

type ProcurementAttachmentsPanelProps = {
  request: ProcurementRequest;
  canEdit: boolean;
};

export function ProcurementAttachmentsPanel({
  request,
  canEdit,
}: ProcurementAttachmentsPanelProps) {
  const hasDescription = request.description.length > 0;
  const hasJustification = request.justification.length > 0;

  const attachments = REQUIRED_ATTACHMENTS.map((name, index) => ({
    id: String(index),
    name,
    status:
      (index === 0 && hasDescription) || (index === 1 && hasJustification)
        ? ("UPLOADED" as const)
        : ("PENDING" as const),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="size-5" />
          Attachments
        </CardTitle>
        <CardDescription>
          Supporting documents for this procurement request.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="flex items-center justify-between rounded-lg border p-4"
            >
              <span className="font-medium">{attachment.name}</span>
              <Badge
                variant={
                  attachment.status === "UPLOADED" ? "secondary" : "outline"
                }
              >
                {attachment.status === "UPLOADED" ? "Referenced" : "Pending"}
              </Badge>
            </div>
          ))}
        </div>

        {canEdit ? (
          <div className="rounded-lg border border-dashed p-6 text-center">
            <Upload className="text-muted-foreground mx-auto mb-2 size-8" />
            <p className="text-sm font-medium">Upload attachments</p>
            <p className="text-muted-foreground mt-1 text-sm">
              File upload will be available when the documents API is enabled.
              Include details in the description and justification fields for now.
            </p>
            <Button type="button" variant="outline" className="mt-4" disabled>
              Upload file
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
