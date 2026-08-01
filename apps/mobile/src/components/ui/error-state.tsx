import { StyleSheet, Text, View } from "react-native";

import { Button } from "@/components/ui/button";
import { useAppTheme } from "@/providers/theme-provider";
import { spacing, typography } from "@/theme";

type ErrorStateProps = {
  message: string;
  onRetry?: () => void;
};

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  const { theme } = useAppTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.message, { color: theme.danger }]}>{message}</Text>
      {onRetry ? <Button label="Try again" variant="secondary" onPress={onRetry} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.xl,
  },
  message: {
    ...typography.body,
    textAlign: "center",
  },
});
