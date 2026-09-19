"use client";

import { useEffect } from "react";
import { getBrowserSessionId, getBrowserVisitorId } from "@/app/lib/browser-session";

function sendEvent(event: {
  eventType: string;
  x?: number;
  y?: number;
  metadata?: Record<string, unknown>;
}) {
  const eventId = crypto.randomUUID();
  const fbp = document.cookie.match(/(?:^|;\s*)_fbp=([^;]+)/)?.[1];
  const fbc = document.cookie.match(/(?:^|;\s*)_fbc=([^;]+)/)?.[1];
  const payload = {
    sessionId: getBrowserSessionId(),
    path: window.location.pathname,
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
    ...event,
    metadata: {
      eventId,
      fbp,
      fbc,
      visitorId: getBrowserVisitorId(),
      ...(event.metadata || {}),
    },
  };

  if (event.eventType === "pageview") {
    window.fbq?.("track", "PageView", {}, { eventID: eventId });
  }

  void fetch("/api/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    keepalive: true,
  }).catch(() => undefined);
}

export function VisitorTracker() {
  useEffect(() => {
    sendEvent({ eventType: "pageview" });

    let lastScrollBucket = -1;
    let lastMoveAt = 0;

    const onClick = (event: MouseEvent) => {
      sendEvent({
        eventType: "click",
        x: Math.round(event.clientX),
        y: Math.round(event.clientY),
        metadata: {
          tag: (event.target as HTMLElement | null)?.tagName?.toLowerCase() || null,
        },
      });
    };

    const onPointerMove = (event: PointerEvent) => {
      const now = Date.now();
      if (now - lastMoveAt < 2500) return;
      lastMoveAt = now;
      sendEvent({
        eventType: "move",
        x: Math.round(event.clientX),
        y: Math.round(event.clientY),
      });
    };

    const onScroll = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const depth = scrollable > 0 ? Math.round((window.scrollY / scrollable) * 100) : 0;
      const bucket = Math.floor(depth / 25) * 25;
      if (bucket === lastScrollBucket) return;
      lastScrollBucket = bucket;
      sendEvent({ eventType: "scroll", metadata: { depth: bucket } });
    };

    window.addEventListener("click", onClick, { passive: true });
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("click", onClick);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return null;
}
