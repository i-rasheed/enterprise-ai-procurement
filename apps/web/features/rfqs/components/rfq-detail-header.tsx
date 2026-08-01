"use client";

import Link from "next/link";
import { ArrowLeft, Calendar, FileText } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RfqStatusBadge } from "@/features/rfqs/components/rfq-status-badge";
import { isClosingDatePast } from "@/features/rfqs/config/permissions";
import type { RFQ } from "@/features/rfqs/types";

type RfqDetailHeaderProps = {
  rfq: RFQ;
};

export function RfqDetailHeader({ rfq }: RfqDetailHeaderProps) {
  const closingPast = isClosingDatePast(rfq.closingDate);

  return (
    <div className="space-y-4">
      <Link
        href="/dashboard/rfqs"
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm"
      >
        <ArrowLeft className="size-4" />
        Back to RFQs
      </Link>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-2">
              <p className="text-muted-foreground font-mono text-sm">{rfq.rfqNumber}</p>
              <CardTitle className="text-2xl">{rfq.title}</CardTitle>
              <RfqStatusBadge status={rfq.status} />
            </div>
            <div className="text-right text-sm">
              <div className="flex items-center justify-end gap-2">
                <Calendar className="size-4" />
                <span className={closingPast && rfq.status === "PUBLISHED" ? "text-destructive font-medium" : ""}>
                  Closes {new Date(rfq.closingDate).toLocaleString()}
                </span>
              </div>
              <p className="text-muted-foreground mt-1">
                Created by {rfq.createdBy.firstName} {rfq.createdBy.lastName}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-2 text-sm">
            <FileText className="text-muted-foreground mt-0.5 size-4" />
            <p className="whitespace-pre-wrap">{rfq.description}</p>
          </div>
          <p className="text-muted-foreground text-sm">
            Linked procurement request:{" "}
            <Link
              href={`/dashboard/procurement/${rfq.procurementRequestId}`}
              className="text-primary hover:underline"
            >
              View request
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
