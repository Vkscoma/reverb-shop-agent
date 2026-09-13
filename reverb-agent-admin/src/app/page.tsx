import Link from "next/link";
import stylex from "@stylexjs/stylex";

const styles = stylex.create({
  main: { margin: "0 auto", maxWidth: 900, padding: "72px 24px", "@media (max-width: 700px)": { padding: "48px 16px" } },
  title: { color: "var(--foreground)", fontSize: 42, letterSpacing: "-0.05em", margin: 0, "@media (max-width: 700px)": { fontSize: 34 } },
  intro: { color: "var(--muted)", fontSize: 18, lineHeight: 1.6, margin: "16px 0 32px", maxWidth: 600 },
  nav: { display: "flex", gap: 12, "@media (max-width: 520px)": { flexDirection: "column" } },
  link: { backgroundColor: "#1456d9", borderColor: "#1456d9", borderRadius: 8, borderStyle: "solid", borderWidth: 1, color: "#fff", fontWeight: 700, padding: "12px 16px", textDecoration: "none", transition: "all 250ms ease", ":hover": { backgroundColor: "#1f63ed", borderColor: "#1f63ed", transform: "translateY(-1px)" } },
  secondary: { backgroundColor: "var(--surface)", borderColor: "var(--border)", borderStyle: "solid", borderWidth: 1, color: "var(--foreground)", ":hover": { backgroundColor: "var(--line)", borderColor: "#5d8de8" } },
});

export default function Home(): React.JSX.Element {
  return <main {...stylex.props(styles.main)}><h1 {...stylex.props(styles.title)}>Reverb Agent Admin</h1><p {...stylex.props(styles.intro)}>Manage deterministic listing rules and review conversations that need a human decision.</p><nav {...stylex.props(styles.nav)}><Link href="/rules" {...stylex.props(styles.link)}>Listing rules</Link><Link href="/escalations" {...stylex.props(styles.link, styles.secondary)}>Escalations</Link></nav></main>;
}
