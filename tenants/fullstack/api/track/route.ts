import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { saveHeatmapEvent } from "@/tenants/fullstack/lib/chat-storage";

const allowedEvents = new Set([
  "pageview",
  "click",
  "outbound_click",
  "move",
  "scroll",
  "engagement",
  "page_exit",
  "visibility",
  "form_start",
  "form_submit",
  "web_vital",
  "client_error",
]);

function text(value: unknown, max = 500) {
  return typeof value === "string" ? value.trim().slice(0, max) : null;
}

function number(value: unknown) {
  return Number.isFinite(value) ? Math.round(Number(value)) : null;
}

function publicMetadata(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .slice(0, 30)
      .map(([key, item]) => [key.slice(0, 80), typeof item === "string" ? item.slice(0, 500) : item]),
  );
}

function hashIp(request: NextRequest) {
  const ip =
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-real-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  if (!ip) return null;
  const salt = process.env.ANALYTICS_HASH_SALT || process.env.SUPABASE_SECRET_KEY;
  if (!salt) return null;
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex");
}

function locationHeader(request: NextRequest, ...names: string[]) {
  for (const name of names) {
    const value = request.headers.get(name)?.trim();
    if (!value) continue;
    try {
      return decodeURIComponent(value);
    } catch {
      return value;
    }
  }
  return null;
}

function isAdminPath(path: string | null) {
  return Boolean(
    path &&
      (path === "/admin" ||
        path.startsWith("/admin/") ||
        path === "/api/admin" ||
        path.startsWith("/api/admin/")),
  );
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const eventType = text(body?.eventType, 80);
  if (!eventType || !allowedEvents.has(eventType)) {
    return NextResponse.json({ error: "Invalid event type." }, { status: 400 });
  }

  const metadata = publicMetadata(body?.metadata);
  const visitorId = text(metadata.visitorId, 80);
  const path = text(body?.path, 1200);
  if (!text(body?.sessionId, 80) || !visitorId) {
    return NextResponse.json({ error: "Missing analytics identifiers." }, { status: 400 });
  }

  // Administrative activity is operational data, not website visitor traffic.
  // Acknowledge the beacon without creating a visitor, session, or event row.
  if (isAdminPath(path)) {
    return NextResponse.json({ ok: true, ignored: "admin_activity" });
  }

  try {
    await saveHeatmapEvent({
      sessionId: text(body?.sessionId, 80),
      visitorId,
      path,
      eventType,
      occurredAt: text(body?.occurredAt, 80),
      pageTitle: text(body?.pageTitle, 300),
      referrer: text(body?.referrer, 1200),
      x: number(body?.x),
      y: number(body?.y),
      viewportWidth: number(body?.viewportWidth),
      viewportHeight: number(body?.viewportHeight),
      screenWidth: number(body?.screenWidth),
      screenHeight: number(body?.screenHeight),
      locale: text(body?.locale, 80),
      timezone: text(body?.timezone, 120),
      userAgent: text(request.headers.get("user-agent"), 1000),
      ipHash: hashIp(request),
      country: text(locationHeader(request, "x-vercel-ip-country", "cf-ipcountry"), 10),
      region: text(locationHeader(request, "x-vercel-ip-country-region", "cf-region"), 160),
      city: text(locationHeader(request, "x-vercel-ip-city", "cf-ipcity"), 160),
      metadata,
    });
  } catch (error) {
    console.error("Analytics event was not stored.", error);
    return NextResponse.json({ error: "Tracking unavailable." }, { status: 503 });
  }

  return NextResponse.json({ ok: true });
}
