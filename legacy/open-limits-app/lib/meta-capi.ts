import { createHash } from "node:crypto";
import { NextRequest } from "next/server";
import { LeadProfile } from "@/app/lib/open-limits-brain";

const META_CAPI_VERSION = "v20.0";
const META_PIXEL_ID = process.env.META_PIXEL_ID || "1385887806813423";
const META_CAPI_ACCESS_TOKEN = process.env.META_CAPI_ACCESS_TOKEN;
const META_TEST_EVENT_CODE = process.env.META_TEST_EVENT_CODE;

type MetaEventName = "PageView" | "Lead";

type MetaEventInput = {
  eventName: MetaEventName;
  request: NextRequest;
  eventId?: string | null;
  sourceUrl?: string | null;
  fbp?: string | null;
  fbc?: string | null;
  lead?: LeadProfile | null;
  customData?: Record<string, unknown>;
};

function sha256(value?: string | null) {
  const normalized = value?.trim().toLowerCase();
  if (!normalized) return undefined;
  return createHash("sha256").update(normalized).digest("hex");
}

function cleanPhone(value?: string | null) {
  return value?.replace(/[^\d+]/g, "") || undefined;
}

function getClientIp(request: NextRequest) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    undefined
  );
}

function getSourceUrl(request: NextRequest, sourceUrl?: string | null) {
  if (sourceUrl?.startsWith("http")) return sourceUrl;
  const origin = request.nextUrl.origin;
  if (sourceUrl?.startsWith("/")) return `${origin}${sourceUrl}`;
  return request.headers.get("referer") || origin;
}

export async function sendMetaEvent({
  eventName,
  request,
  eventId,
  sourceUrl,
  fbp,
  fbc,
  lead,
  customData,
}: MetaEventInput) {
  if (!META_CAPI_ACCESS_TOKEN || !META_PIXEL_ID) return;

  const userData: Record<string, string> = {
    client_user_agent: request.headers.get("user-agent") || "",
  };
  const clientIp = getClientIp(request);
  const emailHash = sha256(lead?.email);
  const phoneHash = sha256(cleanPhone(lead?.phone));
  const firstNameHash = sha256(lead?.name?.split(/\s+/)[0]);
  const lastNameHash = sha256(lead?.name?.split(/\s+/).slice(1).join(" "));
  const cookieFbp = request.cookies.get("_fbp")?.value;
  const cookieFbc = request.cookies.get("_fbc")?.value;

  if (clientIp) userData.client_ip_address = clientIp;
  if (fbp || cookieFbp) userData.fbp = fbp || cookieFbp || "";
  if (fbc || cookieFbc) userData.fbc = fbc || cookieFbc || "";
  if (emailHash) userData.em = emailHash;
  if (phoneHash) userData.ph = phoneHash;
  if (firstNameHash) userData.fn = firstNameHash;
  if (lastNameHash) userData.ln = lastNameHash;

  const payload: Record<string, unknown> = {
    data: [
      {
        event_name: eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_id: eventId || undefined,
        action_source: "website",
        event_source_url: getSourceUrl(request, sourceUrl),
        user_data: userData,
        custom_data: customData,
      },
    ],
  };

  if (META_TEST_EVENT_CODE) payload.test_event_code = META_TEST_EVENT_CODE;

  try {
    const response = await fetch(
      `https://graph.facebook.com/${META_CAPI_VERSION}/${META_PIXEL_ID}/events?access_token=${encodeURIComponent(
        META_CAPI_ACCESS_TOKEN,
      )}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        cache: "no-store",
      },
    );

    if (!response.ok) {
      console.error("Meta CAPI failed", await response.text());
    }
  } catch (error) {
    console.error("Meta CAPI error", error);
  }
}
