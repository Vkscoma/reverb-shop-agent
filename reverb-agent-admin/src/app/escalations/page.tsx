import stylex from "@stylexjs/stylex";
import { getEscalations } from "@/lib/actions";
import { getAutomationSettings } from "@/lib/actions";
import { AutomationControls } from "../automation-controls";
import { EscalationList } from "./escalation-list";

export const dynamic = "force-dynamic";

const styles = stylex.create({
  main: { margin: "0 auto", maxWidth: 1120, padding: "56px 24px", "@media (max-width: 700px)": { padding: "36px 16px" } },
  eyebrow: { color: "#e2a45b", fontSize: 12, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase" },
  title: { color: "var(--foreground)", fontSize: 36, letterSpacing: "-0.04em", margin: "8px 0 10px", "@media (max-width: 700px)": { fontSize: 30 } },
  intro: { color: "var(--muted)", margin: "0 0 32px" },
  card: { backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, boxShadow: "0 8px 24px rgba(0,0,0,0.12)", padding: 24, "@media (max-width: 700px)": { padding: 16 } },
  empty: { color: "var(--muted)", margin: 0 },
});

export default async function EscalationsPage(): Promise<React.JSX.Element> {
  const [result, settings] = await Promise.all([getEscalations(), getAutomationSettings()]);
  return <main {...stylex.props(styles.main)}><span {...stylex.props(styles.eyebrow)}>Human review</span><h1 {...stylex.props(styles.title)}>Escalations</h1><p {...stylex.props(styles.intro)}>Messages and decisions routed to the store owner for review.</p><AutomationControls type="message" enabled={settings.ok && settings.data.messageAutoRespond} /><section {...stylex.props(styles.card)}>{result.ok && result.data.length > 0 ? <EscalationList items={result.data} /> : <p {...stylex.props(styles.empty)}>{result.ok ? "No escalations require review." : result.error}</p>}</section></main>;
}
