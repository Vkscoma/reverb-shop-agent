"use client";

import { useRouter } from "next/navigation";
import stylex from "@stylexjs/stylex";
import type { ListingRule } from "@prisma/client";
import { deleteListingRule, updateListingRule } from "@/lib/actions";

const styles = stylex.create({
  tableWrap: { overflowX: "auto", width: "100%" },
  table: { borderCollapse: "collapse", minWidth: 760, width: "100%" },
  cell: { borderBottom: "1px solid var(--line)", color: "var(--foreground)", padding: "14px 10px", textAlign: "left" },
  active: { color: "#42c98b", fontWeight: 700 },
  inactive: { color: "var(--muted)", fontWeight: 700 },
  action: { alignItems: "center", backgroundColor: "#1456d9", borderColor: "#1456d9", borderRadius: 8, borderStyle: "solid", borderWidth: 1, color: "#fff", cursor: "pointer", display: "inline-flex", fontWeight: 700, justifyContent: "center", padding: "8px 12px", transition: "all 250ms ease", ":hover": { backgroundColor: "#1f63ed", borderColor: "#1f63ed", transform: "translateY(-1px)" }, ":focus-visible": { outline: "2px solid #8db3ff", outlineOffset: 2 } },
  danger: { backgroundColor: "#b83f4b", borderColor: "#b83f4b", marginLeft: 12, ":hover": { backgroundColor: "#d14b58", borderColor: "#d14b58" } },
});

export function RuleList({ rules }: { rules: ListingRule[] }): React.JSX.Element {
  const router = useRouter();
  async function toggle(rule: ListingRule): Promise<void> { await updateListingRule({ id: rule.id, isActive: !rule.isActive }); router.refresh(); }
  async function remove(id: string): Promise<void> { if (!window.confirm("Delete this listing rule?")) return; await deleteListingRule(id); router.refresh(); }
  const formatUsd = (cents: number): string => `$${(cents / 100).toFixed(2)}`;
  return <div {...stylex.props(styles.tableWrap)}><table {...stylex.props(styles.table)}><thead><tr>{["Name", "Listing", "Floor", "Target", "Status", "Actions"].map((heading) => <th key={heading} {...stylex.props(styles.cell)}>{heading}</th>)}</tr></thead><tbody>{rules.map((rule) => <tr key={rule.id}><td {...stylex.props(styles.cell)}>{rule.name}</td><td {...stylex.props(styles.cell)}>{rule.listingId}</td><td {...stylex.props(styles.cell)}>{formatUsd(rule.floorPrice)}</td><td {...stylex.props(styles.cell)}>{formatUsd(rule.targetPrice)}</td><td {...stylex.props(styles.cell, rule.isActive ? styles.active : styles.inactive)}>{rule.isActive ? "Active" : "Paused"}</td><td {...stylex.props(styles.cell)}><button type="button" onClick={() => toggle(rule)} {...stylex.props(styles.action)}>{rule.isActive ? "Pause" : "Activate"}</button><button type="button" onClick={() => remove(rule.id)} {...stylex.props(styles.action, styles.danger)}>Delete</button></td></tr>)}</tbody></table></div>;
}
