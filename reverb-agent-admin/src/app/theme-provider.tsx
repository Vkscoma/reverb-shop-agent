"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type Theme = "light" | "dark";
type ThemeContextValue = { theme: Theme; toggleTheme: () => void };

const ThemeContext = createContext<ThemeContextValue | null>(null);
const preferenceKey = "reverb-agent-theme";

function systemTheme(): Theme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const savedTheme = window.localStorage.getItem(preferenceKey);
    const nextTheme: Theme = savedTheme === "dark" || savedTheme === "light" ? savedTheme : systemTheme();
    // The preference is external browser state; synchronize it once on mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(nextTheme);
    document.documentElement.dataset.theme = nextTheme;
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  function toggleTheme(): void {
    const nextTheme: Theme = theme === "light" ? "dark" : "light";
    window.localStorage.setItem(preferenceKey, nextTheme);
    setTheme(nextTheme);
  }

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
}
