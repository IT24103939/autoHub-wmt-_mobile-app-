import React, { createContext, useMemo, useState } from "react";
import { DarkTheme, DefaultTheme, Theme } from "@react-navigation/native";

export type ThemeMode = "light" | "dark";

interface ThemePalette {
  background: string;
  card: string;
  text: string;
  mutedText: string;
  border: string;
  primary: string;
  primaryText: string;
  danger: string;
  dangerText: string;
  accentSurface: string;
}

interface ThemeContextValue {
  mode: ThemeMode;
  colors: ThemePalette;
  navigationTheme: Theme;
  toggleTheme: () => void;
}

const lightColors: ThemePalette = {
  background: "#F3F5F7",
  card: "#FFFFFF",
  text: "#111827",
  mutedText: "#475467",
  border: "#D0D7E2",
  primary: "#0A6EBD",
  primaryText: "#FFFFFF",
  danger: "#D92D20",
  dangerText: "#FFFFFF",
  accentSurface: "#E8F3FF"
};

const darkColors: ThemePalette = {
  background: "#0B0C0F",
  card: "#171A21",
  text: "#F5F7FA",
  mutedText: "#A6ADBB",
  border: "#2B3342",
  primary: "#3B8DDB",
  primaryText: "#FFFFFF",
  danger: "#EF4444",
  dangerText: "#FFFFFF",
  accentSurface: "#1D2A3A"
};

export const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>("light");

  const toggleTheme = () => {
    setMode((prev) => (prev === "light" ? "dark" : "light"));
  };

  const colors = mode === "dark" ? darkColors : lightColors;

  const navigationTheme: Theme = useMemo(() => {
    const base = mode === "dark" ? DarkTheme : DefaultTheme;

    return {
      ...base,
      colors: {
        ...base.colors,
        primary: colors.primary,
        background: colors.background,
        card: colors.card,
        text: colors.text,
        border: colors.border,
        notification: colors.primary
      }
    };
  }, [mode, colors]);

  const value = useMemo(
    () => ({ mode, colors, navigationTheme, toggleTheme }),
    [mode, colors, navigationTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
