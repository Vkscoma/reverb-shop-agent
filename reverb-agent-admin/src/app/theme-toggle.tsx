"use client";

import stylex from "@stylexjs/stylex";
import { useTheme } from "./theme-provider";

const styles = stylex.create({
  button: { backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--foreground)", cursor: "pointer", fontSize: 13, fontWeight: 700, padding: "8px 12px" },
});

export function ThemeToggle(): React.JSX.Element {
  const { theme, toggleTheme } = useTheme();
  return <button type="button" aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`} onClick={toggleTheme} {...stylex.props(styles.button)}>{theme === "light" ? "Dark mode" : "Light mode"}</button>;
}
