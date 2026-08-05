import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { useColorScheme } from "react-native";

import { getTheme, type AppTheme } from "@/theme";

type ThemeContextValue = {
  theme: AppTheme;
  colorScheme: "light" | "dark";
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const scheme = useColorScheme();
  const colorScheme: "light" | "dark" = scheme === "dark" ? "dark" : "light";
  const value = useMemo(
    () => ({
      theme: getTheme(colorScheme),
      colorScheme,
    }),
    [colorScheme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useAppTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useAppTheme must be used within ThemeProvider");
  }

  return context;
}
