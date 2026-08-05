"use client";

import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ApprovalActionPanel } from "@/features/approvals/components/approval-action-panel";
import {
  useApproveFromQueue,
  useRejectFromQueue,
} from "@/features/approvals/hooks/use-approvals";
import type { PendingApproval } from "@/features/approvals/types";
import {
  ProcurementPriorityBadge,
} from "@/features/procurement/components/procurement-status-badge";
import { formatApprovalRole, formatCurrency } from "@/features/procurement/utils/formatters";

type ApprovalQueueTableProps = {
  items: PendingApproval[];
};

export function ApprovalQueueTable({ items }: ApprovalQueueTableProps) {
  return (
    <div className="space-y-4">
      {items.map((item) => (
        <ApprovalQueueCard key={item.id} item={item} />
      ))}
    </div>
  );
}

function ApprovalQueueCard({ item }: { item: PendingApproval }) {
  const request = item.procurementRequest;
  const approve = useApproveFromQueue();
  const reject = useRejectFromQueue();
  const isPending = approve.isPending || reject.isPending;

  if (!request) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <CardTitle className="text-lg">
            <Link
              href={`/dashboard/procurement/${request.id}`}
              className="hover:underline"
            >
              {request.title}
            </Link>
          </CardTitle>
          <CardDescription>
            {request.department} · Level {item.level}:{" "}
            {formatApprovalRole(item.role)}
          </CardDescription>
          <div className="flex flex-wrap gap-2">
            <ProcurementPriorityBadge priority={request.priority} />
            <Badge variant="outline">
              {request.requester.firstName} {request.requester.lastName}
            </Badge>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xl font-semibold">
            {formatCurrency(request.estimatedBudget, request.currency)}
          </p>
          <p className="text-muted-foreground text-sm">Estimated budget</p>
        </div>
      </CardHeader>
      <CardContent>
        <ApprovalActionPanel
          isPending={isPending}
          onApprove={(values) =>
            approve.mutate({
              workflowId: item.workflowId,
              requestId: request.id,
              values,
            })
          }
          onReject={(values) =>
            reject.mutate({
              workflowId: item.workflowId,
              requestId: request.id,
              values,
            })
          }
        />
      </CardContent>
    </Card>
  );
}

export function ApprovalQueueTableCompact({ items }: ApprovalQueueTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending approvals</CardTitle>
        <CardDescription>{items.length} awaiting your action</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Request</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Level</TableHead>
              <TableHead>Budget</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) =>
              item.procurementRequest ? (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    <Link
                      href={`/dashboard/procurement/${item.procurementRequest.id}`}
                      className="hover:underline"
                    >
                      {item.procurementRequest.title}
                    </Link>
                  </TableCell>
                  <TableCell>{item.procurementRequest.department}</TableCell>
                  <TableCell>{formatApprovalRole(item.role)}</TableCell>
                  <TableCell>
                    {formatCurrency(
                      item.procurementRequest.estimatedBudget,
                      item.procurementRequest.currency,
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" asChild>
                      <Link
                        href={`/dashboard/procurement/${item.procurementRequest.id}`}
                      >
                        Review
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ) : null,
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
