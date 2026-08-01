import { StyleSheet, Text, View } from "react-native";

import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { ListRow } from "@/components/ui/list-row";
import { Screen } from "@/components/ui/screen";
import { SectionHeader, formatCurrency, StatusBadge, statusTone } from "@/components/ui/section-header";
import {
  useVendorAccount,
  useVendorBids,
  useVendorContracts,
  useVendorInvoices,
  useVendorPurchaseOrders,
  useVendorRfqs,
} from "@/features/vendor-portal/hooks/use-vendor-portal";
import { useVendorPortalStore } from "@/features/vendor-portal/stores/vendor-portal-store";
import { useAppTheme } from "@/providers/theme-provider";
import { spacing, typography } from "@/theme";

export default function VendorPortalScreen() {
  const { theme } = useAppTheme();
  const vendor = useVendorPortalStore((state) => state.vendor);
  const accountQuery = useVendorAccount();
  const resolvedVendor = accountQuery.data ?? vendor;
  const vendorId = resolvedVendor?.id;

  const rfqsQuery = useVendorRfqs(vendorId);
  const bidsQuery = useVendorBids(vendorId);
  const posQuery = useVendorPurchaseOrders(vendorId);
  const invoicesQuery = useVendorInvoices(vendorId);
  const contractsQuery = useVendorContracts(vendorId);

  const loading =
    accountQuery.isLoading ||
    rfqsQuery.isLoading ||
    bidsQuery.isLoading ||
    posQuery.isLoading;

  return (
    <Screen loading={loading}>
      {accountQuery.isError ? (
        <ErrorState
          message={accountQuery.error.message}
          onRetry={() => accountQuery.refetch()}
        />
      ) : !resolvedVendor ? (
        <EmptyState
          title="Vendor profile not found"
          description="Your login email must match a vendor record to access the vendor portal."
        />
      ) : (
        <View style={styles.content}>
          <Card>
            <Text style={[styles.vendorName, { color: theme.text }]}>
              {resolvedVendor.name}
            </Text>
            <Text style={[styles.vendorEmail, { color: theme.textSecondary }]}>
              {resolvedVendor.email}
            </Text>
          </Card>

          <SectionHeader title="Invited RFQs" />
          <View style={styles.list}>
            {(rfqsQuery.data ?? []).slice(0, 5).map((rfq) => (
              <ListRow
                key={rfq.id}
                title={rfq.rfqNumber}
                subtitle={rfq.title}
                meta={new Date(rfq.closingDate).toLocaleDateString()}
                trailing={<StatusBadge label={rfq.status} tone={statusTone(rfq.status)} />}
              />
            ))}
          </View>

          <SectionHeader title="Bids" />
          <View style={styles.list}>
            {(bidsQuery.data ?? []).slice(0, 5).map((bid) => (
              <ListRow
                key={bid.id}
                title={bid.bidNumber}
                subtitle={bid.rfq.title}
                meta={formatCurrency(bid.totalAmount)}
                trailing={<StatusBadge label={bid.status} tone={statusTone(bid.status)} />}
              />
            ))}
          </View>

          <SectionHeader title="Purchase Orders" />
          <View style={styles.list}>
            {(posQuery.data ?? []).slice(0, 5).map((po) => (
              <ListRow
                key={po.id}
                title={po.poNumber}
                subtitle={po.vendor.name}
                meta={formatCurrency(po.totalAmount, po.currency)}
                trailing={<StatusBadge label={po.status} tone={statusTone(po.status)} />}
              />
            ))}
          </View>

          <SectionHeader title="Invoices" />
          <View style={styles.list}>
            {(invoicesQuery.data ?? []).slice(0, 5).map((invoice) => (
              <ListRow
                key={invoice.id}
                title={invoice.invoiceNumber}
                subtitle={invoice.vendor.name}
                meta={formatCurrency(invoice.totalAmount, invoice.currency)}
                trailing={
                  <StatusBadge label={invoice.status} tone={statusTone(invoice.status)} />
                }
              />
            ))}
          </View>

          <SectionHeader title="Contracts" />
          <View style={styles.list}>
            {(contractsQuery.data ?? []).slice(0, 5).map((contract) => (
              <ListRow
                key={contract.id}
                title={contract.contractNumber}
                subtitle={contract.title}
                meta={formatCurrency(contract.value, contract.currency)}
                trailing={
                  <StatusBadge label={contract.status} tone={statusTone(contract.status)} />
                }
              />
            ))}
          </View>
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
  vendorName: {
    ...typography.heading,
  },
  vendorEmail: {
    ...typography.body,
  },
  list: {
    gap: spacing.sm,
  },
});
