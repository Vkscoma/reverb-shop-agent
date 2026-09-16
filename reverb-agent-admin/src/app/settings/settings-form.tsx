"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import stylex from "@stylexjs/stylex";
import { triggerReverbSync, updateAutomationSetting, type AutomationActivity, type AutomationSettings, type SettingsEnvironment, type SyncStatus } from "@/lib/actions";

const styles = stylex.create({
  grid: { display: "grid", gap: 20, gridTemplateColumns: "repeat(2, minmax(0, 1fr))", "@media (max-width: 760px)": { gridTemplateColumns: "1fr" } },
  card: { backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, boxShadow: "0 8px 24px rgba(0,0,0,0.12)", padding: 24, "@media (max-width: 700px)": { padding: 16 } },
  wide: { gridColumn: "1 / -1" },
  heading: { color: "var(--foreground)", fontSize: 18, margin: "0 0 8px" },
  copy: { color: "var(--muted)", fontSize: 14, lineHeight: 1.55, margin: "0 0 18px" },
  setting: { alignItems: "flex-start", borderTop: "1px solid var(--line)", display: "flex", gap: 12, padding: "16px 0 0" },
  checkbox: { accentColor: "#1456d9", height: 18, marginTop: 2, width: 18 },
  label: { color: "var(--foreground)", cursor: "pointer", display: "grid", gap: 3, fontWeight: 700 },
  detail: { color: "var(--muted)", fontSize: 13, fontWeight: 400, lineHeight: 1.45 },
  row: { alignItems: "center", display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "space-between" },
  badge: { borderRadius: 99, fontSize: 12, fontWeight: 800, padding: "5px 9px" },
  safe: { backgroundColor: "#dff4e4", color: "#176b2c" },
  warning: { backgroundColor: "#ffead2", color: "#8a4b08" },
  muted: { color: "var(--muted)", fontSize: 13 },
  sync: { backgroundColor: "#1456d9", border: "1px solid #1456d9", borderRadius: 8, color: "#fff", cursor: "pointer", fontWeight: 700, padding: "9px 13px" },
  stats: { display: "grid", gap: 12, gridTemplateColumns: "repeat(4, minmax(0, 1fr))", marginTop: 18, "@media (max-width: 600px)": { gridTemplateColumns: "repeat(2, minmax(0, 1fr))" } },
  stat: { backgroundColor: "var(--input)", border: "1px solid var(--line)", borderRadius: 8, padding: 12 },
  statValue: { color: "var(--foreground)", display: "block", fontSize: 20, fontWeight: 800 },
  statLabel: { color: "var(--muted)", fontSize: 11, textTransform: "uppercase" },
  activity: { display: "grid", gap: 10 },
  item: { backgroundColor: "var(--input)", border: "1px solid var(--line)", borderRadius: 8, display: "grid", gap: 6, padding: 12 },
  itemTop: { alignItems: "center", display: "flex", gap: 8, justifyContent: "space-between" },
  itemTitle: { color: "var(--foreground)", fontWeight: 800 },
  links: { display: "flex", flexWrap: "wrap", gap: 10 },
  link: { color: "#5d8de8", fontSize: 13, fontWeight: 700 },
  error: { color: "#e26d6d", fontSize: 13, margin: 0 },
});

function formatDate(value: string | null): string { return value ? new Date(value).toLocaleString() : "—"; }
function label(value: string): string { return value.replaceAll("_", " "); }

export function SettingsForm({ settings, environment, latestSync, activity }: { settings: AutomationSettings; environment: SettingsEnvironment; latestSync: SyncStatus; activity: AutomationActivity[] }): React.JSX.Element {
  const router = useRouter();
  const [values, setValues] = useState(settings);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState("");
  async function toggle(type: "offer" | "message", enabled: boolean): Promise<void> {
    setValues((current) => ({ ...current, [type === "offer" ? "offerAutoRespond" : "messageAutoRespond"]: enabled }));
    const result = await updateAutomationSetting({ type, enabled });
    if (!result.ok) { setValues(settings); setError(result.error); } else router.refresh();
  }
  async function sync(): Promise<void> {
    setSyncing(true); setError("");
    const result = await triggerReverbSync();
    if (!result.ok) setError(result.error); else router.refresh();
    setSyncing(false);
  }
  return <div {...stylex.props(styles.grid)}>
    <section {...stylex.props(styles.card)}><h2 {...stylex.props(styles.heading)}>Automation</h2><p {...stylex.props(styles.copy)}>Global defaults apply to every listing. The agent only acts when a setting is enabled and the server-side safety checks allow it.</p><div {...stylex.props(styles.setting)}><input type="checkbox" checked={values.offerAutoRespond} onChange={(event) => void toggle("offer", event.target.checked)} {...stylex.props(styles.checkbox)} /><label {...stylex.props(styles.label)}>Automatic offer responses<span {...stylex.props(styles.detail)}>Use active listing rules to accept, decline, or counter official Reverb offers.</span></label></div><div {...stylex.props(styles.setting)}><input type="checkbox" checked={values.messageAutoRespond} onChange={(event) => void toggle("message", event.target.checked)} {...stylex.props(styles.checkbox)} /><label {...stylex.props(styles.label)}>Automatic message replies<span {...stylex.props(styles.detail)}>Reply to informal offers in conversations when the message automation is enabled.</span></label></div></section>
    <section {...stylex.props(styles.card)}><h2 {...stylex.props(styles.heading)}>Safety</h2><p {...stylex.props(styles.copy)}>These deployment settings are read-only here and remain guarded on the server.</p><div {...stylex.props(styles.row)}><span {...stylex.props(styles.muted)}>Execution mode</span><span {...stylex.props(styles.badge, environment.dryRun ? styles.safe : styles.warning)}>{environment.dryRun ? "Dry run" : "Live"}</span></div><div {...stylex.props(styles.row)}><span {...stylex.props(styles.muted)}>Offer actions</span><span {...stylex.props(styles.badge, environment.offerActionsEnabled ? styles.warning : styles.safe)}>{environment.offerActionsEnabled ? "Enabled" : "Disabled"}</span></div>{environment.liveMutationsPossible ? <p {...stylex.props(styles.error)}>Warning: live mutations are possible. Confirm automation settings and listing rules before enabling responses.</p> : <p {...stylex.props(styles.muted)}>No external mutations can be sent in the current environment.</p>}<div {...stylex.props(styles.links)}><Link href="#activity" {...stylex.props(styles.link)}>View audit history</Link><Link href="/offers" {...stylex.props(styles.link)}>Review offers</Link><Link href="/escalations" {...stylex.props(styles.link)}>Review escalations</Link></div></section>
    <section {...stylex.props(styles.card, styles.wide)}><div {...stylex.props(styles.row)}><div><h2 {...stylex.props(styles.heading)}>Sync</h2><p {...stylex.props(styles.copy)}>Refresh listings, conversations, and offers from Reverb. Scheduled background sync is a follow-up capability and is not configurable here.</p></div><button type="button" onClick={() => void sync()} disabled={syncing} {...stylex.props(styles.sync)}>{syncing ? "Syncing…" : "Sync now"}</button></div>{latestSync ? <><div {...stylex.props(styles.row)}><span {...stylex.props(styles.muted)}>Last run: {formatDate(latestSync.startedAt)}</span><span {...stylex.props(styles.badge, latestSync.status === "succeeded" ? styles.safe : styles.warning)}>{label(latestSync.status)}</span></div><div {...stylex.props(styles.stats)}>{[[latestSync.listingsCount, "Listings"], [latestSync.conversationsCount, "Conversations"], [latestSync.actionsPlanned, "Planned actions"], [latestSync.actionsSent, "Sent actions"]].map(([value, name]) => <div key={name} {...stylex.props(styles.stat)}><span {...stylex.props(styles.statValue)}>{value}</span><span {...stylex.props(styles.statLabel)}>{name}</span></div>)}</div>{latestSync.error ? <p {...stylex.props(styles.error)}>{latestSync.error}</p> : null}</> : <p {...stylex.props(styles.muted)}>No sync runs recorded yet.</p>}</section>
    <section id="activity" {...stylex.props(styles.card, styles.wide)}><h2 {...stylex.props(styles.heading)}>Automation activity</h2><p {...stylex.props(styles.copy)}>Recent planned, sent, and failed actions from the audit log.</p>{activity.length ? <div {...stylex.props(styles.activity)}>{activity.map((item) => <article key={item.id} {...stylex.props(styles.item)}><div {...stylex.props(styles.itemTop)}><span {...stylex.props(styles.itemTitle)}>{label(item.action)}</span><span {...stylex.props(styles.badge, item.status === "failed" ? styles.warning : styles.safe)}>{label(item.status)}</span></div><span {...stylex.props(styles.muted)}>{formatDate(item.createdAt)}{item.decision ? ` · ${item.decision}` : ""}{item.requestSummary ? ` · ${item.requestSummary}` : ""}</span>{item.error ? <p {...stylex.props(styles.error)}>{item.error}</p> : null}<div {...stylex.props(styles.links)}>{item.offerId ? <Link href="/offers" {...stylex.props(styles.link)}>Offer {item.offerId}</Link> : null}{item.conversationId ? <Link href="/escalations" {...stylex.props(styles.link)}>Conversation {item.conversationId}</Link> : null}{item.listingId ? <Link href="/listings" {...stylex.props(styles.link)}>Listing {item.listingId}</Link> : null}</div></article>)}</div> : <p {...stylex.props(styles.muted)}>No automation actions recorded yet.</p>}</section>
    {error ? <p {...stylex.props(styles.error)}>{error}</p> : null}
  </div>;
}
