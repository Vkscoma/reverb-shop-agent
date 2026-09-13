import { prisma } from "@/lib/prisma";
import { applyOfferDecision, replyToConversation, type ReverbConversation, type ReverbListing, type ReverbOffer } from "@/lib/reverb";
import { evaluateOffer } from "@/lib/rules";

export type MessageIntent = "shipping_question" | "spec_question" | "informal_offer" | "needs_human";
export type AutomationSummary = { actionsPlanned: number; actionsSent: number; escalationsCreated: number };

const informalOffer = /(?:\$\s?\d+(?:\.\d{1,2})?|\b(?:offer|take|accept|price)\b)/i;
const shippingQuestion = /\b(ship|shipping|delivery|deliver|pickup|pick up|postage)\b/i;
const specificationQuestion = /\b(spec|specification|dimension|size|weight|voltage|condition|include|included|case|color|colour|year)\b/i;
const informalOfferReply = "Thanks for reaching out! Please send your offer through Reverb using the Make an Offer option. Once it comes through as an official offer, I’ll review it there.";

function classifyMessage(body: string): MessageIntent {
  if (informalOffer.test(body)) return "informal_offer";
  if (shippingQuestion.test(body)) return "shipping_question";
  if (specificationQuestion.test(body)) return "spec_question";
  return "needs_human";
}

function dryRun(): boolean {
  return process.env.REVERB_DRY_RUN !== "false";
}

function enabled(name: string): boolean {
  return process.env[name] === "true";
}

async function createEscalation(conversation: ReverbConversation, body: string, intent: MessageIntent, reason: string): Promise<boolean> {
  const existing = await prisma.escalation.findFirst({ where: { conversationId: conversation.id, message: body } });
  if (existing) return false;
  await prisma.escalation.create({ data: { conversationId: conversation.id, listingId: conversation.listingId, intent, message: `${body}\n\nReason: ${reason}` } });
  return true;
}

async function processMessages(conversations: ReverbConversation[], listings: Map<string, ReverbListing>, offers: ReverbOffer[]): Promise<AutomationSummary> {
  let actionsPlanned = 0;
  let actionsSent = 0;
  let escalationsCreated = 0;
  const ownerId = process.env.REVERB_OWNER_ID;
  const canReply = enabled("REVERB_ENABLE_MESSAGE_REPLIES") && !dryRun();

  for (const conversation of conversations) {
    const message = conversation.messages[conversation.messages.length - 1];
    if (!message || (ownerId && message.senderId === ownerId)) continue;
    const intent = classifyMessage(message.body);
    const listing = conversation.listingId ? listings.get(conversation.listingId) : undefined;
    if (intent !== "informal_offer") {
      if (await createEscalation(conversation, message.body, intent, "Message requires human review.")) escalationsCreated += 1;
      continue;
    }
    if (!ownerId || !listing?.offersEnabled) {
      if (await createEscalation(conversation, message.body, intent, !ownerId ? "REVERB_OWNER_ID is not configured." : "Offers are not enabled for this listing.")) escalationsCreated += 1;
      continue;
    }
    if (offers.some((offer) => offer.listingId === conversation.listingId)) continue;
    const existing = await prisma.reverbActionAudit.findFirst({ where: { action: "message_reply", conversationId: conversation.id, messageId: message.id } });
    if (existing) continue;
    if (!canReply) {
      await prisma.reverbActionAudit.create({ data: { action: "message_reply", status: "planned", conversationId: conversation.id, messageId: message.id, listingId: conversation.listingId, requestSummary: informalOfferReply } });
      actionsPlanned += 1;
      continue;
    }
    try {
      await replyToConversation(conversation.id, informalOfferReply);
      await prisma.reverbActionAudit.create({ data: { action: "message_reply", status: "sent", conversationId: conversation.id, messageId: message.id, listingId: conversation.listingId, requestSummary: informalOfferReply, completedAt: new Date() } });
      actionsSent += 1;
    } catch (error) {
      await prisma.reverbActionAudit.create({ data: { action: "message_reply", status: "failed", conversationId: conversation.id, messageId: message.id, listingId: conversation.listingId, error: error instanceof Error ? error.message : "Reply failed", completedAt: new Date() } });
    }
  }
  return { actionsPlanned, actionsSent, escalationsCreated };
}

async function processOffers(offers: ReverbOffer[]): Promise<AutomationSummary> {
  let actionsPlanned = 0;
  let actionsSent = 0;
  const canAct = enabled("REVERB_ENABLE_OFFER_ACTIONS") && !dryRun();
  for (const offer of offers) {
    if (!offer.listingId || offer.currency !== "USD" || !offer.amount) continue;
    const amountCents = Math.round(Number(offer.amount) * 100);
    if (!Number.isFinite(amountCents)) continue;
    const rule = await prisma.listingRule.findFirst({ where: { listingId: offer.listingId, isActive: true }, orderBy: { createdAt: "desc" } });
    if (!rule) continue;
    const decision = evaluateOffer(amountCents, { floorPrice: rule.floorPrice, targetPrice: rule.targetPrice });
    const existing = await prisma.reverbActionAudit.findFirst({ where: { action: "offer_decision", offerId: offer.id, decision: decision.decision } });
    if (existing) continue;
    const counterAmount = decision.counterPrice === undefined ? undefined : (decision.counterPrice / 100).toFixed(2);
    if (!canAct) {
      await prisma.reverbActionAudit.create({ data: { action: "offer_decision", status: "planned", offerId: offer.id, listingId: offer.listingId, decision: decision.decision, requestSummary: counterAmount ? `Counter at ${counterAmount} USD` : undefined } });
      actionsPlanned += 1;
      continue;
    }
    try {
      await applyOfferDecision(offer.id, decision.decision, counterAmount);
      await prisma.reverbActionAudit.create({ data: { action: "offer_decision", status: "sent", offerId: offer.id, listingId: offer.listingId, decision: decision.decision, requestSummary: counterAmount ? `Counter at ${counterAmount} USD` : undefined, completedAt: new Date() } });
      actionsSent += 1;
    } catch (error) {
      await prisma.reverbActionAudit.create({ data: { action: "offer_decision", status: "failed", offerId: offer.id, listingId: offer.listingId, decision: decision.decision, error: error instanceof Error ? error.message : "Offer action failed", completedAt: new Date() } });
    }
  }
  return { actionsPlanned, actionsSent, escalationsCreated: 0 };
}

export async function processReverbAutomation(input: { listings: ReverbListing[]; conversations: ReverbConversation[]; offers: ReverbOffer[] }): Promise<AutomationSummary> {
  const listings = new Map(input.listings.map((listing) => [listing.id, listing]));
  const messages = await processMessages(input.conversations, listings, input.offers);
  const offers = await processOffers(input.offers);
  return { actionsPlanned: messages.actionsPlanned + offers.actionsPlanned, actionsSent: messages.actionsSent + offers.actionsSent, escalationsCreated: messages.escalationsCreated };
}
