import { NextRequest, NextResponse } from "next/server";
import {
  CALENDAR_LINK,
  ChatMessage,
  LeadProfile,
  WHATSAPP_NUMBER,
} from "@/tenants/fullstack/lib/business-context";
import { saveLead } from "@/tenants/fullstack/lib/lead-storage";
import { sendOpenAIAdsLead } from "@/tenants/fullstack/lib/openai-ads-server";

type BookingLeadBody = {
  name?: string;
  email?: string;
  phone?: string;
  page?: string;
  sessionId?: string;
  eventId?: string;
  adsConsent?: boolean;
};

function clean(value?: string) {
  return typeof value === "string" ? value.trim().slice(0, 220) : "";
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidPhone(value: string) {
  return value.replace(/\D/g, "").length >= 7;
}

export async function POST(request: NextRequest) {
  let body: BookingLeadBody;
  try {
    body = (await request.json()) as BookingLeadBody;
  } catch {
    return NextResponse.json({ error: "Send valid booking details." }, { status: 400 });
  }

  const name = clean(body.name);
  const email = clean(body.email);
  const phone = clean(body.phone);

  if (name.length < 2 || !isValidEmail(email) || !isValidPhone(phone)) {
    return NextResponse.json(
      { error: "Name, valid email, and phone are required before booking." },
      { status: 400 },
    );
  }

  const lead: LeadProfile = {
    name,
    email,
    phone,
    projectType: "Discovery call booking request",
    summary: "Requested to book a discovery call from The Fullstack Guys website.",
    score: 88,
    intent: "high",
  };
  const transcript: ChatMessage[] = [
    {
      role: "user",
      content: `Discovery call booking request. Name: ${name}. Email: ${email}. Phone: ${phone}.`,
    },
  ];

  let saved = false;
  try {
    saved = await saveLead({
      lead,
      transcript,
      page: body.page || "booking-capture",
      userAgent: request.headers.get("user-agent"),
      hfIntent: "booking-request",
      sessionId: clean(body.sessionId),
      captureSource: "booking",
      consentContext: "Visitor submitted the booking form.",
    });
  } catch (error) {
    console.error(error);
  }

  if (!saved) {
    return NextResponse.json(
      { error: "Your details could not be saved. Please try again before booking." },
      { status: 503 },
    );
  }

  if (body.adsConsent === true && body.eventId) {
    await sendOpenAIAdsLead({
      eventId: body.eventId,
      sourceUrl: new URL(body.page || "/", request.nextUrl.origin).href,
    }).catch((error) => console.error("OpenAI Ads booking conversion failed.", error));
  }

  return NextResponse.json({
    saved,
    calendarLink: CALENDAR_LINK,
    whatsappLink: `https://wa.me/${WHATSAPP_NUMBER.replace(/\D/g, "")}`,
  });
}
