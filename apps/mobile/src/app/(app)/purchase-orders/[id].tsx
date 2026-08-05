import { StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Screen } from "@/components/ui/screen";
import { StatusBadge, formatCurrency, statusTone } from "@/components/ui/section-header";
import {
  useAcknowledgePurchaseOrder,
  usePurchaseOrder,
} from "@/features/purchase-orders/hooks/use-purchase-orders";
import { useAppTheme } from "@/providers/theme-provider";
import { spacing, typography } from "@/theme";

export default function PurchaseOrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme } = useAppTheme();
  const poQuery = usePurchaseOrder(id);
  const acknowledge = useAcknowledgePurchaseOrder();
  const po = poQuery.data;

  return (
    <Screen loading={poQuery.isLoading}>
      {poQuery.isError ? (
        <ErrorState message={poQuery.error.message} onRetry={() => poQuery.refetch()} />
      ) : !po ? (
        <EmptyState title="Purchase order not found" description="This PO is unavailable." />
      ) : (
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.text }]}>{po.poNumber}</Text>
            <StatusBadge label={po.status} tone={statusTone(po.status)} />
          </View>
          <Text style={[styles.meta, { color: theme.textSecondary }]}>
            {po.vendor.name} · {formatCurrency(po.totalAmount, po.currency)}
          </Text>

          <Card>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Expected delivery</Text>
            <Text style={[styles.value, { color: theme.text }]}>
              {new Date(po.expectedDeliveryDate).toLocaleDateString()}
            </Text>
          </Card>

          <Card muted>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Line items</Text>
            {po.items.map((item) => (
              <Text key={item.id} style={[styles.item, { color: theme.textSecondary }]}>
                {item.description} · {item.quantity} × {formatCurrency(item.unitPrice, po.currency)}
              </Text>
            ))}
          </Card>

          {po.status === "ISSUED" ? (
            <Button
              label="Acknowledge PO"
              fullWidth
              loading={acknowledge.isPending}
              onPress={() =>
                acknowledge.mutate({
                  id: po.id,
                  notes: "Acknowledged via mobile app",
                })
              }
            />
          ) : null}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.md,
    paddingHorizontal: spacing.md,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  title: {
    ...typography.heading,
    flex: 1,
  },
  meta: {
    ...typography.body,
  },
  label: {
    ...typography.caption,
  },
  value: {
    ...typography.bodyMedium,
  },
  sectionTitle: {
    ...typography.label,
    marginBottom: spacing.xs,
  },
  item: {
    ...typography.body,
  },
});
