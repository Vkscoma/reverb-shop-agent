"use client";

import { useState } from "react";
import Link from "next/link";
import stylex from "@stylexjs/stylex";
import { ThemeToggle } from "./theme-toggle";

const styles = stylex.create({
  header: { backgroundColor: "var(--surface)", borderBottomColor: "var(--border)", borderBottomStyle: "solid", borderBottomWidth: 1 },
  nav: { margin: "0 auto", maxWidth: 1120, padding: "16px 24px", position: "relative", "@media (max-width: 700px)": { padding: "14px 16px" } },
  topRow: { alignItems: "center", display: "flex", justifyContent: "space-between", width: "100%" },
  brand: { color: "var(--foreground)", fontSize: 15, fontWeight: 800, textDecoration: "none" },
  actions: { alignItems: "center", display: "flex", gap: 10 },
  menuButton: { alignItems: "center", backgroundColor: "var(--surface)", borderColor: "var(--border)", borderRadius: 8, borderStyle: "solid", borderWidth: 1, cursor: "pointer", display: "flex", height: 42, justifyContent: "center", padding: 0, transition: "all 250ms ease", width: 42, ":hover": { borderColor: "#5d8de8", transform: "translateY(-1px)" }, ":focus-visible": { outline: "2px solid #8db3ff", outlineOffset: 2 } },
  menuIcon: { display: "flex", flexDirection: "column", gap: 4, justifyContent: "center" },
  menuBar: { backgroundColor: "var(--foreground)", borderRadius: 99, display: "block", height: 2, width: 20 },
  links: { backgroundColor: "var(--surface)", borderColor: "var(--border)", borderRadius: 10, borderStyle: "solid", borderWidth: 1, boxShadow: "0 12px 28px rgba(0,0,0,0.22)", display: "grid", gap: 4, padding: 8, position: "absolute", right: 24, top: "calc(100% - 4px)", width: 240, zIndex: 10, "@media (max-width: 700px)": { left: 16, right: 16, top: "calc(100% - 4px)", width: "auto" } },
  link: { borderRadius: 7, color: "var(--foreground)", fontSize: 14, fontWeight: 700, padding: "11px 12px", textDecoration: "none", transition: "all 250ms ease", ":hover": { backgroundColor: "var(--line)", color: "var(--foreground)" } },
});

export function DashboardNav(): React.JSX.Element {
  const [open, setOpen] = useState<boolean>(false);
  const close = (): void => setOpen(false);
  return <header {...stylex.props(styles.header)}><nav aria-label="Primary navigation" {...stylex.props(styles.nav)}><div {...stylex.props(styles.topRow)}><Link href="/" onClick={close} {...stylex.props(styles.brand)}>Reverb Agent Admin</Link><div {...stylex.props(styles.actions)}><ThemeToggle /><button type="button" aria-label={open ? "Close navigation menu" : "Open navigation menu"} aria-expanded={open} onClick={() => setOpen((current) => !current)} {...stylex.props(styles.menuButton)}>{open ? "×" : <span aria-hidden="true" {...stylex.props(styles.menuIcon)}><span {...stylex.props(styles.menuBar)} /><span {...stylex.props(styles.menuBar)} /><span {...stylex.props(styles.menuBar)} /></span>}</button></div></div>{open ? <div {...stylex.props(styles.links)}><Link href="/listings" onClick={close} {...stylex.props(styles.link)}>Listings</Link><Link href="/rules" onClick={close} {...stylex.props(styles.link)}>Rules</Link><Link href="/offers" onClick={close} {...stylex.props(styles.link)}>Offers</Link><Link href="/escalations" onClick={close} {...stylex.props(styles.link)}>Escalations</Link></div> : null}</nav></header>;
}
