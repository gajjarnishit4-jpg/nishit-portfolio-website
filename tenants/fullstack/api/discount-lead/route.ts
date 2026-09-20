import { NextRequest, NextResponse } from "next/server";
import { ChatMessage, DISCOUNT_CODE, LeadProfile } from "@/tenants/fullstack/lib/business-context";
import { saveLead } from "@/tenants/fullstack/lib/lead-storage";
import { sendOpenAIAdsLead } from "@/tenants/fullstack/lib/openai-ads-server";

type DiscountLeadBody = {
  name?: string;
  email?: string;
  phone?: string;
  niche?: string;
  page?: string;
  sessionId?: string;
  eventId?: string;
  adsConsent?: boolean;
};

function clean(value?: string) {
  return typeof value === "string" ? value.trim().slice(0, 220) : "";
}

export async function POST(request: NextRequest) {
  let body: DiscountLeadBody;
  try {
    body = (await request.json()) as DiscountLeadBody;
  } catch {
    return NextResponse.json({ error: "Send valid lead details." }, { status: 400 });
  }

  const name = clean(body.name);
  const email = clean(body.email);
  const phone = clean(body.phone);
  const niche = clean(body.niche);

  if (!name || !email || !phone || !niche) {
    return NextResponse.json(
      { error: "Name, email, phone, and business niche are required for the discount code." },
      { status: 400 },
    );
  }

  const lead: LeadProfile = {
    name,
    email,
    phone,
    niche,
    budget: "30% off new digital project offer",
    projectType: "New digital project discount lead",
    summary: `Requested ${DISCOUNT_CODE} for a new web, software, app or commerce project${niche ? ` in ${niche}` : ""}.`,
    score: 82,
    intent: "high",
  };
  const transcript: ChatMessage[] = [
    {
      role: "user",
      content: `30% off popup lead. Name: ${name}. Email: ${email}. Phone: ${phone}. Niche: ${niche}.`,
    },
  ];

  let saved = false;
  try {
    saved = await saveLead({
      lead,
      transcript,
      page: body.page || "discount-popup",
      userAgent: request.headers.get("user-agent"),
      hfIntent: "discount-popup",
      sessionId: clean(body.sessionId),
      captureSource: "discount",
      consentContext: "Visitor submitted the discount form.",
    });

  } catch (error) {
    console.error(error);
  }

  if (!saved) return NextResponse.json({ error: "Your details could not be saved. Please contact Nishit directly; no inquiry has been recorded." }, { status: 503 });

  if (body.adsConsent === true && body.eventId) {
    await sendOpenAIAdsLead({
      eventId: body.eventId,
      sourceUrl: new URL(body.page || "/", request.nextUrl.origin).href,
    }).catch((error) => console.error("OpenAI Ads offer conversion failed.", error));
  }

  return NextResponse.json({
    code: DISCOUNT_CODE,
    saved,
  });
}
