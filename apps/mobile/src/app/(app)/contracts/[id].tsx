import { StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";

import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Screen } from "@/components/ui/screen";
import { StatusBadge, formatCurrency, statusTone } from "@/components/ui/section-header";
import { useContract } from "@/features/contracts/hooks/use-contracts";
import { useAppTheme } from "@/providers/theme-provider";
import { spacing, typography } from "@/theme";

export default function ContractDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme } = useAppTheme();
  const contractQuery = useContract(id);
  const contract = contractQuery.data;

  return (
    <Screen loading={contractQuery.isLoading}>
      {contractQuery.isError ? (
        <ErrorState
          message={contractQuery.error.message}
          onRetry={() => contractQuery.refetch()}
        />
      ) : !contract ? (
        <EmptyState title="Contract not found" description="This contract is unavailable." />
      ) : (
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.text }]}>{contract.contractNumber}</Text>
            <StatusBadge label={contract.status} tone={statusTone(contract.status)} />
          </View>
          <Text style={[styles.meta, { color: theme.textSecondary }]}>{contract.title}</Text>
          <Card>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Value</Text>
            <Text style={[styles.value, { color: theme.text }]}>
              {formatCurrency(contract.value, contract.currency)}
            </Text>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Term</Text>
            <Text style={[styles.value, { color: theme.text }]}>
              {new Date(contract.startDate).toLocaleDateString()} –{" "}
              {new Date(contract.endDate).toLocaleDateString()}
            </Text>
          </Card>
          <Card muted>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Description</Text>
            <Text style={[styles.item, { color: theme.textSecondary }]}>
              {contract.description}
            </Text>
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
    marginTop: spacing.xs,
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
