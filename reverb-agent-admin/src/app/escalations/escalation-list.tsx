"use client";

import { useRouter } from "next/navigation";
import stylex from "@stylexjs/stylex";
import type { Escalation } from "@prisma/client";
import { updateEscalation } from "@/lib/actions";

const styles = stylex.create({
  cell: { borderBottom: "1px solid #edf0f5", padding: "14px 10px", textAlign: "left", verticalAlign: "top" },
  status: { color: "#b54708", fontWeight: 700 },
  select: { border: "1px solid #d9dfeb", borderRadius: 6, color: "#172033", padding: "6px 8px" },
});

export function EscalationList({ items }: { items: Escalation[] }): React.JSX.Element {
  const router = useRouter();
  async function setStatus(id: string, status: string): Promise<void> {
    await updateEscalation({ id, status });
    router.refresh();
  }
  return <table style={{ borderCollapse: "collapse", width: "100%" }}><thead><tr>{["Intent", "Conversation", "Message", "Status"].map((heading) => <th key={heading} {...stylex.props(styles.cell)}>{heading}</th>)}</tr></thead><tbody>{items.map((item) => <tr key={item.id}><td {...stylex.props(styles.cell)}>{item.intent}</td><td {...stylex.props(styles.cell)}>{item.conversationId}</td><td {...stylex.props(styles.cell)}>{item.message}</td><td {...stylex.props(styles.cell, styles.status)}><select aria-label={`Status for ${item.conversationId}`} value={item.status} onChange={(event) => setStatus(item.id, event.target.value)} {...stylex.props(styles.select)}><option value="open">Open</option><option value="acknowledged">Acknowledged</option><option value="resolved">Resolved</option></select></td></tr>)}</tbody></table>;
}