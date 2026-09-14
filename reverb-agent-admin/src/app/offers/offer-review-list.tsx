"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import stylex from "@stylexjs/stylex";
import { executeOfferReview, type OfferReview, type OfferReviewDecision } from "@/lib/actions";

const styles = stylex.create({
  tableWrap: { width: "100%" },
  table: { borderCollapse: "collapse", minWidth: 840, width: "100%" },
  desktopOnly: { "@media (max-width: 700px)": { display: "none" } },
  mobileCards: { display: "none", "@media (max-width: 700px)": { display: "grid", gap: 12 } },
  mobileCard: { backgroundColor: "var(--input)", borderColor: "var(--border)", borderRadius: 8, borderStyle: "solid", borderWidth: 1, display: "grid", gap: 10, padding: 14 },
  mobileRow: { display: "grid", gap: 4 },
  mobileLabel: { color: "var(--muted)", fontSize: 11, fontWeight: 800, letterSpacing: "0.05em", textTransform: "uppercase" },
  mobileValue: { color: "var(--foreground)", overflowWrap: "anywhere" },
  cell: { borderBottomColor: "var(--line)", borderBottomStyle: "solid", borderBottomWidth: 1, color: "var(--foreground)", padding: "14px 10px", textAlign: "left", verticalAlign: "top" },
  heading: { color: "var(--muted)", fontSize: 12, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase" },
  amount: { fontWeight: 800, whiteSpace: "nowrap" },
  recommendation: { color: "#e2a45b", fontWeight: 700, textTransform: "capitalize" },
  controls: { alignItems: "center", display: "flex", flexWrap: "wrap", gap: 8 },
  button: { backgroundColor: "#1456d9", borderColor: "#1456d9", borderRadius: 8, borderStyle: "solid", borderWidth: 1, color: "#fff", cursor: "pointer", fontWeight: 700, padding: "8px 11px", transition: "all 250ms ease", ":hover": { backgroundColor: "#1f63ed", borderColor: "#1f63ed", transform: "translateY(-1px)" }, ":focus-visible": { outline: "2px solid #8db3ff", outlineOffset: 2 } },
  accept: { backgroundColor: "#218739", borderColor: "#218739", ":hover": { backgroundColor: "#279c43", borderColor: "#279c43" } },
  danger: { backgroundColor: "#b83f4b", borderColor: "#b83f4b", ":hover": { backgroundColor: "#d14b58", borderColor: "#d14b58" } },
  input: { appearance: "none", backgroundColor: "var(--input)", borderColor: "var(--border)", borderRadius: 6, borderStyle: "solid", borderWidth: 1, color: "var(--foreground)", outline: "none", padding: "8px 9px", transition: "all 250ms ease", width: 100, ":focus": { borderColor: "#5d8de8", outline: "none" }, ":focus-visible": { outline: "none" } },
  counter: { display: "flex", gap: 6 },
  muted: { color: "var(--muted)", fontSize: 13 },
  error: { color: "#e26d6d", fontSize: 13, margin: "8px 0 0" },
});

export function OfferReviewList({ reviews }: { reviews: OfferReview[] }): React.JSX.Element {
  const router = useRouter();
  const [counterAmounts, setCounterAmounts] = useState<Record<string, string>>(() => Object.fromEntries(reviews.flatMap((review) => review.auditId ? [[review.auditId, review.recommendedCounterAmount ?? ""]] : [])));
  const [message, setMessage] = useState<string>("");
  const [busy, setBusy] = useState<string>("");

  async function act(review: OfferReview, decision: OfferReviewDecision): Promise<void> {
    if (!review.auditId) return;
    setBusy(review.auditId);
    setMessage("");
    const result = await executeOfferReview({ auditId: review.auditId, decision, counterAmount: counterAmounts[review.auditId] });
    if (!result.ok) { setMessage(result.error); setBusy(""); return; }
    router.refresh();
  }

  const actionControls = (review: OfferReview): React.JSX.Element => review.auditId && review.recommendedDecision ? <div {...stylex.props(styles.controls)}><button type="button" disabled={busy === review.auditId} onClick={() => act(review, "accept")} {...stylex.props(styles.button, styles.accept)}>Accept</button><button type="button" disabled={busy === review.auditId} onClick={() => act(review, "decline")} {...stylex.props(styles.button, styles.danger)}>Decline</button><div {...stylex.props(styles.counter)}><input aria-label={`Counter amount for ${review.listingId}`} inputMode="decimal" placeholder="Amount" value={counterAmounts[review.auditId] ?? ""} onChange={(event) => setCounterAmounts((current) => ({ ...current, [review.auditId!]: event.target.value }))} {...stylex.props(styles.input)} /><button type="button" disabled={busy === review.auditId} onClick={() => act(review, "counter")} {...stylex.props(styles.button)}>Counter</button></div></div> : <span {...stylex.props(styles.muted)}>No active rule/decision yet. Sync after adding a rule.</span>;
  return <>{message ? <p {...stylex.props(styles.error)}>{message}</p> : null}<div {...stylex.props(styles.tableWrap)}><div {...stylex.props(styles.desktopOnly)}><table {...stylex.props(styles.table)}><thead><tr>{["Listing", "Offer", "Status", "Recommended", "Action"].map((heading) => <th key={heading} {...stylex.props(styles.cell, styles.heading)}>{heading}</th>)}</tr></thead><tbody>{reviews.map((review) => <tr key={review.offerId}><td {...stylex.props(styles.cell)}>{review.listingId}</td><td {...stylex.props(styles.cell, styles.amount)}>${Number(review.amount).toFixed(2)} {review.currency}</td><td {...stylex.props(styles.cell)}>{review.offerStatus}</td><td {...stylex.props(styles.cell, styles.recommendation)}>{review.recommendedDecision ? `${review.recommendedDecision}${review.recommendedCounterAmount ? ` at $${review.recommendedCounterAmount}` : ""}` : "—"}</td><td {...stylex.props(styles.cell)}>{actionControls(review)}</td></tr>)}</tbody></table></div><div {...stylex.props(styles.mobileCards)}>{reviews.map((review) => <article key={review.offerId} {...stylex.props(styles.mobileCard)}><div {...stylex.props(styles.mobileRow)}><span {...stylex.props(styles.mobileLabel)}>Listing</span><span {...stylex.props(styles.mobileValue)}>{review.listingId}</span></div><div {...stylex.props(styles.mobileRow)}><span {...stylex.props(styles.mobileLabel)}>Offer</span><span {...stylex.props(styles.mobileValue)}>${Number(review.amount).toFixed(2)} {review.currency}</span></div><div {...stylex.props(styles.mobileRow)}><span {...stylex.props(styles.mobileLabel)}>Status</span><span {...stylex.props(styles.mobileValue)}>{review.offerStatus}</span></div><div {...stylex.props(styles.mobileRow)}><span {...stylex.props(styles.mobileLabel)}>Recommended</span><span {...stylex.props(styles.mobileValue, styles.recommendation)}>{review.recommendedDecision ?? "—"}</span></div>{actionControls(review)}</article>)}</div></div></>;
}
