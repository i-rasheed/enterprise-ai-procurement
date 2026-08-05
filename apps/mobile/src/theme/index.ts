export const palette = {
  primary: "#2563EB",
  primaryDark: "#1D4ED8",
  primaryLight: "#DBEAFE",
  success: "#16A34A",
  warning: "#D97706",
  danger: "#DC2626",
  white: "#FFFFFF",
  black: "#0F172A",
} as const;

export const lightTheme = {
  mode: "light" as const,
  background: "#F8FAFC",
  surface: "#FFFFFF",
  surfaceMuted: "#F1F5F9",
  border: "#E2E8F0",
  text: "#0F172A",
  textSecondary: "#64748B",
  textMuted: "#94A3B8",
  primary: palette.primary,
  primaryForeground: palette.white,
  primaryMuted: "#DBEAFE",
  success: palette.success,
  warning: palette.warning,
  danger: palette.danger,
  tabBar: "#FFFFFF",
  tabBarBorder: "#E2E8F0",
  overlay: "rgba(15, 23, 42, 0.45)",
};

export const darkTheme = {
  mode: "dark" as const,
  background: "#0B1220",
  surface: "#111827",
  surfaceMuted: "#1F2937",
  border: "#334155",
  text: "#F8FAFC",
  textSecondary: "#CBD5E1",
  textMuted: "#94A3B8",
  primary: "#3B82F6",
  primaryForeground: palette.white,
  primaryMuted: "#1E3A5F",
  success: "#22C55E",
  warning: "#F59E0B",
  danger: "#F87171",
  tabBar: "#111827",
  tabBarBorder: "#334155",
  overlay: "rgba(0, 0, 0, 0.55)",
};

export type AppTheme = typeof lightTheme | typeof darkTheme;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  pill: 999,
} as const;

export const typography = {
  title: { fontSize: 28, fontWeight: "700" as const, lineHeight: 34 },
  heading: { fontSize: 20, fontWeight: "600" as const, lineHeight: 26 },
  body: { fontSize: 16, fontWeight: "400" as const, lineHeight: 24 },
  bodyMedium: { fontSize: 16, fontWeight: "500" as const, lineHeight: 24 },
  caption: { fontSize: 13, fontWeight: "400" as const, lineHeight: 18 },
  label: { fontSize: 14, fontWeight: "600" as const, lineHeight: 20 },
} as const;

export function getTheme(scheme: "light" | "dark" | null | undefined): AppTheme {
  return scheme === "dark" ? darkTheme : lightTheme;
}
