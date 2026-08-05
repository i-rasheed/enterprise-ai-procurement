import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";

import { useAppTheme } from "@/providers/theme-provider";
import { radii, spacing, typography } from "@/theme";

type InputProps = TextInputProps & {
  label?: string;
  error?: string;
};

export function Input({ label, error, style, ...props }: InputProps) {
  const { theme } = useAppTheme();

  return (
    <View style={styles.wrapper}>
      {label ? (
        <Text style={[styles.label, { color: theme.text }]}>{label}</Text>
      ) : null}
      <TextInput
        placeholderTextColor={theme.textMuted}
        style={[
          styles.input,
          {
            backgroundColor: theme.surface,
            borderColor: error ? theme.danger : theme.border,
            color: theme.text,
          },
          style,
        ]}
        {...props}
      />
      {error ? (
        <Text style={[styles.error, { color: theme.danger }]}>{error}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.xs,
  },
  label: {
    ...typography.label,
  },
  input: {
    ...typography.body,
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    minHeight: 48,
  },
  error: {
    ...typography.caption,
  },
});
