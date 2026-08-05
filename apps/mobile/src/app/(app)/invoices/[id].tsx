import { StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";

import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Screen } from "@/components/ui/screen";
import { StatusBadge, formatCurrency, statusTone } from "@/components/ui/section-header";
import { useInvoice } from "@/features/invoices/hooks/use-invoices";
import { useAppTheme } from "@/providers/theme-provider";
import { spacing, typography } from "@/theme";

export default function InvoiceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme } = useAppTheme();
  const invoiceQuery = useInvoice(id);
  const invoice = invoiceQuery.data;

  return (
    <Screen loading={invoiceQuery.isLoading}>
      {invoiceQuery.isError ? (
        <ErrorState
          message={invoiceQuery.error.message}
          onRetry={() => invoiceQuery.refetch()}
        />
      ) : !invoice ? (
        <EmptyState title="Invoice not found" description="This invoice is unavailable." />
      ) : (
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.text }]}>{invoice.invoiceNumber}</Text>
            <StatusBadge label={invoice.status} tone={statusTone(invoice.status)} />
          </View>
          <Text style={[styles.meta, { color: theme.textSecondary }]}>
            {invoice.vendor.name} · Due {new Date(invoice.dueDate).toLocaleDateString()}
          </Text>
          <Card>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Total</Text>
            <Text style={[styles.value, { color: theme.text }]}>
              {formatCurrency(invoice.totalAmount, invoice.currency)}
            </Text>
          </Card>
          <Card muted>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Line items</Text>
            {invoice.items.map((item) => (
              <Text key={item.id} style={[styles.item, { color: theme.textSecondary }]}>
                {item.description} · {formatCurrency(item.totalPrice, invoice.currency)}
              </Text>
            ))}
          </Card>
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
