"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { measureOpenAIAds } from "@/tenants/fullstack/lib/openai-ads";

const CONSENT_KEY = "fullstack-openai-ads-consent";
type Consent = "accepted" | "declined" | "unknown";
type OaiqCommand = (
  command: "init" | "consent",
  value: { pixelId: string; debug: boolean } | boolean,
) => void;

function readConsent(): Consent {
  try {
    const value = localStorage.getItem(CONSENT_KEY);
    return value === "accepted" || value === "declined" ? value : "unknown";
  } catch {
    return "unknown";
  }
}

export function OpenAIAdsPixel() {
  const pathname = usePathname();
  const [consent, setConsent] = useState<Consent>("unknown");
  const [ready, setReady] = useState(false);
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
    const oaiq = window.oaiq as unknown as OaiqCommand | undefined;
    oaiq?.("consent", next === "accepted");
  }

  return (
    <>
      {consent === "unknown" ? (
        <aside className="ads-consent" aria-label="Advertising measurement choice">
          <p>Allow optional OpenAI Ads measurement? It helps Nishit understand which ads lead to genuine project inquiries.</p>
          <div>
            <button type="button" onClick={() => choose("declined")}>Not now</button>
            <button type="button" onClick={() => choose("accepted")}>Allow measurement</button>
          </div>
        </aside>
      ) : null}
    </>
  );
}
