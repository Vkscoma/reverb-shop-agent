"use client";

import { useRouter } from "next/navigation";
import stylex from "@stylexjs/stylex";
import type { ListingRule } from "@prisma/client";
import { deleteListingRule, updateListingRule } from "@/lib/actions";

const styles = stylex.create({
  cell: { borderBottom: "1px solid #edf0f5", padding: "14px 10px", textAlign: "left" },
  active: { color: "#067647", fontWeight: 700 },
  inactive: { color: "#667085", fontWeight: 700 },
  action: { background: "none", border: 0, color: "#1456d9", cursor: "pointer", fontWeight: 700, padding: 0 },
  danger: { color: "#b42318", marginLeft: 12 },
});

export function RuleList({ rules }: { rules: ListingRule[] }): React.JSX.Element {
  const router = useRouter();
  async function toggle(rule: ListingRule): Promise<void> { await updateListingRule({ id: rule.id, isActive: !rule.isActive }); router.refresh(); }
  async function remove(id: string): Promise<void> { if (!window.confirm("Delete this listing rule?")) return; await deleteListingRule(id); router.refresh(); }
  return <table style={{ borderCollapse: "collapse", width: "100%" }}><thead><tr>{["Name", "Listing", "Floor", "Target", "Status", "Actions"].map((heading) => <th key={heading} {...stylex.props(styles.cell)}>{heading}</th>)}</tr></thead><tbody>{rules.map((rule) => <tr key={rule.id}><td {...stylex.props(styles.cell)}>{rule.name}</td><td {...stylex.props(styles.cell)}>{rule.listingId}</td><td {...stylex.props(styles.cell)}>${rule.floorPrice}</td><td {...stylex.props(styles.cell)}>${rule.targetPrice}</td><td {...stylex.props(styles.cell, rule.isActive ? styles.active : styles.inactive)}>{rule.isActive ? "Active" : "Paused"}</td><td {...stylex.props(styles.cell)}><button type="button" onClick={() => toggle(rule)} {...stylex.props(styles.action)}>{rule.isActive ? "Pause" : "Activate"}</button><button type="button" onClick={() => remove(rule.id)} {...stylex.props(styles.action, styles.danger)}>Delete</button></td></tr>)}</tbody></table>;
}