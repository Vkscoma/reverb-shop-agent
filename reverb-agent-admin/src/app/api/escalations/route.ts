import { NextResponse } from "next/server";
import { createEscalation, getEscalations } from "@/lib/actions";

export async function GET(): Promise<NextResponse> {
  const result = await getEscalations();
  return NextResponse.json(result, { status: result.ok ? 200 : 500 });
}

export async function POST(request: Request): Promise<NextResponse> {
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ ok: false, error: "Request body must be valid JSON." }, { status: 400 }); }
  if (!body || typeof body !== "object") return NextResponse.json({ ok: false, error: "Request body must be an object." }, { status: 400 });
  const payload = body as Record<string, unknown>;
  const result = await createEscalation({ conversationId: String(payload.conversationId ?? ""), listingId: payload.listingId ? String(payload.listingId) : undefined, intent: String(payload.intent ?? ""), message: String(payload.message ?? "") });
  return NextResponse.json(result, { status: result.ok ? 201 : 400 });
}