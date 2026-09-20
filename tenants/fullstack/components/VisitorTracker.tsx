"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { getBrowserSessionId, getBrowserVisitorId } from "@/tenants/fullstack/lib/browser-session";

type Metadata = Record<string, unknown>;

function elementMetadata(target: EventTarget | null): Metadata {
  const element = target instanceof HTMLElement ? target : null;
  const link = element?.closest("a");
  const section = element?.closest("section, header, footer, main, nav");
  return {
    tag: element?.tagName.toLowerCase() || null,
    id: element?.id?.slice(0, 120) || null,
    className: typeof element?.className === "string" ? element.className.slice(0, 240) : null,
    text: element?.innerText?.replace(/\s+/g, " ").trim().slice(0, 160) || null,
    href: link?.href?.slice(0, 1000) || null,
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
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.toString();

  useEffect(() => {
    sendEvent({ eventType: "pageview", metadata: { navigationType: performance.getEntriesByType("navigation")[0]?.entryType || "navigate" } });
  }, [pathname, query]);

  useEffect(() => {
    let lastScrollBucket = -1;
    let lastMoveAt = 0;
    let formStarted = new WeakSet<HTMLFormElement>();
    const startedAt = Date.now();

    const onClick = (event: MouseEvent) => {
      const details = elementMetadata(event.target);
      const href = typeof details.href === "string" ? details.href : "";
      const outbound = Boolean(href && new URL(href, window.location.href).origin !== window.location.origin);
      sendEvent({
        eventType: outbound ? "outbound_click" : "click",
        x: Math.round(event.clientX),
        y: Math.round(event.clientY),
        metadata: details,
      });
    };
    const onPointerMove = (event: PointerEvent) => {
      const now = Date.now();
      if (now - lastMoveAt < 2500) return;
      lastMoveAt = now;
      sendEvent({ eventType: "move", x: Math.round(event.clientX), y: Math.round(event.clientY) });
    };
    const onScroll = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const depth = scrollable > 0 ? Math.round((window.scrollY / scrollable) * 100) : 0;
      const bucket = Math.min(100, Math.floor(depth / 25) * 25);
      if (bucket === lastScrollBucket) return;
      lastScrollBucket = bucket;
      sendEvent({ eventType: "scroll", metadata: { depth: bucket } });
    };
    const onFocus = (event: FocusEvent) => {
      const target = event.target instanceof HTMLElement ? event.target : null;
      const form = target?.closest("form");
      if (!form || formStarted.has(form)) return;
      formStarted.add(form);
      sendEvent({
        eventType: "form_start",
        metadata: {
          form: form.getAttribute("aria-label") || form.id || form.className || "form",
          field: target?.getAttribute("name") || target?.getAttribute("type") || target?.tagName.toLowerCase(),
        },
      });
    };
    const onSubmit = (event: SubmitEvent) => {
      const form = event.target instanceof HTMLFormElement ? event.target : null;
      sendEvent({
        eventType: "form_submit",
        metadata: { form: form?.getAttribute("aria-label") || form?.id || form?.className || "form" },
      });
    };
    const onVisibility = () => sendEvent({ eventType: "visibility", metadata: { state: document.visibilityState } });
    const onError = (event: ErrorEvent) => sendEvent({
      eventType: "client_error",
      metadata: { message: event.message.slice(0, 300), source: event.filename?.slice(0, 500), line: event.lineno },
    });
    const onUnhandledRejection = () => sendEvent({ eventType: "client_error", metadata: { message: "Unhandled promise rejection" } });
    const onExit = () => sendEvent({ eventType: "page_exit", metadata: { durationMs: Date.now() - startedAt, scrollDepth: lastScrollBucket } }, true);
    const heartbeat = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        sendEvent({ eventType: "engagement", metadata: { durationMs: Date.now() - startedAt, scrollDepth: lastScrollBucket } });
      }
    }, 60000);

    const observers: PerformanceObserver[] = [];
    if ("PerformanceObserver" in window) {
      for (const type of ["largest-contentful-paint", "layout-shift", "event"]) {
        try {
          const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const last = entries.at(-1) as PerformanceEntry & { value?: number; duration?: number };
            if (!last) return;
            if (type === "layout-shift" && !last.value) return;
            sendEvent({
              eventType: "web_vital",
              metadata: {
                metric: type === "largest-contentful-paint" ? "LCP" : type === "layout-shift" ? "CLS" : "INP",
                value: type === "layout-shift" ? last.value : last.duration || last.startTime,
              },
            });
          });
          observer.observe({ type, buffered: true, durationThreshold: type === "event" ? 40 : undefined } as PerformanceObserverInit);
          observers.push(observer);
        } catch {
          // Browsers expose different performance entry types; unsupported types are optional.
        }
      }
    }

    window.addEventListener("click", onClick, { passive: true });
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onUnhandledRejection);
    window.addEventListener("pagehide", onExit);
    document.addEventListener("focusin", onFocus);
    document.addEventListener("submit", onSubmit);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.clearInterval(heartbeat);
      observers.forEach((observer) => observer.disconnect());
      window.removeEventListener("click", onClick);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onUnhandledRejection);
      window.removeEventListener("pagehide", onExit);
      document.removeEventListener("focusin", onFocus);
      document.removeEventListener("submit", onSubmit);
      document.removeEventListener("visibilitychange", onVisibility);
      formStarted = new WeakSet<HTMLFormElement>();
    };
  }, []);

  return null;
}
