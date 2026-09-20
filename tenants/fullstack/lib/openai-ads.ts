"use client";

export type OpenAIAdsEvent = "lead_created" | "appointment_scheduled" | "page_viewed";

type Oaiq = (
  command: "measure",
  eventName: OpenAIAdsEvent,
  data?: Record<string, unknown>,
  options?: { event_id?: string },
) => void;

declare global {
  interface Window {
    oaiq?: Oaiq & { q?: unknown[][] };
  }
}

export function hasOpenAIAdsConsent() {
  return typeof window !== "undefined";
}

export function createOpenAIAdsEventId() {
  return crypto.randomUUID();
}

export function measureOpenAIAds(
  eventName: OpenAIAdsEvent,
  data: Record<string, unknown> = {},
  eventId = createOpenAIAdsEventId(),
) {
  if (typeof window === "undefined" || !window.oaiq || !hasOpenAIAdsConsent()) return;
  window.oaiq("measure", eventName, data, { event_id: eventId });
  return eventId;
}

export function trackOpenAILead(type: string) {
  if (!hasOpenAIAdsConsent()) return;
  const eventId = createOpenAIAdsEventId();
  measureOpenAIAds("lead_created", { type: "customer_action" }, eventId);
  void fetch("/api/openai-ads-event", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      eventId,
      type,
      sourceUrl: window.location.href,
      adsConsent: true,
    }),
    keepalive: true,
  }).catch(() => undefined);
  return eventId;
}
