"use client";

import { TablePagination } from "@/components/shared/table-pagination";
import { Badge } from "@/components/ui/badge";
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
import type { PaginatedAuditLogs } from "@/features/approvals/types";
import { formatAuditAction } from "@/features/approvals/utils/formatters";

type AuditTrailTableProps = {
  data: PaginatedAuditLogs;
  onPageChange: (page: number) => void;
};

export function AuditTrailTable({ data, onPageChange }: AuditTrailTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Audit trail</CardTitle>
        <CardDescription>
          Organisation activity log including approvals and authentication events.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.logs.length === 0 ? (
          <p className="text-muted-foreground py-8 text-center text-sm">
            No audit entries recorded yet.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="whitespace-nowrap text-sm">
                    {new Date(log.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {formatAuditAction(log.action)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {log.entityType ?? "—"}
                    {log.entityId ? (
                      <span className="text-muted-foreground block text-xs">
                        {log.entityId}
                      </span>
                    ) : null}
                  </TableCell>
                  <TableCell className="text-muted-foreground max-w-xs truncate text-sm">
                    {log.metadata
                      ? JSON.stringify(log.metadata)
                      : log.userId ?? "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        <TablePagination
          page={data.page}
          totalPages={data.totalPages}
          total={data.total}
          limit={data.limit}
          onPageChange={onPageChange}
        />
      </CardContent>
    </Card>
  );
}
