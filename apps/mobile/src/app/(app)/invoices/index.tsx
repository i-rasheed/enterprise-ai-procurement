import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";

import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { ListRow } from "@/components/ui/list-row";
import { Screen } from "@/components/ui/screen";
import { StatusBadge, formatCurrency, statusTone } from "@/components/ui/section-header";
import { useInvoices } from "@/features/invoices/hooks/use-invoices";
import { spacing } from "@/theme";

export default function InvoicesScreen() {
  const router = useRouter();
  const invoicesQuery = useInvoices();

  return (
    <Screen loading={invoicesQuery.isLoading}>
      {invoicesQuery.isError ? (
        <ErrorState
          message={invoicesQuery.error.message}
          onRetry={() => invoicesQuery.refetch()}
        />
      ) : invoicesQuery.data?.length ? (
        <View style={styles.list}>
          {invoicesQuery.data.map((invoice) => (
            <ListRow
              key={invoice.id}
              title={invoice.invoiceNumber}
              subtitle={invoice.vendor.name}
              meta={formatCurrency(invoice.totalAmount, invoice.currency)}
              trailing={
                <StatusBadge label={invoice.status} tone={statusTone(invoice.status)} />
              }
              onPress={() =>
                router.push({
                  pathname: "/invoices/[id]",
                  params: { id: invoice.id },
                })
              }
            />
          ))}
        </View>
      ) : (
        <EmptyState title="No invoices" description="Submitted invoices will appear here." />
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
