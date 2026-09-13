import { syncReverbData } from "@/lib/sync";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<Response> {
  const expected = process.env.CRON_SECRET;
  const authorization = request.headers.get("authorization");
  if (!expected || authorization !== `Bearer ${expected}`) return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });

  try {
    const summary = await syncReverbData();
    return Response.json({ ok: true, data: summary });
  } catch (error) {
    return Response.json({ ok: false, error: error instanceof Error ? error.message : "Reverb sync failed." }, { status: 500 });
  }
}
