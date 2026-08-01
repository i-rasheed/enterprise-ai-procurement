import { Pressable, StyleSheet, Text, View } from "react-native";

import { useAppTheme } from "@/providers/theme-provider";
import { radii, spacing, typography } from "@/theme";

type ListRowProps = {
  title: string;
  subtitle?: string;
  meta?: string;
  onPress?: () => void;
  trailing?: React.ReactNode;
};

export function ListRow({
  title,
  subtitle,
  meta,
  onPress,
  trailing,
}: ListRowProps) {
  const { theme } = useAppTheme();

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: theme.surface,
          borderColor: theme.border,
          opacity: pressed ? 0.85 : 1,
        },
      ]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text
            style={[styles.subtitle, { color: theme.textSecondary }]}
            numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}
        {meta ? (
          <Text style={[styles.meta, { color: theme.textMuted }]}>{meta}</Text>
        ) : null}
      </View>
      {trailing}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  content: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    ...typography.label,
  },
  subtitle: {
    ...typography.body,
  },
  meta: {
    ...typography.caption,
  },
});
