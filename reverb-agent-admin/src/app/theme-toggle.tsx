"use client";

import stylex from "@stylexjs/stylex";
import { useTheme } from "./theme-provider";

const styles = stylex.create({
  button: { backgroundColor: "var(--surface)", borderColor: "var(--border)", borderRadius: 8, borderStyle: "solid", borderWidth: 1, color: "var(--foreground)", cursor: "pointer", fontSize: 13, fontWeight: 700, padding: "8px 12px", transition: "all 250ms ease", ":hover": { borderColor: "#5d8de8", transform: "translateY(-1px)" }, ":focus-visible": { outline: "2px solid #8db3ff", outlineOffset: 2 } },
});

export function ThemeToggle(): React.JSX.Element {
  const { theme, toggleTheme } = useTheme();
  return <button type="button" aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`} onClick={toggleTheme} {...stylex.props(styles.button)}>{theme === "light" ? "Dark mode" : "Light mode"}</button>;
}
