"use client";

import Script from "next/script";
import { useEffect } from "react";
import { CALENDAR_LINK } from "@/app/lib/open-limits-brain";

const OPENAI_ADS_PIXEL_ID =
  process.env.NEXT_PUBLIC_OPENAI_ADS_PIXEL_ID || "5TgKHqLs9uaMYoWgBMjTCh";

declare global {
  interface Window {
    oaiq?: (...args: unknown[]) => void;
  }
}

function trackAppointment(sourceUrl: string) {
  const id = crypto.randomUUID();
  window.oaiq?.("measure", "appointment_scheduled", { type: "customer_action" });

  void fetch("/api/openai-ads-event", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id,
      type: "appointment_scheduled",
      sourceUrl,
      data: {
        destination_url: CALENDAR_LINK,
      },
    }),
    keepalive: true,
  }).catch(() => undefined);
}

export function OpenAIAdsPixel() {
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const link = (event.target as Element | null)?.closest("a");
      if (!(link instanceof HTMLAnchorElement)) return;
      if (link.href !== CALENDAR_LINK) return;
      trackAppointment(window.location.href);
    };

    document.addEventListener("click", handleClick, { capture: true });
    return () => document.removeEventListener("click", handleClick, { capture: true });
  }, []);

  return (
    <Script
      id="openai-ads-pixel"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
window.oaiq = window.oaiq || function(){(window.oaiq.q = window.oaiq.q || []).push(arguments)};
window.oaiq("init", "${OPENAI_ADS_PIXEL_ID}");
        `,
      }}
    />
  );
}
