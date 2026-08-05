import { StyleSheet, Text, View } from "react-native";

import { useAppTheme } from "@/providers/theme-provider";
import { radii, spacing, typography } from "@/theme";

type BadgeTone = "default" | "success" | "warning" | "danger" | "primary";

type BadgeProps = {
  label: string;
  tone?: BadgeTone;
};

export function Badge({ label, tone = "default" }: BadgeProps) {
  const { theme } = useAppTheme();

  const backgroundColor =
    tone === "success"
      ? `${theme.success}22`
      : tone === "warning"
        ? `${theme.warning}22`
        : tone === "danger"
          ? `${theme.danger}22`
          : tone === "primary"
            ? `${theme.primary}22`
            : theme.surfaceMuted;

  const color =
    tone === "success"
      ? theme.success
      : tone === "warning"
        ? theme.warning
        : tone === "danger"
          ? theme.danger
          : tone === "primary"
            ? theme.primary
            : theme.textSecondary;

  return (
    <View style={[styles.badge, { backgroundColor }]}>
      <Text style={[styles.label, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
  },
  label: {
    ...typography.caption,
    fontWeight: "600",
  },
});
