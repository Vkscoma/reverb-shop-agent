const defaultBaseUrl = "https://api.reverb.com/api";

export type ReverbListing = {
  id: string;
  make: string;
  model: string;
  amount: string;
  status: string;
};

export type ReverbMessage = {
  id: string;
  senderId: string;
  body: string;
  sentAt: Date | null;
};

export type ReverbConversation = {
  id: string;
  listingId: string | null;
  unread: boolean;
  latestMessage: string | null;
  lastMessageAt: Date | null;
  messages: ReverbMessage[];
};

export type ReverbOffer = {
  id: string;
  listingId: string | null;
  amount: string | null;
  currency: string;
  status: string | null;
};

type JsonRecord = Record<string, unknown>;

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null;
}

function text(value: unknown): string {
  return typeof value === "string" || typeof value === "number" ? String(value) : "";
}

function date(value: unknown): Date | null {
  if (typeof value !== "string") return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function nestedId(value: unknown): string | null {
  if (isRecord(value)) return text(value.id || value.uuid) || null;
  return text(value) || null;
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

async function fetchReverbCollection(path: string, key: string, fresh: boolean): Promise<JsonRecord[]> {
  const token = process.env.REVERB_API_TOKEN;
  if (!token) throw new Error("REVERB_API_TOKEN is not configured.");
  const baseUrl = (process.env.REVERB_API_BASE_URL || defaultBaseUrl).replace(/\/$/, "");
  let url: string | null = `${baseUrl}/${path.replace(/^\//, "")}`;
  const records: JsonRecord[] = [];
  let pageCount = 0;

  while (url && pageCount < 100) {
    const response = await fetch(url, fresh ? {
      headers: {
        Accept: "application/hal+json",
        "Accept-Version": "3.0",
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/hal+json",
      },
      cache: "no-store",
    } : {
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
    if (!isRecord(payload) || !Array.isArray(payload[key])) throw new Error(`Reverb ${key} response was invalid.`);
    for (const record of payload[key]) if (isRecord(record)) records.push(record);
    url = nextHref(payload);
    pageCount += 1;
  }

  if (url) throw new Error(`Reverb ${key} pagination exceeded the safety limit.`);
  return records;
}

export async function fetchReverbListings(fresh = false): Promise<ReverbListing[]> {
  return (await fetchReverbCollection("my/listings", "listings", fresh)).map(parseListing).filter((listing): listing is ReverbListing => listing !== null);
}

function parseConversation(value: JsonRecord): ReverbConversation | null {
  const id = text(value.id || value.uuid);
  if (!id) return null;
  const rawMessages = Array.isArray(value.messages) ? value.messages : [];
  const messages = rawMessages.flatMap((rawMessage): ReverbMessage[] => {
    if (!isRecord(rawMessage)) return [];
    const messageId = text(rawMessage.id || rawMessage.uuid);
    const body = text(rawMessage.body || rawMessage.message);
    if (!messageId || !body) return [];
    return [{ id: messageId, senderId: text(rawMessage.sender_id || rawMessage.sender) || "", body, sentAt: date(rawMessage.created_at || rawMessage.sent_at) }];
  });
  const latest = messages[messages.length - 1] ?? null;
  return {
    id,
    listingId: nestedId(value.listing_id || value.listing),
    unread: value.unread === true || Number(value.unread_count) > 0,
    latestMessage: latest?.body ?? null,
    lastMessageAt: latest?.sentAt ?? date(value.updated_at),
    messages,
  };
}

export async function fetchReverbConversations(fresh = true): Promise<ReverbConversation[]> {
  const records = await fetchReverbCollection("my/conversations?unread_only=true", "conversations", fresh);
  return records.map(parseConversation).filter((conversation): conversation is ReverbConversation => conversation !== null);
}

function parseOffer(value: JsonRecord): ReverbOffer | null {
  const id = text(value.id || value.uuid);
  if (!id) return null;
  const price = isRecord(value.price) ? value.price : isRecord(value.offer_price) ? value.offer_price : {};
  const state = isRecord(value.state) ? value.state : {};
  return {
    id,
    listingId: nestedId(value.listing_id || value.listing),
    amount: text(price.amount) || null,
    currency: text(price.currency) || "USD",
    status: text(state.description || value.status) || null,
  };
}

export async function fetchReverbOffers(fresh = true): Promise<ReverbOffer[]> {
  const records = await fetchReverbCollection("my/listings/negotiations", "negotiations", fresh);
  return records.map(parseOffer).filter((offer): offer is ReverbOffer => offer !== null);
}
