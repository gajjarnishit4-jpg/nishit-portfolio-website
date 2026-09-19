"use client";

import { useEffect, useState } from "react";
import { BrandLogo } from "@/tenants/fullstack/components/BrandPrimitives";

export function SplashScreen() {
  const [visible, setVisible] = useState(true);
  const [leaving, setLeaving] = useState(false);

  function dismiss() {
    setLeaving(true);
    window.setTimeout(() => setVisible(false), 360);
  }

  useEffect(() => {
    const leaveTimer = window.setTimeout(() => setLeaving(true), 850);
    const removeTimer = window.setTimeout(() => setVisible(false), 1210);
    return () => {
      window.clearTimeout(leaveTimer);
      window.clearTimeout(removeTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={leaving ? "site-splash site-splash--simple site-splash--leaving" : "site-splash site-splash--simple"}
      aria-label="The Fullstack Guys is loading"
      role="status"
      aria-live="polite"
    >
      <div className="site-splash__simple-lockup">
        <BrandLogo header />
        <p>WEB · MOBILE · SHOPIFY · WORDPRESS · SOFTWARE</p>
      </div>
      <div className="site-splash__progress" aria-hidden="true"><span /></div>
      <button type="button" onClick={dismiss}>Skip</button>
    </div>
  );
}
