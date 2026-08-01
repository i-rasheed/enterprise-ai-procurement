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
import type { RFQAttachment } from "@/features/rfqs/types";

const REQUIRED_ATTACHMENTS: RFQAttachment[] = [
  {
    id: "1",
    name: "Technical specification",
    type: "SPECIFICATION",
    uploadedAt: new Date().toISOString(),
    status: "PENDING",
  },
  {
    id: "2",
    name: "Terms and conditions",
    type: "TERMS",
    uploadedAt: new Date().toISOString(),
    status: "PENDING",
  },
  {
    id: "3",
    name: "Pricing template",
    type: "TEMPLATE",
    uploadedAt: new Date().toISOString(),
    status: "PENDING",
  },
];

type RfqAttachmentsPanelProps = {
  canManage: boolean;
};

export function RfqAttachmentsPanel({ canManage }: RfqAttachmentsPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="size-5" />
          RFQ attachments
        </CardTitle>
        <CardDescription>
          Supporting documents shared with invited vendors.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {REQUIRED_ATTACHMENTS.map((attachment) => (
            <div
              key={attachment.id}
              className="flex items-center justify-between rounded-lg border p-4"
            >
              <div>
                <p className="font-medium">{attachment.name}</p>
                <p className="text-muted-foreground text-sm">{attachment.type}</p>
              </div>
              <Badge variant="outline">{attachment.status.toLowerCase()}</Badge>
            </div>
          ))}
        </div>

        {canManage ? (
          <div className="rounded-lg border border-dashed p-6 text-center">
            <Upload className="text-muted-foreground mx-auto mb-2 size-8" />
            <p className="text-sm font-medium">Upload attachments</p>
            <p className="text-muted-foreground mt-1 text-sm">
              RFQ file upload will be available when the documents API is
              enabled. Include details in the RFQ description for now.
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
