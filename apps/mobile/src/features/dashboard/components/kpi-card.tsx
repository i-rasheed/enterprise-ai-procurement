import { StyleSheet, Text, View } from "react-native";

import { Card } from "@/components/ui/card";
import { useAppTheme } from "@/providers/theme-provider";
import { spacing, typography } from "@/theme";

type KpiCardProps = {
  label: string;
  value: string | number;
  hint?: string;
};

export function KpiCard({ label, value, hint }: KpiCardProps) {
  const { theme } = useAppTheme();

  return (
    <Card style={styles.card}>
      <Text style={[styles.label, { color: theme.textSecondary }]}>{label}</Text>
      <Text style={[styles.value, { color: theme.text }]}>{value}</Text>
      {hint ? (
        <Text style={[styles.hint, { color: theme.textMuted }]}>{hint}</Text>
      ) : null}
    </Card>
  );
}

export function KpiGrid({ children }: { children: React.ReactNode }) {
  return <View style={styles.grid}>{children}</View>;
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  card: {
    flex: 1,
    minWidth: "47%",
  },
  label: {
    ...typography.caption,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  value: {
    fontSize: 24,
    fontWeight: "700",
    lineHeight: 30,
  },
  hint: {
    ...typography.caption,
  },
});
