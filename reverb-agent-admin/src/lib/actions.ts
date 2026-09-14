"use server";

import type { Escalation, ListingRule } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { applyOfferDecision, fetchReverbListings, type ReverbListing } from "@/lib/reverb";
import { syncReverbData, type SyncSummary } from "@/lib/sync";

export type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string };
export type CreateListingRuleInput = { listingId: string; name: string; floorPrice: number; targetPrice: number };
export type UpdateListingRuleInput = Partial<CreateListingRuleInput> & { id: string; isActive?: boolean };
export type CreateEscalationInput = { conversationId: string; listingId?: string; intent: string; message: string };
export type UpdateEscalationInput = { id: string; status: string };
export type OfferReviewDecision = "accept" | "decline" | "counter";
export type OfferReview = { auditId: string | null; offerId: string; listingId: string; amount: string; currency: string; offerStatus: string; recommendedDecision: OfferReviewDecision | null; recommendedCounterAmount: string | null; createdAt: string };
export type AutomationSettings = { offerAutoRespond: boolean; messageAutoRespond: boolean };

const escalationStatuses = ["open", "acknowledged", "resolved"] as const;

const nonEmpty = (value: string): boolean => value.trim().length > 0;
const dollarsToCents = (value: number): number => Math.round(value * 100);
const validDollarAmount = (value: number): boolean => Number.isFinite(value) && value >= 0;
const offerDecisions = ["accept", "decline", "counter"] as const;

export async function getReverbListings(): Promise<ActionResult<ReverbListing[]>> {
  try { return { ok: true, data: await fetchReverbListings() }; }
  catch (error) { return { ok: false, error: error instanceof Error ? error.message : "Unable to load Reverb listings." }; }
}

export async function triggerReverbSync(): Promise<ActionResult<SyncSummary>> {
  try { return { ok: true, data: await syncReverbData() }; }
  catch (error) { return { ok: false, error: error instanceof Error ? error.message : "Unable to sync Reverb data." }; }
}

export async function getAutomationSettings(): Promise<ActionResult<AutomationSettings>> {
  try {
    const settings = await prisma.automationSetting.findUnique({ where: { id: "default" } });
    return { ok: true, data: { offerAutoRespond: settings?.offerAutoRespond ?? false, messageAutoRespond: settings?.messageAutoRespond ?? false } };
  } catch { return { ok: false, error: "Unable to load automation settings." }; }
}

export async function updateAutomationSetting(input: { type: "offer" | "message"; enabled: boolean }): Promise<ActionResult<AutomationSettings>> {
  try {
    const settings = await prisma.automationSetting.upsert({ where: { id: "default" }, create: { id: "default", offerAutoRespond: input.type === "offer" ? input.enabled : false, messageAutoRespond: input.type === "message" ? input.enabled : false }, update: input.type === "offer" ? { offerAutoRespond: input.enabled } : { messageAutoRespond: input.enabled } });
    return { ok: true, data: { offerAutoRespond: settings.offerAutoRespond, messageAutoRespond: settings.messageAutoRespond } };
  } catch { return { ok: false, error: "Unable to update automation settings." }; }
}

export async function getListingRules(): Promise<ActionResult<ListingRule[]>> {
  try { return { ok: true, data: await prisma.listingRule.findMany({ orderBy: { createdAt: "desc" } }) }; }
  catch { return { ok: false, error: "Unable to load listing rules." }; }
}

export async function createListingRule(input: CreateListingRuleInput): Promise<ActionResult<ListingRule>> {
  if (!nonEmpty(input.listingId) || !nonEmpty(input.name)) return { ok: false, error: "Listing ID and rule name are required." };
  if (!validDollarAmount(input.floorPrice) || !validDollarAmount(input.targetPrice)) return { ok: false, error: "Prices must be valid USD amounts." };
  if (input.targetPrice < input.floorPrice) return { ok: false, error: "Target price must be greater than or equal to floor price." };
  try { return { ok: true, data: await prisma.listingRule.create({ data: { listingId: input.listingId.trim(), name: input.name.trim(), floorPrice: dollarsToCents(input.floorPrice), targetPrice: dollarsToCents(input.targetPrice) } }) }; }
  catch (error) { console.error("createListingRule failed", error); return { ok: false, error: "Unable to create listing rule." }; }
}

export async function updateListingRule(input: UpdateListingRuleInput): Promise<ActionResult<ListingRule>> {
  if (!input.id || (input.floorPrice !== undefined && input.floorPrice < 0)) return { ok: false, error: "Invalid listing rule update." };
  if ((input.floorPrice !== undefined && !validDollarAmount(input.floorPrice)) || (input.targetPrice !== undefined && !validDollarAmount(input.targetPrice))) return { ok: false, error: "Prices must be valid USD amounts." };
  if (input.floorPrice !== undefined && input.targetPrice !== undefined && input.targetPrice < input.floorPrice) return { ok: false, error: "Target price must be greater than or equal to floor price." };
  const { id, ...data } = input;
  const normalizedData = { ...data, ...(data.listingId ? { listingId: data.listingId.trim() } : {}), ...(data.name ? { name: data.name.trim() } : {}), ...(data.floorPrice !== undefined ? { floorPrice: dollarsToCents(data.floorPrice) } : {}), ...(data.targetPrice !== undefined ? { targetPrice: dollarsToCents(data.targetPrice) } : {}) };
  try { return { ok: true, data: await prisma.listingRule.update({ where: { id }, data: normalizedData }) }; }
  catch { return { ok: false, error: "Unable to update listing rule." }; }
}

export async function deleteListingRule(id: string): Promise<ActionResult<ListingRule>> {
  if (!id) return { ok: false, error: "A listing rule ID is required." };
  try { return { ok: true, data: await prisma.listingRule.delete({ where: { id } }) }; }
  catch { return { ok: false, error: "Unable to delete listing rule." }; }
}

export async function getEscalations(): Promise<ActionResult<Escalation[]>> {
  try { return { ok: true, data: await prisma.escalation.findMany({ orderBy: { createdAt: "desc" } }) }; }
  catch { return { ok: false, error: "Unable to load escalations." }; }
}

export async function createEscalation(input: CreateEscalationInput): Promise<ActionResult<Escalation>> {
  if (!nonEmpty(input.conversationId) || !nonEmpty(input.intent) || !nonEmpty(input.message)) return { ok: false, error: "Conversation, intent, and message are required." };
  try { return { ok: true, data: await prisma.escalation.create({ data: input }) }; }
  catch { return { ok: false, error: "Unable to create escalation." }; }
}

export async function updateEscalation(input: UpdateEscalationInput): Promise<ActionResult<Escalation>> {
  if (!input.id || !nonEmpty(input.status)) return { ok: false, error: "Invalid escalation update." };
  if (!escalationStatuses.includes(input.status.trim() as (typeof escalationStatuses)[number])) return { ok: false, error: "Invalid escalation status." };
  try { return { ok: true, data: await prisma.escalation.update({ where: { id: input.id }, data: { status: input.status.trim() } }) }; }
  catch { return { ok: false, error: "Unable to update escalation." }; }
}

export async function getOfferReviews(): Promise<ActionResult<OfferReview[]>> {
  try {
    const [offers, audits] = await Promise.all([
      prisma.reverbOffer.findMany({ where: { listingId: { not: null }, amount: { not: null } }, orderBy: { createdAt: "desc" } }),
      prisma.reverbActionAudit.findMany({ where: { action: "offer_decision", status: "planned", offerId: { not: null } }, orderBy: { createdAt: "desc" } }),
    ]);
    const auditsByOfferId = new Map(audits.flatMap((audit) => audit.offerId ? [[audit.offerId, audit] as const] : []));
    const reviews = offers.flatMap((offer): OfferReview[] => {
      if (!offer.listingId || !offer.amount || !offer.currency) return [];
      const audit = auditsByOfferId.get(offer.reverbId);
      const decision = audit?.decision;
      const recommendedDecision = decision && offerDecisions.includes(decision as OfferReviewDecision) ? decision as OfferReviewDecision : null;
      const counterMatch = audit?.requestSummary?.match(/Counter at ([0-9]+(?:\.[0-9]{1,2})?) USD/);
      return [{ auditId: audit?.id ?? null, offerId: offer.reverbId, listingId: offer.listingId, amount: offer.amount, currency: offer.currency, offerStatus: offer.status ?? "Unknown", recommendedDecision, recommendedCounterAmount: counterMatch?.[1] ?? null, createdAt: offer.createdAt.toISOString() }];
    });
    return { ok: true, data: reviews };
  } catch { return { ok: false, error: "Unable to load offer reviews." }; }
}

export async function executeOfferReview(input: { auditId: string; decision: OfferReviewDecision; counterAmount?: string }): Promise<ActionResult<{ auditId: string }>> {
  if (!input.auditId || !offerDecisions.includes(input.decision)) return { ok: false, error: "Invalid offer review decision." };
  if (process.env.REVERB_DRY_RUN !== "false" || process.env.REVERB_ENABLE_OFFER_ACTIONS !== "true") return { ok: false, error: "Live offer actions are disabled. Set REVERB_DRY_RUN=false and REVERB_ENABLE_OFFER_ACTIONS=true first." };
  const audit = await prisma.reverbActionAudit.findUnique({ where: { id: input.auditId } });
  if (!audit || audit.action !== "offer_decision" || audit.status !== "planned" || !audit.offerId) return { ok: false, error: "This offer is no longer waiting for review." };
  let counterAmount: string | undefined;
  if (input.decision === "counter") {
    const parsed = Number(input.counterAmount);
    if (!validDollarAmount(parsed)) return { ok: false, error: "Enter a valid counter amount in USD." };
    counterAmount = parsed.toFixed(2);
  }
  try {
    await applyOfferDecision(audit.offerId, input.decision, counterAmount);
    await prisma.reverbActionAudit.update({ where: { id: audit.id }, data: { status: "sent", decision: input.decision, requestSummary: counterAmount ? `Counter at ${counterAmount} USD` : undefined, completedAt: new Date() } });
    return { ok: true, data: { auditId: audit.id } };
  } catch (error) {
    await prisma.reverbActionAudit.update({ where: { id: audit.id }, data: { status: "failed", decision: input.decision, error: error instanceof Error ? error.message : "Offer action failed", completedAt: new Date() } });
    return { ok: false, error: "Unable to complete the Reverb offer action." };
  }
}
