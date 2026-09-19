"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import { Arrow, BrandLogo } from "@/tenants/fullstack/components/BrandPrimitives";
import { BookingCapture, openBookingCapture } from "@/tenants/fullstack/components/BookingCapture";
import { InfoPageContent } from "@/tenants/fullstack/info-content";

function renderPoint(point: string) { return point; }

export function InfoPage({ content }: { content: InfoPageContent }) {
  return (
    <main
      className="info-page"
      style={{ "--accent": content.accent } as CSSProperties}
    >
      <header className="info-header">
        <Link className="logo" href="/" aria-label="Nishit Gajjar home">
          <BrandLogo />
        </Link>
        <nav aria-label="Information navigation">
          <Link href="/#work">Work</Link>
          <Link href="/about">About</Link>
          <Link href="/process">Process</Link>
          <Link href="/pricing">Pricing</Link>
          <button type="button" onClick={openBookingCapture}>
            Request a call <Arrow diagonal />
          </button>
        </nav>
      </header>

      <section className="info-hero">
        <p className="kicker">{content.eyebrow}</p>
        <h1>{content.title}</h1>
        <p>{content.intro}</p>
        <div className="info-hero__actions">
          <button type="button" onClick={openBookingCapture}>
            Request a project call <Arrow />
          </button>
          <Link href="/?contact=1">Nishit Gajjar support</Link>
        </div>
        <div className="info-stat" aria-label={content.statLabel}>
          <strong>{content.stat}</strong>
          <span>{content.statLabel}</span>
        </div>
      </section>

      <section className="info-story">
        {content.sections.map((section, index) => (
          <article key={section.title} className="info-card">
            <span>{String(index + 1).padStart(2, "0")}</span>
            <h2>{section.title}</h2>
            <p>{section.body}</p>
            {section.points?.length ? (
              <ul>
                {section.points.map((point) => (
                  <li key={point}>{renderPoint(point)}</li>
                ))}
              </ul>
            ) : null}
          </article>
        ))}
      </section>

      <footer className="info-footer">
        <div>
          <h2>NISHIT GAJJAR</h2>
          <p>Independent full-stack freelancer.<br />The Fullstack Guys is Nishit&apos;s personal portfolio and project studio.</p>
          <p>
            Written scope, milestone payments, and 3 months of support after launch.
          </p>
        </div>
        <div className="info-footer__links">
          <Link href="/privacy-policy">Privacy</Link>
          <Link href="/refund-policy">Refunds</Link>
          <Link href="/terms-of-use">Terms</Link>
          <Link href="/admin">Admin panel</Link>
        </div>
      </footer>
      <BookingCapture />
    </main>
  );
}
