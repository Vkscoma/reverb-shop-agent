import { prisma } from "@/lib/prisma";
import { fetchReverbConversations, fetchReverbListings, fetchReverbOffers } from "@/lib/reverb";
import { processReverbAutomation } from "@/lib/automation";

export type SyncSummary = {
  syncRunId: string;
  listings: number;
  conversations: number;
  messages: number;
  offers: number;
  actionsPlanned: number;
  actionsSent: number;
  escalationsCreated: number;
};

export async function syncReverbData(): Promise<SyncSummary> {
  const activeRun = await prisma.syncRun.findFirst({ where: { status: "running", startedAt: { gt: new Date(Date.now() - 30 * 60 * 1000) } } });
  if (activeRun) throw new Error("A Reverb sync is already running.");

  const run = await prisma.syncRun.create({ data: { status: "running" } });
  try {
    const [listings, conversations, offers] = await Promise.all([
      fetchReverbListings(true),
      fetchReverbConversations(true),
      fetchReverbOffers(true),
    ]);

    for (const listing of listings) {
      await prisma.syncedListing.upsert({
        where: { reverbId: listing.id },
        create: { reverbId: listing.id, make: listing.make, model: listing.model, amount: listing.amount, status: listing.status, offersEnabled: listing.offersEnabled },
        update: { make: listing.make, model: listing.model, amount: listing.amount, status: listing.status, offersEnabled: listing.offersEnabled, syncedAt: new Date() },
      });
    }

    let messageCount = 0;
    for (const conversation of conversations) {
      await prisma.reverbConversation.upsert({
        where: { reverbId: conversation.id },
        create: { reverbId: conversation.id, listingId: conversation.listingId, unread: conversation.unread, latestMessage: conversation.latestMessage, lastMessageAt: conversation.lastMessageAt },
        update: { listingId: conversation.listingId, unread: conversation.unread, latestMessage: conversation.latestMessage, lastMessageAt: conversation.lastMessageAt },
      });
      for (const message of conversation.messages) {
        await prisma.reverbMessage.upsert({
          where: { reverbId: message.id },
          create: { reverbId: message.id, conversationId: conversation.id, senderId: message.senderId || null, body: message.body, sentAt: message.sentAt },
          update: { conversationId: conversation.id, senderId: message.senderId || null, body: message.body, sentAt: message.sentAt },
        });
        messageCount += 1;
      }
    }

    for (const offer of offers) {
      await prisma.reverbOffer.upsert({
        where: { reverbId: offer.id },
        create: { reverbId: offer.id, listingId: offer.listingId, amount: offer.amount, currency: offer.currency, status: offer.status },
        update: { listingId: offer.listingId, amount: offer.amount, currency: offer.currency, status: offer.status },
      });
    }

    const automation = await processReverbAutomation({ listings, conversations, offers });
    const summary = { syncRunId: run.id, listings: listings.length, conversations: conversations.length, messages: messageCount, offers: offers.length, ...automation };
    await prisma.syncRun.update({ where: { id: run.id }, data: { status: "succeeded", finishedAt: new Date(), listingsCount: summary.listings, conversationsCount: summary.conversations, messagesCount: summary.messages, offersCount: summary.offers, actionsPlanned: summary.actionsPlanned, actionsSent: summary.actionsSent, escalationsCreated: summary.escalationsCreated } });
    return summary;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown Reverb sync error.";
    await prisma.syncRun.update({ where: { id: run.id }, data: { status: "failed", finishedAt: new Date(), error: message.slice(0, 1000) } });
    throw error;
  }
}
