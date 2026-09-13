import stylex from "@stylexjs/stylex";
import { getListingRules } from "@/lib/actions";
import { RuleForm } from "./rule-form";
import { RuleList } from "./rule-list";

export const dynamic = "force-dynamic";

const styles = stylex.create({
  main: { margin: "0 auto", maxWidth: 1120, padding: "56px 24px" },
  eyebrow: { color: "#1456d9", fontSize: 12, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase" },
  title: { color: "#172033", fontSize: 36, letterSpacing: "-0.04em", margin: "8px 0 10px" },
  intro: { color: "#526078", margin: "0 0 32px" },
  card: { backgroundColor: "#fff", border: "1px solid #e3e8f0", borderRadius: 12, boxShadow: "0 8px 24px rgba(23,32,51,0.05)", marginBottom: 24, padding: 24 },
  cardTitle: { color: "#172033", fontSize: 18, margin: "0 0 18px" },
  table: { borderCollapse: "collapse", width: "100%" },
  cell: { borderBottom: "1px solid #edf0f5", padding: "14px 10px", textAlign: "left" },
  head: { color: "#526078", fontSize: 12, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase" },
  active: { color: "#067647", fontWeight: 700 },
  empty: { color: "#526078", margin: 0 },
});

export default async function RulesPage(): Promise<React.JSX.Element> {
  const result = await getListingRules();
  const rules = result.ok ? result.data : [];
  return <main {...stylex.props(styles.main)}><span {...stylex.props(styles.eyebrow)}>Rules engine</span><h1 {...stylex.props(styles.title)}>Listing rules</h1><p {...stylex.props(styles.intro)}>Deterministic offer thresholds for active Reverb listings.</p>
    <section {...stylex.props(styles.card)}><h2 {...stylex.props(styles.cardTitle)}>Add a rule</h2><RuleForm /></section>
    <section {...stylex.props(styles.card)}><h2 {...stylex.props(styles.cardTitle)}>Listing rules</h2>{result.ok && rules.length > 0 ? <RuleList rules={rules} /> : <p {...stylex.props(styles.empty)}>{result.ok ? "No listing rules yet." : result.error}</p>}</section>
  </main>;
}
