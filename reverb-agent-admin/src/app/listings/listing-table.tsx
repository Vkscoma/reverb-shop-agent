"use client";

import { useMemo, useState } from "react";
import stylex from "@stylexjs/stylex";
import type { ReverbListing } from "@/lib/reverb";

const styles = stylex.create({
  controls: { display: "flex", justifyContent: "space-between", marginBottom: 18 },
  input: { backgroundColor: "var(--input)", border: "1px solid var(--border)", borderRadius: 6, boxShadow: "none", color: "var(--foreground)", outline: "none", padding: "10px 12px", width: "min(100%, 420px)", ":focus": { borderColor: "#5d8de8", boxShadow: "none" } },
  table: { borderCollapse: "collapse", width: "100%" },
  cell: { borderBottom: "1px solid var(--line)", color: "var(--foreground)", padding: "14px 10px", textAlign: "left", verticalAlign: "top" },
  heading: { color: "var(--muted)", fontSize: 12, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase" },
  id: { fontFamily: "monospace", fontSize: 13 },
  copy: { background: "none", border: 0, color: "#5d8de8", cursor: "pointer", fontSize: 12, fontWeight: 700, marginLeft: 8, padding: 0 },
  empty: { color: "var(--muted)", margin: 0 },
});

export function ListingTable({ listings }: { listings: ReverbListing[] }): React.JSX.Element {
  const [query, setQuery] = useState<string>("");
  const [copiedId, setCopiedId] = useState<string>("");
  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return normalized ? listings.filter((listing) => [listing.id, listing.make, listing.model].some((value) => value.toLowerCase().includes(normalized))) : listings;
  }, [listings, query]);

  async function copyId(id: string): Promise<void> {
    await navigator.clipboard.writeText(id);
    setCopiedId(id);
    window.setTimeout(() => setCopiedId(""), 1500);
  }

  return <><div {...stylex.props(styles.controls)}><input aria-label="Search listings" placeholder="Search make, model, or ID" value={query} onChange={(event) => setQuery(event.target.value)} {...stylex.props(styles.input)} /></div>{filtered.length ? <table {...stylex.props(styles.table)}><thead><tr>{["ID", "Make", "Model", "Amount", "Status"].map((heading) => <th key={heading} {...stylex.props(styles.cell, styles.heading)}>{heading}</th>)}</tr></thead><tbody>{filtered.map((listing) => <tr key={listing.id}><td {...stylex.props(styles.cell, styles.id)}>{listing.id}<button type="button" onClick={() => copyId(listing.id)} {...stylex.props(styles.copy)}>{copiedId === listing.id ? "Copied" : "Copy"}</button></td><td {...stylex.props(styles.cell)}>{listing.make}</td><td {...stylex.props(styles.cell)}>{listing.model}</td><td {...stylex.props(styles.cell)}>${listing.amount}</td><td {...stylex.props(styles.cell)}>{listing.status}</td></tr>)}</tbody></table> : <p {...stylex.props(styles.empty)}>No listings match your search.</p>}</>;
}
