import { StyleSheet, View, type ViewProps } from "react-native";

import { useAppTheme } from "@/providers/theme-provider";
import { radii, spacing } from "@/theme";

type CardProps = ViewProps & {
  muted?: boolean;
};

export function Card({ muted = false, style, children, ...props }: CardProps) {
  const { theme } = useAppTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: muted ? theme.surfaceMuted : theme.surface,
          borderColor: theme.border,
        },
        style,
      ]}
      {...props}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: radii.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
});
