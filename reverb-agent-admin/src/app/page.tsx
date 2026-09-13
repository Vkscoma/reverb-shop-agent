import Link from "next/link";
import stylex from "@stylexjs/stylex";

const styles = stylex.create({
  main: { margin: "0 auto", maxWidth: 900, padding: "72px 24px" },
  title: { color: "var(--foreground)", fontSize: 42, letterSpacing: "-0.05em", margin: 0 },
  intro: { color: "var(--muted)", fontSize: 18, lineHeight: 1.6, margin: "16px 0 32px", maxWidth: 600 },
  nav: { display: "flex", gap: 12 },
  link: { backgroundColor: "#1456d9", borderRadius: 8, color: "#fff", fontWeight: 700, padding: "12px 16px", textDecoration: "none" },
  secondary: { backgroundColor: "var(--surface)", border: "1px solid var(--border)", color: "var(--foreground)" },
});

export default function Home(): React.JSX.Element {
  return <main {...stylex.props(styles.main)}><h1 {...stylex.props(styles.title)}>Reverb Agent Admin</h1><p {...stylex.props(styles.intro)}>Manage deterministic listing rules and review conversations that need a human decision.</p><nav {...stylex.props(styles.nav)}><Link href="/rules" {...stylex.props(styles.link)}>Listing rules</Link><Link href="/escalations" {...stylex.props(styles.link, styles.secondary)}>Escalations</Link></nav></main>;
}
