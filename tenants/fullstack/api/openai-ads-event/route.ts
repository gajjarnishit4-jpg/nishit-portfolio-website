import { NextRequest, NextResponse } from "next/server";
import { sendOpenAIAdsLead } from "@/tenants/fullstack/lib/openai-ads-server";

type Body = { eventId?: string; sourceUrl?: string; type?: string; adsConsent?: boolean };
const allowedTypes = new Set(["call_now", "whatsapp", "booking_whatsapp", "qualified_chat_lead"]);

export async function POST(request: NextRequest) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid conversion payload." }, { status: 400 });
  }
  if (body.adsConsent !== true || !body.eventId || !body.sourceUrl || !body.type || !allowedTypes.has(body.type)) {
    return NextResponse.json({ error: "Invalid conversion event." }, { status: 400 });
  }
  const result = await sendOpenAIAdsLead({ eventId: body.eventId, sourceUrl: body.sourceUrl });
  return NextResponse.json(result, { status: result.reason === "rejected" ? 502 : 200 });
}
