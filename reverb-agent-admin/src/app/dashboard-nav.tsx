import Link from "next/link";
import stylex from "@stylexjs/stylex";
import { ThemeToggle } from "./theme-toggle";

const styles = stylex.create({
  header: { backgroundColor: "var(--surface)", borderBottomColor: "var(--border)", borderBottomStyle: "solid", borderBottomWidth: 1 },
  nav: { alignItems: "center", display: "flex", gap: 20, justifyContent: "space-between", margin: "0 auto", maxWidth: 1120, padding: "16px 24px" },
  brand: { color: "var(--foreground)", fontSize: 15, fontWeight: 800, textDecoration: "none" },
  links: { alignItems: "center", display: "flex", gap: 16 },
  link: { color: "var(--muted)", fontSize: 14, fontWeight: 700, textDecoration: "none", transition: "all 250ms ease", ":hover": { color: "var(--foreground)" } },
});

export function DashboardNav(): React.JSX.Element {
  return <header {...stylex.props(styles.header)}><nav aria-label="Primary navigation" {...stylex.props(styles.nav)}><Link href="/" {...stylex.props(styles.brand)}>Reverb Agent Admin</Link><div {...stylex.props(styles.links)}><Link href="/listings" {...stylex.props(styles.link)}>Listings</Link><Link href="/rules" {...stylex.props(styles.link)}>Rules</Link><Link href="/escalations" {...stylex.props(styles.link)}>Escalations</Link><ThemeToggle /></div></nav></header>;
}
