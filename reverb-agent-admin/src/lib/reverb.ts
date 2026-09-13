const defaultBaseUrl = "https://api.reverb.com/api";

export type ReverbListing = {
  id: string;
  make: string;
  model: string;
  amount: string;
  status: string;
};

type JsonRecord = Record<string, unknown>;

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null;
}

function text(value: unknown): string {
  return typeof value === "string" || typeof value === "number" ? String(value) : "";
}

function parseListing(value: unknown): ReverbListing | null {
  if (!isRecord(value)) return null;
  const id = text(value.id || value.uuid);
  if (!id) return null;
  const price = isRecord(value.price) ? value.price : {};
  const state = isRecord(value.state) ? value.state : {};
  return {
    id,
    make: text(value.make) || "—",
    model: text(value.model) || "—",
    amount: text(price.amount) || "—",
    status: text(state.description) || "Unknown",
  };
}

function nextHref(payload: JsonRecord): string | null {
  const links = isRecord(payload._links) ? payload._links : null;
  const next = links && isRecord(links.next) ? links.next.href : null;
  return typeof next === "string" && next.length > 0 ? next : null;
}

export async function fetchReverbListings(): Promise<ReverbListing[]> {
  const token = process.env.REVERB_API_TOKEN;
  if (!token) throw new Error("REVERB_API_TOKEN is not configured.");
  const baseUrl = (process.env.REVERB_API_BASE_URL || defaultBaseUrl).replace(/\/$/, "");
  let url: string | null = `${baseUrl}/my/listings`;
  const listings: ReverbListing[] = [];
  let pageCount = 0;

  while (url && pageCount < 100) {
    const response = await fetch(url, {
      headers: {
        Accept: "application/hal+json",
        "Accept-Version": "3.0",
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/hal+json",
      },
      next: { revalidate: 3600 },
    });
    if (!response.ok) throw new Error(`Reverb listings request failed with status ${response.status}.`);
    const payload: unknown = await response.json();
    if (!isRecord(payload) || !Array.isArray(payload.listings)) throw new Error("Reverb listings response was invalid.");
    for (const listing of payload.listings) {
      const parsed = parseListing(listing);
      if (parsed) listings.push(parsed);
    }
    url = nextHref(payload);
    pageCount += 1;
  }

  if (url) throw new Error("Reverb listings pagination exceeded the safety limit.");
  return listings;
}
