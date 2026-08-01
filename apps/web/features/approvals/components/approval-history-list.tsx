"use client";

import Link from "next/link";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ApprovalStatusPanel } from "@/features/procurement/components/approval-status-panel";
import {
  ProcurementPriorityBadge,
  ProcurementStatusBadge,
} from "@/features/procurement/components/procurement-status-badge";
import { useApprovalHistory } from "@/features/approvals/hooks/use-approvals";
import type { ProcurementRequest } from "@/features/procurement/types";
import { formatCurrency } from "@/features/procurement/utils/formatters";

type ApprovalHistoryListProps = {
  requests: ProcurementRequest[];
};

export function ApprovalHistoryList({ requests }: ApprovalHistoryListProps) {
  const submittedRequests = requests.filter(
    (request) => request.status !== "DRAFT",
  );

  if (submittedRequests.length === 0) {
    return (
      <p className="text-muted-foreground py-8 text-center text-sm">
        No submitted requests with approval history yet.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {submittedRequests.map((request) => (
        <ApprovalHistoryCard key={request.id} request={request} />
      ))}
    </div>
  );
}

function ApprovalHistoryCard({ request }: { request: ProcurementRequest }) {
  const [expanded, setExpanded] = useState(false);
  const historyQuery = useApprovalHistory(request.id, expanded);

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <CardTitle className="text-base">
            <Link
              href={`/dashboard/procurement/${request.id}`}
              className="hover:underline"
            >
              {request.title}
            </Link>
          </CardTitle>
          <CardDescription>
            {request.department} ·{" "}
            {request.requester.firstName} {request.requester.lastName}
          </CardDescription>
          <div className="flex flex-wrap gap-2">
            <ProcurementStatusBadge status={request.status} />
            <ProcurementPriorityBadge priority={request.priority} />
          </div>
        </div>
        <div className="text-right">
          <p className="font-semibold">
            {formatCurrency(request.estimatedBudget, request.currency)}
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() => setExpanded((value) => !value)}
          >
            {expanded ? "Hide history" : "View history"}
          </Button>
        </div>
      </CardHeader>
      {expanded ? (
        <CardContent>
          <ApprovalStatusPanel
            requestId={request.id}
            history={historyQuery.data}
            isLoading={historyQuery.isLoading}
          />
        </CardContent>
      ) : null}
    </Card>
  );
}

export function ApprovalHistorySummary({
  workflowStatus,
  currentLevel,
  totalLevels,
}: {
  workflowStatus?: string | null;
  currentLevel?: number;
  totalLevels?: number;
}) {
  if (!workflowStatus) {
    return <Badge variant="outline">No workflow</Badge>;
  }

  return (
    <Badge variant="secondary">
      {workflowStatus.replace("_", " ").toLowerCase()}
      {currentLevel && totalLevels
        ? ` · L${currentLevel}/${totalLevels}`
        : ""}
    </Badge>
  );
}
