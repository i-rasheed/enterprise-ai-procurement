import { StyleSheet, Text, View } from "react-native";

import { Badge } from "@/components/ui/badge";
import { useAppTheme } from "@/providers/theme-provider";
import { spacing, typography } from "@/theme";

type StatusBadgeProps = {
  label: string;
  tone?: "default" | "success" | "warning" | "danger" | "primary";
};

export function StatusBadge({ label, tone = "default" }: StatusBadgeProps) {
  return <Badge label={label.replaceAll("_", " ")} tone={tone} />;
}

type SectionHeaderProps = {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function SectionHeader({ title, actionLabel, onAction }: SectionHeaderProps) {
  const { theme } = useAppTheme();

  return (
    <View style={styles.header}>
      <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
      {actionLabel && onAction ? (
        <Text style={[styles.action, { color: theme.primary }]} onPress={onAction}>
          {actionLabel}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.heading,
  },
  action: {
    ...typography.label,
  },
});

export function statusTone(
  status: string,
): "default" | "success" | "warning" | "danger" | "primary" {
  const normalized = status.toUpperCase();

  if (["APPROVED", "ACTIVE", "COMPLETED", "PAID", "MATCHED", "ACKNOWLEDGED"].includes(normalized)) {
    return "success";
  }

  if (["PENDING", "SUBMITTED", "ISSUED", "UNDER_REVIEW", "DRAFT"].includes(normalized)) {
    return "warning";
  }

  if (["REJECTED", "CANCELLED", "TERMINATED", "EXPIRED", "FAILED"].includes(normalized)) {
    return "danger";
  }

  return "primary";
}

export function formatCurrency(amount: number, currency = "USD") {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}
