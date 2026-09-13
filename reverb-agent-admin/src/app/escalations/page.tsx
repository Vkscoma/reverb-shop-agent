import stylex from "@stylexjs/stylex";
import { getEscalations } from "@/lib/actions";
import { EscalationList } from "./escalation-list";

export const dynamic = "force-dynamic";

const styles = stylex.create({
  main: { margin: "0 auto", maxWidth: 1120, padding: "56px 24px" },
  eyebrow: { color: "#b54708", fontSize: 12, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase" },
  title: { color: "#172033", fontSize: 36, letterSpacing: "-0.04em", margin: "8px 0 10px" },
  intro: { color: "#526078", margin: "0 0 32px" },
  card: { backgroundColor: "#fff", border: "1px solid #e3e8f0", borderRadius: 12, boxShadow: "0 8px 24px rgba(23,32,51,0.05)", padding: 24 },
  table: { borderCollapse: "collapse", width: "100%" },
  cell: { borderBottom: "1px solid #edf0f5", padding: "14px 10px", textAlign: "left" },
  head: { color: "#526078", fontSize: 12, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase" },
  status: { color: "#b54708", fontWeight: 700 },
  empty: { color: "#526078", margin: 0 },
});

export default async function EscalationsPage(): Promise<React.JSX.Element> {
  const result = await getEscalations();
  return <main {...stylex.props(styles.main)}><span {...stylex.props(styles.eyebrow)}>Human review</span><h1 {...stylex.props(styles.title)}>Escalations</h1><p {...stylex.props(styles.intro)}>Messages and decisions routed to the store owner for review.</p><section {...stylex.props(styles.card)}>{result.ok && result.data.length > 0 ? <EscalationList items={result.data} /> : <p {...stylex.props(styles.empty)}>{result.ok ? "No escalations require review." : result.error}</p>}</section></main>;
}
