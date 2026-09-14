const defaultBaseUrl = "https://api.reverb.com/api";

export type ReverbListing = {
  id: string;
  make: string;
  model: string;
  amount: string;
  status: string;
  offersEnabled: boolean;
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

function nestedText(value: unknown, ...keys: string[]): string | null {
  if (isRecord(value)) {
    for (const key of keys) {
      const result = text(value[key]);
      if (result) return result;
    }
  }
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
    offersEnabled: value.offers_enabled === true,
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
    if (!response.ok) throw new Error(`Reverb ${key} request failed with status ${response.status}.`);
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

function parseOffer(value: JsonRecord, parentListingId: string | null = null): ReverbOffer | null {
  // Reverb has returned both `id`/`uuid` and `offer_id`/`negotiation_id`
  // for otherwise equivalent negotiation records. Prefer the explicit offer
  // identifiers so a listing wrapper is never mistaken for the offer.
  const id = text(value.offer_id || value.negotiation_id || value.id || value.uuid);
  if (!id) return null;
  const price = isRecord(value.price) ? value.price : isRecord(value.offer_price) ? value.offer_price : isRecord(value.last_offered_price) ? value.last_offered_price : {};
  const originalPrice = isRecord(price.original) ? price.original : isRecord(price.display) ? price.display : price;
  const state = isRecord(value.state) ? value.state : {};
  const amount = nestedText(originalPrice, "amount") || nestedText(price, "amount") || nestedText(value.offer_price, "amount") || text(value.offer_amount || value.amount);
  const currency = nestedText(originalPrice, "currency") || nestedText(price, "currency") || nestedText(value.offer_price, "currency") || text(value.offer_currency || value.currency) || "USD";
  return {
    id,
    listingId: nestedId(value.listing_id || value.listing) || parentListingId,
    amount: amount || null,
    currency,
    status: text(isRecord(state) ? state.description || state.name : state) || text(value.status) || null,
  };
}

export async function fetchReverbOffers(fresh = true): Promise<ReverbOffer[]> {
  const listingRecords = await fetchReverbCollection("my/listings/negotiations", "listings", fresh);
  const offers: ReverbOffer[] = [];
  for (const listing of listingRecords) {
    const listingId = nestedId(listing.id);
    const negotiations = Array.isArray(listing.negotiations) ? listing.negotiations : [];
    if (negotiations.length > 0) {
      for (const negotiation of negotiations) {
        if (isRecord(negotiation)) {
          const parsed = parseOffer(negotiation, listingId);
          if (parsed) offers.push(parsed);
        }
      }
    } else if (listing.offer_id || listing.offer_price || listing.negotiation_id || listing.offer_amount) {
      const parsed = parseOffer(listing, listingId);
      if (parsed) offers.push(parsed);
    }
  }
  return offers;
}

async function reverbWrite(path: string, body?: JsonRecord): Promise<void> {
  const token = process.env.REVERB_API_TOKEN;
  if (!token) throw new Error("REVERB_API_TOKEN is not configured.");
  const baseUrl = (process.env.REVERB_API_BASE_URL || defaultBaseUrl).replace(/\/$/, "");
  const response = await fetch(`${baseUrl}/${path.replace(/^\//, "")}`, {
    method: "POST",
    headers: { Accept: "application/hal+json", "Accept-Version": "3.0", Authorization: `Bearer ${token}`, "Content-Type": "application/hal+json" },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Reverb mutation failed with status ${response.status}.`);
}

export async function replyToConversation(conversationId: string, body: string): Promise<void> {
  if (!conversationId) throw new Error("A conversation ID is required.");
  await reverbWrite(`my/conversations/${encodeURIComponent(conversationId)}/messages`, { body });
}

export async function applyOfferDecision(offerId: string, decision: "accept" | "decline" | "counter", counterAmount?: string): Promise<void> {
  if (!offerId) throw new Error("An offer ID is required.");
  const payload = decision === "counter" ? { price: { amount: counterAmount || "0.00", currency: "USD" } } : undefined;
  await reverbWrite(`my/negotiations/${encodeURIComponent(offerId)}/${decision}`, payload);
}
