import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
  type TextStyle,
  type ViewStyle,
} from "react-native";

import { useAppTheme } from "@/providers/theme-provider";
import { radii, spacing, typography } from "@/theme";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = PressableProps & {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
};

export function Button({
  label,
  variant = "primary",
  size = "md",
  loading = false,
  fullWidth = false,
  disabled,
  style,
  ...props
}: ButtonProps) {
  const { theme } = useAppTheme();
  const isDisabled = disabled || loading;

  const containerStyle: ViewStyle = {
    backgroundColor:
      variant === "primary"
        ? theme.primary
        : variant === "secondary"
          ? theme.surfaceMuted
          : variant === "danger"
            ? theme.danger
            : "transparent",
    borderColor: variant === "ghost" ? theme.border : "transparent",
    borderWidth: variant === "ghost" ? 1 : 0,
    opacity: isDisabled ? 0.6 : 1,
    alignSelf: fullWidth ? "stretch" : "auto",
    paddingVertical: size === "sm" ? spacing.sm : size === "lg" ? spacing.md : 12,
    paddingHorizontal: size === "sm" ? spacing.md : spacing.lg,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
    minHeight: size === "lg" ? 52 : 44,
  };

  const labelStyle: TextStyle = {
    ...typography.label,
    color:
      variant === "primary" || variant === "danger"
        ? theme.primaryForeground
        : theme.text,
  };

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      style={({ pressed }) => [
        containerStyle,
        pressed && !isDisabled ? styles.pressed : null,
        style as ViewStyle,
      ]}
      {...props}>
      {loading ? (
        <ActivityIndicator
          color={
            variant === "primary" || variant === "danger"
              ? theme.primaryForeground
              : theme.primary
          }
        />
      ) : (
        <Text style={labelStyle}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.85,
  },
});
