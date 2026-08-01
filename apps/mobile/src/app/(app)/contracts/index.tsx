import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";

import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { ListRow } from "@/components/ui/list-row";
import { Screen } from "@/components/ui/screen";
import { StatusBadge, formatCurrency, statusTone } from "@/components/ui/section-header";
import { useContracts } from "@/features/contracts/hooks/use-contracts";
import { spacing } from "@/theme";

export default function ContractsScreen() {
  const router = useRouter();
  const contractsQuery = useContracts();

  return (
    <Screen loading={contractsQuery.isLoading}>
      {contractsQuery.isError ? (
        <ErrorState
          message={contractsQuery.error.message}
          onRetry={() => contractsQuery.refetch()}
        />
      ) : contractsQuery.data?.length ? (
        <View style={styles.list}>
          {contractsQuery.data.map((contract) => (
            <ListRow
              key={contract.id}
              title={contract.contractNumber}
              subtitle={contract.title}
              meta={formatCurrency(contract.value, contract.currency)}
              trailing={
                <StatusBadge label={contract.status} tone={statusTone(contract.status)} />
              }
              onPress={() =>
                router.push({
                  pathname: "/contracts/[id]",
                  params: { id: contract.id },
                })
              }
            />
          ))}
        </View>
      ) : (
        <EmptyState title="No contracts" description="Active contracts will appear here." />
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
