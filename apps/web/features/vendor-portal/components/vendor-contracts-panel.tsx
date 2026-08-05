"use client";

import Link from "next/link";

import { EmptyState } from "@/components/shared/empty-state";
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
import { formatCurrency } from "@/features/dashboard/utils/formatters";
import { useVendorContracts } from "@/features/vendor-portal/hooks/use-vendor-portal";
import { useVendorContextStore } from "@/features/vendor-portal/stores/vendor-context-store";

export function VendorContractsPanel() {
  const vendor = useVendorContextStore((state) => state.vendor);
  const contractsQuery = useVendorContracts(vendor?.id);
  const contracts = contractsQuery.data?.contracts ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contracts</CardTitle>
        <CardDescription>
          View agreements linked to your vendor profile.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {contractsQuery.isLoading ? (
          <p className="text-muted-foreground text-sm">Loading contracts...</p>
        ) : contracts.length === 0 ? (
          <EmptyState
            title="No contracts"
            description="Active and historical contracts will appear here."
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contract</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>End date</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contracts.map((contract) => (
                <TableRow key={contract.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{contract.title}</p>
                      <p className="text-muted-foreground text-xs">
                        {contract.contractNumber}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <ContractStatusBadge status={contract.status} />
                  </TableCell>
                  <TableCell>{formatCurrency(contract.value)}</TableCell>
                  <TableCell className="text-sm">
                    {new Date(contract.endDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link
                      href={`/vendor/contracts/${contract.id}`}
                      className="text-primary text-sm font-medium hover:underline"
                    >
                      View
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
