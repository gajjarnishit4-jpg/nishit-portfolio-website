import { NextRequest, NextResponse } from "next/server";
import { ChatMessage, DISCOUNT_CODE, LeadProfile } from "@/app/lib/open-limits-brain";
import { saveLead } from "@/app/lib/lead-storage";
import { sendMetaEvent } from "@/app/lib/meta-capi";

type DiscountLeadBody = {
  name?: string;
  email?: string;
  phone?: string;
  niche?: string;
  page?: string;
  eventId?: string;
  fbp?: string;
  fbc?: string;
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

  if (!email || !phone) {
    return NextResponse.json(
      { error: "Email and phone are required for the discount code." },
      { status: 400 },
    );
  }

  const lead: LeadProfile = {
    name: name || null,
    email,
    phone,
    niche: niche || null,
    budget: "30% off new digital project offer",
    projectType: "New digital project discount lead",
    summary: `Requested ${DISCOUNT_CODE} for a new web, software, app or commerce project${niche ? ` in ${niche}` : ""}.`,
    score: 82,
    intent: "high",
  };
  const transcript: ChatMessage[] = [
    {
      role: "user",
      content: `30% off popup lead. Name: ${name || "not provided"}. Email: ${email}. Phone: ${phone}. Niche: ${niche || "not provided"}.`,
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
    });
    await sendMetaEvent({
      eventName: "Lead",
      request,
      eventId: clean(body.eventId),
      sourceUrl: body.page || "discount-popup",
      fbp: clean(body.fbp),
      fbc: clean(body.fbc),
      lead,
      customData: {
        content_name: "Discount popup lead",
        lead_source: "discount-popup",
      },
    });
  } catch (error) {
    console.error(error);
  }

  return NextResponse.json({
    code: DISCOUNT_CODE,
    saved,
  });
}
