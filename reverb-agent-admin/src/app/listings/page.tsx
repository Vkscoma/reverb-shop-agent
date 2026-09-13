import stylex from "@stylexjs/stylex";
import { getReverbListings } from "@/lib/actions";
import { ListingTable } from "./listing-table";

export const dynamic = "force-dynamic";

const styles = stylex.create({
  main: { margin: "0 auto", maxWidth: 1120, padding: "56px 24px", "@media (max-width: 700px)": { padding: "36px 16px" } },
  eyebrow: { color: "#5d8de8", fontSize: 12, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase" },
  title: { color: "var(--foreground)", fontSize: 36, letterSpacing: "-0.04em", margin: "8px 0 10px", "@media (max-width: 700px)": { fontSize: 30 } },
  intro: { color: "var(--muted)", margin: "0 0 32px" },
  card: { backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, boxShadow: "0 8px 24px rgba(0,0,0,0.12)", padding: 24, "@media (max-width: 700px)": { padding: 16 } },
  empty: { color: "var(--muted)", margin: 0 },
});

export default async function ListingsPage(): Promise<React.JSX.Element> {
  const result = await getReverbListings();
  return <main {...stylex.props(styles.main)}><span {...stylex.props(styles.eyebrow)}>Reverb catalog</span><h1 {...stylex.props(styles.title)}>Live listings</h1><p {...stylex.props(styles.intro)}>Search active Reverb listings and copy IDs into listing rules.</p><section {...stylex.props(styles.card)}>{result.ok ? <ListingTable listings={result.data} /> : <p {...stylex.props(styles.empty)}>{result.error}</p>}</section></main>;
}
