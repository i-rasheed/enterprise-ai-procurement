"use client";

import Link from "next/link";
import { AlertTriangle, Eye, Pencil, Trash2 } from "lucide-react";

import { TablePagination } from "@/components/shared/table-pagination";
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
import { ContractStatusBadge } from "@/features/contracts/components/contract-status-badge";
import {
  canDeleteContract,
  formatContractType,
  getDaysUntilExpiry,
  isExpiringSoon,
  isPastEndDate,
} from "@/features/contracts/config/permissions";
import type { Contract, PaginatedContracts } from "@/features/contracts/types";

type ContractsTableProps = {
  data: PaginatedContracts;
  canManage: boolean;
  onPageChange: (page: number) => void;
  onDelete?: (id: string, contractNumber: string) => void;
};

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
  }).format(amount);
}

function ExpiryCell({ contract }: { contract: Contract }) {
  const days = getDaysUntilExpiry(contract.endDate);
  const expiringSoon = isExpiringSoon(contract);
  const pastEnd = isPastEndDate(contract);

  if (contract.status === "EXPIRED" || contract.status === "TERMINATED") {
    return (
      <span className="text-muted-foreground">
        {new Date(contract.endDate).toLocaleDateString()}
      </span>
    );
  }

  if (pastEnd && contract.status === "ACTIVE") {
    return (
      <span className="text-destructive flex items-center gap-1 text-sm">
        <AlertTriangle className="size-3.5" />
        Past end date
      </span>
    );
  }

  if (expiringSoon) {
    return (
      <span className="flex items-center gap-1 text-sm text-amber-600">
        <AlertTriangle className="size-3.5" />
        {days} day{days === 1 ? "" : "s"} left
      </span>
    );
  }

  return (
    <span>{new Date(contract.endDate).toLocaleDateString()}</span>
  );
}

export function ContractsTable({
  data,
  canManage,
  onPageChange,
  onDelete,
}: ContractsTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Contracts</CardTitle>
        <CardDescription>
          {data.total} contract{data.total === 1 ? "" : "s"} found
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Contract #</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Expiry</TableHead>
              <TableHead>Value</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.contracts.map((contract) => (
              <TableRow key={contract.id}>
                <TableCell className="font-mono text-sm">
                  {contract.contractNumber}
                </TableCell>
                <TableCell className="max-w-[180px] truncate font-medium">
                  <Link
                    href={`/dashboard/contracts/${contract.id}`}
                    className="hover:underline"
                  >
                    {contract.title}
                  </Link>
                </TableCell>
                <TableCell className="max-w-[140px] truncate">
                  {contract.vendor.name}
                </TableCell>
                <TableCell>{formatContractType(contract.contractType)}</TableCell>
                <TableCell>
                  <ContractStatusBadge status={contract.status} />
                </TableCell>
                <TableCell>
                  <ExpiryCell contract={contract} />
                </TableCell>
                <TableCell>
                  {formatCurrency(contract.value, contract.currency)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/dashboard/contracts/${contract.id}`}>
                        <Eye className="size-4" />
                        View
                      </Link>
                    </Button>
                    {canManage &&
                    (contract.status === "DRAFT" ||
                      contract.status === "UNDER_REVIEW") ? (
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/dashboard/contracts/${contract.id}/edit`}>
                          <Pencil className="size-4" />
                          Edit
                        </Link>
                      </Button>
                    ) : null}
                    {canManage &&
                    onDelete &&
                    canDeleteContract(contract) ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          onDelete(contract.id, contract.contractNumber)
                        }
                      >
                        <Trash2 className="size-4" />
                        Delete
                      </Button>
                    ) : null}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

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
