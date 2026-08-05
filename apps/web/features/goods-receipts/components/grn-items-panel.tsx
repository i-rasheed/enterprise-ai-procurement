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
import { getRemainingQuantity } from "@/features/goods-receipts/config/permissions";
import type { GoodsReceipt } from "@/features/goods-receipts/types";

type GrnItemsPanelProps = {
  grn: GoodsReceipt;
};

export function GrnItemsPanel({ grn }: GrnItemsPanelProps) {
  const totalOrdered = grn.items.reduce(
    (sum, item) => sum + item.quantityOrdered,
    0,
  );
  const totalReceived = grn.items.reduce(
    (sum, item) => sum + item.quantityReceived,
    0,
  );
  const totalRejected = grn.items.reduce(
    (sum, item) => sum + item.quantityRejected,
    0,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Line items</CardTitle>
        <CardDescription>
          {totalReceived} received · {totalRejected} rejected ·{" "}
          {totalOrdered - totalReceived - totalRejected} remaining of{" "}
          {totalOrdered} ordered
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>PO item</TableHead>
              <TableHead className="text-right">Ordered</TableHead>
              <TableHead className="text-right">Received</TableHead>
              <TableHead className="text-right">Rejected</TableHead>
              <TableHead className="text-right">Remaining</TableHead>
              <TableHead>Remarks</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {grn.items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-mono text-xs">
                  {item.purchaseOrderItemId.slice(0, 12)}…
                </TableCell>
                <TableCell className="text-right">{item.quantityOrdered}</TableCell>
                <TableCell className="text-right text-emerald-600">
                  {item.quantityReceived}
                </TableCell>
                <TableCell className="text-right text-destructive">
                  {item.quantityRejected}
                </TableCell>
                <TableCell className="text-right">
                  {getRemainingQuantity(item)}
                </TableCell>
                <TableCell className="max-w-[200px] truncate text-sm">
                  {item.remarks ?? "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
