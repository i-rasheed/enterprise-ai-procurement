import type {
  ApprovalHistory,
  ApprovalStep,
  ProcurementPriority,
  ProcurementRequest,
  ProcurementStatus,
  TimelineEvent,
} from "../types";

export function formatProcurementStatus(status: ProcurementStatus): string {
  const labels: Record<ProcurementStatus, string> = {
    DRAFT: "Draft",
    SUBMITTED: "Submitted",
    CANCELLED: "Cancelled",
    REJECTED: "Rejected",
    APPROVED: "Approved",
  };
  return labels[status];
}

export function formatProcurementPriority(
  priority: ProcurementPriority,
): string {
  return priority.charAt(0) + priority.slice(1).toLowerCase();
}

export function formatApprovalRole(role: string): string {
  return role
    .split("_")
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(" ");
}

export function formatCurrency(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export function canEditRequest(request: ProcurementRequest): boolean {
  return request.status === "DRAFT";
}

export function canDeleteRequest(request: ProcurementRequest): boolean {
  return request.status === "DRAFT";
}

export function canSubmitRequest(request: ProcurementRequest): boolean {
  return request.status === "DRAFT" && request.items.length > 0;
}

export function buildTimelineEvents(
  request: ProcurementRequest,
  history?: ApprovalHistory | null,
): TimelineEvent[] {
  const events: TimelineEvent[] = [
    {
      id: "created",
      title: "Request created",
      description: `Created by ${request.requester.firstName} ${request.requester.lastName}`,
      timestamp: request.createdAt,
      status: "completed",
    },
  ];

  if (request.status !== "DRAFT") {
    events.push({
      id: "submitted",
      title: "Submitted for approval",
      description: "Request entered the approval workflow",
      timestamp: request.updatedAt,
      status: "completed",
    });
  }

  history?.workflow?.steps.forEach((step) => {
    events.push(mapApprovalStepToTimelineEvent(step));
  });

  if (request.status === "APPROVED") {
    events.push({
      id: "approved",
      title: "Request approved",
      description: "All approval levels completed",
      timestamp: request.updatedAt,
      status: "completed",
    });
  }

  if (request.status === "REJECTED") {
    events.push({
      id: "rejected",
      title: "Request rejected",
      description: "Approval workflow terminated",
      timestamp: request.updatedAt,
      status: "rejected",
    });
  }

  return events.sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
  );
}

function mapApprovalStepToTimelineEvent(step: ApprovalStep): TimelineEvent {
  const statusMap: Record<string, TimelineEvent["status"]> = {
    PENDING: step.actedAt ? "current" : "pending",
    APPROVED: "completed",
    REJECTED: "rejected",
    SKIPPED: "skipped",
  };

  return {
    id: step.id,
    title: `${formatApprovalRole(step.role)} review`,
    description:
      step.comments ??
      `${step.approver.firstName} ${step.approver.lastName} — ${step.status.toLowerCase()}`,
    timestamp: step.actedAt ?? step.createdAt,
    status: statusMap[step.status] ?? "pending",
  };
}
