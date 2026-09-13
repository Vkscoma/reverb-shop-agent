"use client";

import { useRouter } from "next/navigation";
import stylex from "@stylexjs/stylex";
import type { Escalation } from "@prisma/client";
import { updateEscalation } from "@/lib/actions";

const styles = stylex.create({
  tableWrap: { width: "100%" },
  table: { borderCollapse: "collapse", minWidth: 760, width: "100%" },
  desktopOnly: { "@media (max-width: 700px)": { display: "none" } },
  mobileCards: { display: "none", "@media (max-width: 700px)": { display: "grid", gap: 12 } },
  mobileCard: { backgroundColor: "var(--input)", borderColor: "var(--border)", borderRadius: 8, borderStyle: "solid", borderWidth: 1, display: "grid", gap: 10, padding: 14 },
  mobileRow: { display: "grid", gap: 4 },
  mobileLabel: { color: "var(--muted)", fontSize: 11, fontWeight: 800, letterSpacing: "0.05em", textTransform: "uppercase" },
  mobileValue: { color: "var(--foreground)", overflowWrap: "anywhere" },
  cell: { borderBottom: "1px solid var(--line)", color: "var(--foreground)", padding: "14px 10px", textAlign: "left", verticalAlign: "top" },
  status: { color: "#e2a45b", fontWeight: 700 },
  select: { appearance: "none", backgroundColor: "var(--input)", borderColor: "var(--border)", borderRadius: 6, borderStyle: "solid", borderWidth: 1, boxShadow: "none", color: "var(--foreground)", outline: "none", padding: "6px 8px", transition: "all 250ms ease", ":focus": { borderColor: "#e2a45b", boxShadow: "none", outline: "none" }, ":focus-visible": { outline: "none" } },
});

export function EscalationList({ items }: { items: Escalation[] }): React.JSX.Element {
  const router = useRouter();
  async function setStatus(id: string, status: string): Promise<void> {
    await updateEscalation({ id, status });
    router.refresh();
  }
  return <div {...stylex.props(styles.tableWrap)}><div {...stylex.props(styles.desktopOnly)}><table {...stylex.props(styles.table)}><thead><tr>{["Intent", "Conversation", "Message", "Status"].map((heading) => <th key={heading} {...stylex.props(styles.cell)}>{heading}</th>)}</tr></thead><tbody>{items.map((item) => <tr key={item.id}><td {...stylex.props(styles.cell)}>{item.intent}</td><td {...stylex.props(styles.cell)}>{item.conversationId}</td><td {...stylex.props(styles.cell)}>{item.message}</td><td {...stylex.props(styles.cell, styles.status)}><select aria-label={`Status for ${item.conversationId}`} value={item.status} onChange={(event) => setStatus(item.id, event.target.value)} {...stylex.props(styles.select)}><option value="open">Open</option><option value="acknowledged">Acknowledged</option><option value="resolved">Resolved</option></select></td></tr>)}</tbody></table></div><div {...stylex.props(styles.mobileCards)}>{items.map((item) => <article key={item.id} {...stylex.props(styles.mobileCard)}><div {...stylex.props(styles.mobileRow)}><span {...stylex.props(styles.mobileLabel)}>Intent</span><span {...stylex.props(styles.mobileValue)}>{item.intent}</span></div><div {...stylex.props(styles.mobileRow)}><span {...stylex.props(styles.mobileLabel)}>Conversation</span><span {...stylex.props(styles.mobileValue)}>{item.conversationId}</span></div><div {...stylex.props(styles.mobileRow)}><span {...stylex.props(styles.mobileLabel)}>Message</span><span {...stylex.props(styles.mobileValue)}>{item.message}</span></div><div {...stylex.props(styles.mobileRow)}><span {...stylex.props(styles.mobileLabel)}>Status</span><select aria-label={`Status for ${item.conversationId}`} value={item.status} onChange={(event) => setStatus(item.id, event.target.value)} {...stylex.props(styles.select)}><option value="open">Open</option><option value="acknowledged">Acknowledged</option><option value="resolved">Resolved</option></select></div></article>)}</div></div>;
}
