import stylex from "@stylexjs/stylex";
import { getOfferReviews } from "@/lib/actions";
import { OfferReviewList } from "./offer-review-list";

export const dynamic = "force-dynamic";

const styles = stylex.create({
  main: { margin: "0 auto", maxWidth: 1120, padding: "56px 24px", "@media (max-width: 700px)": { padding: "36px 16px" } },
  eyebrow: { color: "#5d8de8", fontSize: 12, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase" },
  title: { color: "var(--foreground)", fontSize: 36, letterSpacing: "-0.04em", margin: "8px 0 10px", "@media (max-width: 700px)": { fontSize: 30 } },
  intro: { color: "var(--muted)", margin: "0 0 32px" },
  card: { backgroundColor: "var(--surface)", borderColor: "var(--border)", borderRadius: 12, borderStyle: "solid", borderWidth: 1, boxShadow: "0 8px 24px rgba(0,0,0,0.12)", padding: 24, "@media (max-width: 700px)": { padding: 16 } },
  empty: { color: "var(--muted)", margin: 0 },
});

export default async function OffersPage(): Promise<React.JSX.Element> {
  const result = await getOfferReviews();
  return <main {...stylex.props(styles.main)}><span {...stylex.props(styles.eyebrow)}>Offer review</span><h1 {...stylex.props(styles.title)}>Offers</h1><p {...stylex.props(styles.intro)}>Review the recommended decision before sending an accept, decline, or counter response to Reverb.</p><section {...stylex.props(styles.card)}>{result.ok && result.data.length > 0 ? <OfferReviewList reviews={result.data} /> : <p {...stylex.props(styles.empty)}>{result.ok ? "No offers are waiting for review." : result.error}</p>}</section></main>;
}
