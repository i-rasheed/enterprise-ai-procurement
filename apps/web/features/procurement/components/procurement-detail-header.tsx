"use client";

import Link from "next/link";
import { ArrowLeft, Calendar, User } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ProcurementPriorityBadge,
  ProcurementStatusBadge,
} from "@/features/procurement/components/procurement-status-badge";
import type { ProcurementRequest } from "@/features/procurement/types";
import { formatCurrency } from "@/features/procurement/utils/formatters";

type ProcurementDetailHeaderProps = {
  request: ProcurementRequest;
};

export function ProcurementDetailHeader({
  request,
}: ProcurementDetailHeaderProps) {
  return (
    <div className="space-y-4">
      <Link
        href="/dashboard/procurement"
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm"
      >
        <ArrowLeft className="size-4" />
        Back to procurement
      </Link>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-2">
              <CardTitle className="text-2xl">{request.title}</CardTitle>
              <div className="flex flex-wrap gap-2">
                <ProcurementStatusBadge status={request.status} />
                <ProcurementPriorityBadge priority={request.priority} />
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">
                {formatCurrency(request.estimatedBudget, request.currency)}
              </p>
              <p className="text-muted-foreground text-sm">Estimated budget</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-center gap-2 text-sm">
            <User className="text-muted-foreground size-4" />
            {request.requester.firstName} {request.requester.lastName}
          </div>
          <div className="text-sm">
            <span className="text-muted-foreground">Department:</span>{" "}
            {request.department}
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="text-muted-foreground size-4" />
            {new Date(request.requiredDeliveryDate).toLocaleDateString()}
          </div>
          <div className="text-sm">
            <span className="text-muted-foreground">Created:</span>{" "}
            {new Date(request.createdAt).toLocaleDateString()}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
