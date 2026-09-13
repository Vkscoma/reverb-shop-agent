"use server";

import type { Escalation, ListingRule } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { fetchReverbListings, type ReverbListing } from "@/lib/reverb";

export type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string };
export type CreateListingRuleInput = { listingId: string; name: string; floorPrice: number; targetPrice: number };
export type UpdateListingRuleInput = Partial<CreateListingRuleInput> & { id: string; isActive?: boolean };
export type CreateEscalationInput = { conversationId: string; listingId?: string; intent: string; message: string };
export type UpdateEscalationInput = { id: string; status: string };

const escalationStatuses = ["open", "acknowledged", "resolved"] as const;

const nonEmpty = (value: string): boolean => value.trim().length > 0;

export async function getReverbListings(): Promise<ActionResult<ReverbListing[]>> {
  try { return { ok: true, data: await fetchReverbListings() }; }
  catch (error) { return { ok: false, error: error instanceof Error ? error.message : "Unable to load Reverb listings." }; }
}

export async function getListingRules(): Promise<ActionResult<ListingRule[]>> {
  try { return { ok: true, data: await prisma.listingRule.findMany({ orderBy: { createdAt: "desc" } }) }; }
  catch { return { ok: false, error: "Unable to load listing rules." }; }
}

export async function createListingRule(input: CreateListingRuleInput): Promise<ActionResult<ListingRule>> {
  if (!nonEmpty(input.listingId) || !nonEmpty(input.name)) return { ok: false, error: "Listing ID and rule name are required." };
  if (!Number.isInteger(input.floorPrice) || !Number.isInteger(input.targetPrice)) return { ok: false, error: "Prices must be whole numbers." };
  if (input.floorPrice < 0 || input.targetPrice < input.floorPrice) return { ok: false, error: "Target price must be greater than or equal to floor price." };
  try { return { ok: true, data: await prisma.listingRule.create({ data: { ...input, listingId: input.listingId.trim(), name: input.name.trim() } }) }; }
  catch (error) { console.error("createListingRule failed", error); return { ok: false, error: "Unable to create listing rule." }; }
}

export async function updateListingRule(input: UpdateListingRuleInput): Promise<ActionResult<ListingRule>> {
  if (!input.id || (input.floorPrice !== undefined && input.floorPrice < 0)) return { ok: false, error: "Invalid listing rule update." };
  if ((input.floorPrice !== undefined && !Number.isInteger(input.floorPrice)) || (input.targetPrice !== undefined && !Number.isInteger(input.targetPrice))) return { ok: false, error: "Prices must be whole numbers." };
  if (input.floorPrice !== undefined && input.targetPrice !== undefined && input.targetPrice < input.floorPrice) return { ok: false, error: "Target price must be greater than or equal to floor price." };
  const { id, ...data } = input;
  try { return { ok: true, data: await prisma.listingRule.update({ where: { id }, data: { ...data, ...(data.listingId ? { listingId: data.listingId.trim() } : {}), ...(data.name ? { name: data.name.trim() } : {}) } }) }; }
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
