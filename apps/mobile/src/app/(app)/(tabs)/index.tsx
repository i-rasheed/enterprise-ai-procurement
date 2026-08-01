import { StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Screen } from "@/components/ui/screen";
import { KpiCard, KpiGrid } from "@/features/dashboard/components/kpi-card";
import { useExecutiveDashboard } from "@/features/dashboard/hooks/use-dashboard";
import { useAuthStore } from "@/stores/auth-store";
import { spacing, typography } from "@/theme";
import { useAppTheme } from "@/providers/theme-provider";

function formatCurrency(value: number) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function DashboardScreen() {
  const { theme } = useAppTheme();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const organisation = useAuthStore((state) => state.organisation);
  const dashboardQuery = useExecutiveDashboard();

  return (
    <Screen
      title={`Hello, ${user?.firstName ?? "there"}`}
      description={organisation?.name ?? "Procurement overview"}
      loading={dashboardQuery.isLoading}>
      {dashboardQuery.isError ? (
        <ErrorState
          message={dashboardQuery.error.message}
          onRetry={() => dashboardQuery.refetch()}
        />
      ) : dashboardQuery.data ? (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Key metrics
          </Text>
          <KpiGrid>
            <KpiCard
              label="Open requests"
              value={dashboardQuery.data.openProcurementRequests}
            />
            <KpiCard
              label="Pending approvals"
              value={dashboardQuery.data.pendingApprovals}
            />
            <KpiCard
              label="Open POs"
              value={dashboardQuery.data.outstandingPurchaseOrders}
            />
            <KpiCard
              label="Active contracts"
              value={dashboardQuery.data.activeContracts}
            />
            <KpiCard
              label="Invoices pending"
              value={dashboardQuery.data.invoicesAwaitingApproval}
            />
            <KpiCard
              label="Total spend"
              value={formatCurrency(dashboardQuery.data.totalSpend)}
            />
          </KpiGrid>
        </View>
      ) : (
        <EmptyState
          title="No dashboard data"
          description="Connect to your organisation API to load executive metrics."
          actionLabel="View notifications"
          onAction={() => router.push("/(app)/(tabs)/notifications")}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.md,
  },
  sectionTitle: {
    ...typography.heading,
  },
});
