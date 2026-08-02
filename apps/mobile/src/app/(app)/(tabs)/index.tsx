import { StyleSheet, View , Text, Pressable } from "react-native";
import { useRouter } from "expo-router";

import { Card } from "@/components/ui/card";
import { Screen } from "@/components/ui/screen";
import { KpiCard, KpiGrid } from "@/features/dashboard/components/kpi-card";
import { useExecutiveDashboard } from "@/features/dashboard/hooks/use-dashboard";
import { useAuthStore } from "@/stores/auth-store";
import { spacing, typography } from "@/theme";
import { useAppTheme } from "@/providers/theme-provider";
import { ErrorState } from "@/components/ui/error-state";
import { formatCurrency } from "@/components/ui/section-header";

const quickLinks = [
  { label: "Approvals", href: "/(app)/(tabs)/approvals", icon: "✓" },
  { label: "Purchase Orders", href: "/purchase-orders", icon: "📦" },
  { label: "Invoices", href: "/invoices", icon: "🧾" },
  { label: "Contracts", href: "/contracts", icon: "📄" },
  { label: "Vendor Portal", href: "/vendor", icon: "🏢" },
  { label: "AI Assistant", href: "/(app)/(tabs)/ai", icon: "✨" },
] as const;

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
      ) : (
        <View style={styles.content}>
          {dashboardQuery.data ? (
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
          ) : null}

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Quick access
            </Text>
            <View style={styles.grid}>
              {quickLinks.map((link) => (
                <Pressable
                  key={link.href}
                  onPress={() => router.push(link.href)}
                  style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1, width: "47%" }]}>
                  <Card muted>
                    <Text style={styles.linkIcon}>{link.icon}</Text>
                    <Text style={[styles.linkLabel, { color: theme.text }]}>
                      {link.label}
                    </Text>
                  </Card>
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.lg,
  },
  section: {
    gap: spacing.md,
  },
  sectionTitle: {
    ...typography.heading,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  linkIcon: {
    fontSize: 24,
  },
  linkLabel: {
    ...typography.label,
  },
});
