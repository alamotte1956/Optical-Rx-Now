import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme } from "react-native";

export type ThemeMode = "light" | "dark" | "auto";

const THEME_STORAGE_KEY = "@optical_rx_theme";

export const lightTheme = {
  background: "#f8fafc",
  surface: "#ffffff",
  surfaceSecondary: "#f1f5f9",
  text: "#1a202c",
  textSecondary: "#4a5568",
  textMuted: "#718096",
  primary: "#4a9eff",
  primaryLight: "rgba(74, 158, 255, 0.1)",
  border: "#e2e8f0",
  danger: "#e53e3e",
  success: "#38a169",
  warning: "#dd6b20",
  card: "#ffffff",
  tabBar: "#ffffff",
  tabBarBorder: "#e2e8f0",
  statusBar: "dark" as "light" | "dark",
};

export const darkTheme = {
  background: "#0a1628",
  surface: "#1a2d45",
  surfaceSecondary: "#0f1d30",
  text: "#ffffff",
  textSecondary: "#c0c8d0",
  textMuted: "#6b7c8f",
  primary: "#4a9eff",
  primaryLight: "rgba(74, 158, 255, 0.15)",
  border: "#1a2d45",
  danger: "#ff5c5c",
  success: "#4CAF50",
  warning: "#FF9800",
  card: "#1a2d45",
  tabBar: "#0f1d30",
  tabBarBorder: "#1a2d45",
  statusBar: "light" as "light" | "dark",
};

export type Theme = typeof darkTheme;

interface ThemeContextType {
  mode: ThemeMode;
  theme: Theme;
  isDark: boolean;
  setMode: (mode: ThemeMode) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType>({
  mode: "dark",
  theme: darkTheme,
  isDark: true,
  setMode: async () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>("dark");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const saved = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (saved === "light" || saved === "dark" || saved === "auto") {
        setModeState(saved);
      }
    } catch (e) {
      console.log("Error loading theme:", e);
    } finally {
      setLoaded(true);
    }
  };

  const setMode = async (newMode: ThemeMode) => {
    setModeState(newMode);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newMode);
    } catch (e) {
      console.log("Error saving theme:", e);
    }
  };

  const isDark = mode === "dark" || (mode === "auto" && systemScheme === "dark");
  const theme = isDark ? darkTheme : lightTheme;

  if (!loaded) return null;

  return (
    <ThemeContext.Provider value={{ mode, theme, isDark, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
