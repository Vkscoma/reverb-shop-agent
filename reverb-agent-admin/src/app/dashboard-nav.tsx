"use client";

import { useState } from "react";
import Link from "next/link";
import stylex from "@stylexjs/stylex";
import { ThemeToggle } from "./theme-toggle";

const styles = stylex.create({
  header: { backgroundColor: "var(--surface)", borderBottomColor: "var(--border)", borderBottomStyle: "solid", borderBottomWidth: 1 },
  nav: { alignItems: "center", display: "flex", gap: 20, justifyContent: "space-between", margin: "0 auto", maxWidth: 1120, padding: "16px 24px", "@media (max-width: 700px)": { alignItems: "stretch", flexDirection: "column", gap: 14, padding: "14px 16px" } },
  topRow: { alignItems: "center", display: "flex", justifyContent: "space-between", width: "100%" },
  brand: { color: "var(--foreground)", fontSize: 15, fontWeight: 800, textDecoration: "none" },
  links: { alignItems: "center", display: "flex", flexWrap: "wrap", gap: 16, "@media (max-width: 700px)": { alignItems: "flex-start", gap: 12, width: "100%" } },
  menuButton: { backgroundColor: "var(--surface)", borderColor: "var(--border)", borderRadius: 8, borderStyle: "solid", borderWidth: 1, color: "var(--foreground)", cursor: "pointer", display: "none", fontWeight: 700, padding: "8px 12px", "@media (max-width: 700px)": { display: "block" } },
  mobileClosed: { "@media (max-width: 700px)": { display: "none" } },
  mobileOpen: { "@media (max-width: 700px)": { display: "flex", flexDirection: "column" } },
  link: { color: "var(--muted)", fontSize: 14, fontWeight: 700, textDecoration: "none", transition: "all 250ms ease", ":hover": { color: "var(--foreground)" } },
});

export function DashboardNav(): React.JSX.Element {
  const [open, setOpen] = useState<boolean>(false);
  const close = (): void => setOpen(false);
  return <header {...stylex.props(styles.header)}><nav aria-label="Primary navigation" {...stylex.props(styles.nav)}><div {...stylex.props(styles.topRow)}><Link href="/" onClick={close} {...stylex.props(styles.brand)}>Reverb Agent Admin</Link><button type="button" aria-label={open ? "Close navigation menu" : "Open navigation menu"} aria-expanded={open} onClick={() => setOpen((current) => !current)} {...stylex.props(styles.menuButton)}>{open ? "×" : "☰"}</button></div><div {...stylex.props(styles.links, open ? styles.mobileOpen : styles.mobileClosed)}><Link href="/listings" onClick={close} {...stylex.props(styles.link)}>Listings</Link><Link href="/rules" onClick={close} {...stylex.props(styles.link)}>Rules</Link><Link href="/offers" onClick={close} {...stylex.props(styles.link)}>Offers</Link><Link href="/escalations" onClick={close} {...stylex.props(styles.link)}>Escalations</Link><ThemeToggle /></div></nav></header>;
}
