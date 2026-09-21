"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { measureOpenAIAds } from "@/tenants/fullstack/lib/openai-ads";

const CONSENT_KEY = "fullstack-openai-ads-consent";
const PIXEL_ID = process.env.NEXT_PUBLIC_OPENAI_ADS_PIXEL_ID || "LB7HC8FkK1wXF6pY2WKtN5";
const SDK_SRC = "https://bzrcdn.openai.com/sdk/oaiq.min.js";
type Consent = "accepted" | "declined" | "unknown";
type OaiqQueue = ((...args: unknown[]) => void) & { q?: unknown[][] };

function readConsent(): Consent {
  try {
    const value = localStorage.getItem(CONSENT_KEY);
    return value === "accepted" || value === "declined" ? value : "unknown";
  } catch {
    return "unknown";
  }
}

function initializePixel() {
  let oaiq = window.oaiq as unknown as OaiqQueue | undefined;
  if (!oaiq) {
    const queue = ((...args: unknown[]) => queue.q?.push(args)) as OaiqQueue;
    queue.q = [];
    oaiq = queue;
    window.oaiq = queue as typeof window.oaiq;
  }

  if (!document.querySelector('script[data-openai-ads-pixel="true"]')) {
    const script = document.createElement("script");
    script.async = true;
    script.src = SDK_SRC;
    script.dataset.openaiAdsPixel = "true";
    document.head.appendChild(script);
  }

  oaiq("consent", true);
  oaiq("init", { pixelId: PIXEL_ID, debug: process.env.NODE_ENV === "development" });
}

export function OpenAIAdsPixel() {
  const pathname = usePathname();
  const [consent, setConsent] = useState<Consent>("unknown");
  const [ready, setReady] = useState(false);
  const [choiceOpen, setChoiceOpen] = useState(false);
  const lastPage = useRef("");

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setConsent(readConsent());
      setReady(true);
    });
    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    if (!ready || consent !== "accepted" || lastPage.current === pathname) return;
    initializePixel();
    lastPage.current = pathname;
    measureOpenAIAds("page_viewed", { type: "website_page" });
  }, [consent, pathname, ready]);

  function choose(next: Exclude<Consent, "unknown">) {
    try {
      localStorage.setItem(CONSENT_KEY, next);
    } catch {
      // Apply the choice for this page even when storage is unavailable.
    }
    setConsent(next);
    setChoiceOpen(false);
    if (next === "declined") {
      const oaiq = window.oaiq as unknown as OaiqQueue | undefined;
      oaiq?.("consent", false);
    }
  }

  return (
    <>
      {choiceOpen ? (
        <aside className="ads-consent" id="advertising-measurement-choices" aria-label="Advertising measurement choice">
          <p>
            Optional advertising measurement helps Nishit understand which ads lead to
            project inquiries. It stays off unless you allow it.
          </p>
          <div>
            <button type="button" onClick={() => choose("declined")}>Decline</button>
            <button type="button" onClick={() => choose("accepted")}>Allow measurement</button>
          </div>
        </aside>
      ) : null}
      <button
        className="ads-consent-manage"
        type="button"
        aria-expanded={choiceOpen}
        aria-controls="advertising-measurement-choices"
        onClick={() => setChoiceOpen((current) => !current)}
      >
        Privacy choices{consent === "unknown" ? " · optional off" : ""}
      </button>
    </>
  );
}
