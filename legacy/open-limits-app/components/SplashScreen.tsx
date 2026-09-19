"use client";

import { useEffect, useState } from "react";
import type { CSSProperties, PointerEvent } from "react";
import { Mark } from "@/app/components/BrandPrimitives";

export function SplashScreen() {
  const [visible, setVisible] = useState(true);
  const [leaving, setLeaving] = useState(false);
  const [spotlight, setSpotlight] = useState({ x: 50, y: 50 });

  function dismiss() {
    setLeaving(true);
    window.setTimeout(() => setVisible(false), 520);
  }

  useEffect(() => {
    const leaveTimer = window.setTimeout(() => setLeaving(true), 1450);
    const removeTimer = window.setTimeout(() => setVisible(false), 2050);
    return () => {
      window.clearTimeout(leaveTimer);
      window.clearTimeout(removeTimer);
    };
  }, []);

  if (!visible) return null;

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    setSpotlight({
      x: Math.round(((event.clientX - rect.left) / rect.width) * 100),
      y: Math.round(((event.clientY - rect.top) / rect.height) * 100),
    });
  }

  return (
    <div
      className={leaving ? "site-splash site-splash--leaving" : "site-splash"}
      style={{
        "--splash-x": `${spotlight.x}%`,
        "--splash-y": `${spotlight.y}%`,
      } as CSSProperties}
      aria-label="Open Limits loading"
      onClick={dismiss}
      onPointerMove={handlePointerMove}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") dismiss();
      }}
    >
      <div className="site-splash__cursor" aria-hidden="true" />
      <div className="site-splash__grid" aria-hidden="true">
        {["Strategy", "Design", "Code", "Launch"].map((item, index) => (
          <span
            key={item}
            style={{ "--tile-delay": `${index * 105}ms` } as CSSProperties}
          >
            {item}
          </span>
        ))}
      </div>
      <div className="site-splash__mark">
        <Mark />
      </div>
      <div className="site-splash__wordmark" aria-label="OPEN LIMITS">
        {["OPEN", "LIMITS"].map((word, wordIndex) => (
          <span className="site-splash__word" key={word} aria-hidden="true">
            {word.split("").map((letter, letterIndex) => (
              <span
                className="site-splash__glyph"
                key={`${word}-${letterIndex}`}
                style={{
                  "--glyph-delay": `${wordIndex * 120 + letterIndex * 54}ms`,
                } as CSSProperties}
              >
                {letter}
              </span>
            ))}
          </span>
        ))}
      </div>
      <p>Websites / Shopify / WordPress / software</p>
      <div className="site-splash__progress" aria-hidden="true">
        <span />
      </div>
      <small>Tap to skip</small>
    </div>
  );
}
