import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";

import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { ListRow } from "@/components/ui/list-row";
import { Screen } from "@/components/ui/screen";
import { StatusBadge, formatCurrency, statusTone } from "@/components/ui/section-header";
import { usePurchaseOrders } from "@/features/purchase-orders/hooks/use-purchase-orders";
import { spacing } from "@/theme";

export default function PurchaseOrdersScreen() {
  const router = useRouter();
  const purchaseOrdersQuery = usePurchaseOrders();

  return (
    <Screen loading={purchaseOrdersQuery.isLoading}>
      {purchaseOrdersQuery.isError ? (
        <ErrorState
          message={purchaseOrdersQuery.error.message}
          onRetry={() => purchaseOrdersQuery.refetch()}
        />
      ) : purchaseOrdersQuery.data?.length ? (
        <View style={styles.list}>
          {purchaseOrdersQuery.data.map((po) => (
            <ListRow
              key={po.id}
              title={po.poNumber}
              subtitle={po.vendor.name}
              meta={formatCurrency(po.totalAmount, po.currency)}
              trailing={<StatusBadge label={po.status} tone={statusTone(po.status)} />}
              onPress={() =>
                router.push({
                  pathname: "/purchase-orders/[id]",
                  params: { id: po.id },
                })
              }
            />
          ))}
        </View>
      ) : (
        <EmptyState
          title="No purchase orders"
          description="Issued purchase orders will appear here."
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
  },
});
