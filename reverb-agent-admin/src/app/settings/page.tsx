import stylex from "@stylexjs/stylex";
import { getSettingsDashboardData } from "@/lib/actions";
import { SettingsForm } from "./settings-form";

export const dynamic = "force-dynamic";

const styles = stylex.create({
  main: { margin: "0 auto", maxWidth: 1120, padding: "56px 24px", "@media (max-width: 700px)": { padding: "36px 16px" } },
  eyebrow: { color: "#5d8de8", fontSize: 12, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase" },
  title: { color: "var(--foreground)", fontSize: 36, letterSpacing: "-0.04em", margin: "8px 0 10px", "@media (max-width: 700px)": { fontSize: 30 } },
  intro: { color: "var(--muted)", margin: "0 0 32px" },
  error: { color: "#e26d6d", margin: 0 },
});

export default async function SettingsPage(): Promise<React.JSX.Element> {
  const result = await getSettingsDashboardData();
  return <main {...stylex.props(styles.main)}><span {...stylex.props(styles.eyebrow)}>Control center</span><h1 {...stylex.props(styles.title)}>Settings</h1><p {...stylex.props(styles.intro)}>Configure global automation defaults, review safety controls, and monitor what the agent has done.</p>{result.ok ? <SettingsForm {...result.data} /> : <p {...stylex.props(styles.error)}>{result.error}</p>}</main>;
}
