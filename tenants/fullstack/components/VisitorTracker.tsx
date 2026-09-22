"use client";

import { useEffect } from "react";
import { getBrowserSessionId, getBrowserVisitorId } from "@/tenants/fullstack/lib/browser-session";

type Metadata = Record<string, unknown>;

function elementMetadata(target: EventTarget | null): Metadata {
  const element = target instanceof HTMLElement ? target : null;
  const mainEvent = element?.closest<HTMLElement>("[data-main-event]")?.dataset.mainEvent || null;
  const link = element?.closest("a");
  const section = element?.closest("section, header, footer, main, nav");
  return {
    tag: element?.tagName.toLowerCase() || null,
    id: element?.id?.slice(0, 120) || null,
    className: typeof element?.className === "string" ? element.className.slice(0, 240) : null,
    text: element?.innerText?.replace(/\s+/g, " ").trim().slice(0, 160) || null,
    href: link?.href?.slice(0, 1000) || null,
    mainEvent,
    section: section?.id || section?.getAttribute("aria-label") || section?.tagName.toLowerCase() || null,
  };
}

function sendEvent(event: {
  eventType: string;
  x?: number;
  y?: number;
  metadata?: Metadata;
}, useBeacon = false) {
  const currentUrl = new URL(window.location.href);
  const trafficSource =
    currentUrl.searchParams.has("oppref") || currentUrl.searchParams.has("olref")
      ? "OpenAI Ads"
      : currentUrl.searchParams.get("utm_source") || null;
  const payload = JSON.stringify({
    sessionId: getBrowserSessionId(),
    // Do not retain opaque campaign reference tokens in visitor analytics.
    path: currentUrl.pathname,
    pageTitle: document.title,
    referrer: document.referrer || null,
    occurredAt: new Date().toISOString(),
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    locale: navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    ...event,
    metadata: {
      eventId: crypto.randomUUID(),
      visitorId: getBrowserVisitorId(),
      trafficSource,
      connection: (navigator as Navigator & { connection?: { effectiveType?: string } }).connection?.effectiveType || null,
      ...(event.metadata || {}),
    },
  });

  if (useBeacon && navigator.sendBeacon) {
    navigator.sendBeacon("/api/track", new Blob([payload], { type: "application/json" }));
    return;
  }
  void fetch("/api/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: payload,
    keepalive: true,
  }).catch(() => undefined);
}

export function VisitorTracker() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const details = elementMetadata(event.target);
      if (!details.mainEvent) return;
      const href = typeof details.href === "string" ? details.href : "";
      const outbound = Boolean(href && new URL(href, window.location.href).origin !== window.location.origin);
      sendEvent({
        eventType: outbound ? "outbound_click" : "click",
        x: Math.round(event.clientX),
        y: Math.round(event.clientY),
        metadata: details,
      });
    };

    window.addEventListener("click", onClick, { passive: true });

    return () => {
      window.removeEventListener("click", onClick);
    };
  }, []);

  return null;
}
