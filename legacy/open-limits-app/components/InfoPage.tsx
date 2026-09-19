import type { CSSProperties } from "react";
import Link from "next/link";
import { PrimaryAnalytics } from "@/app/components/PrimaryAnalytics";
import { Arrow, BrandLogo } from "@/app/components/BrandPrimitives";
import { InfoPageContent } from "@/app/info-content";

const fiverrLink = "https://www.fiverr.com/s/m5qDeDN";
const upworkLink =
  "https://www.upwork.com/freelancers/~016de1057b0e843c6b?mp_source=share";
const calendarLink = "https://calendar.app.google/adHW8rdFF8fZwitT6";

function renderPoint(point: string) {
  if (point.startsWith("Fiverr link: ")) {
    return (
      <a href={fiverrLink} target="_blank" rel="noreferrer">
        Order on Fiverr <Arrow diagonal />
      </a>
    );
  }

  if (point.startsWith("Upwork link: ")) {
    return (
      <a href={upworkLink} target="_blank" rel="noreferrer">
        Order on Upwork <Arrow diagonal />
      </a>
    );
  }

  return point;
}

export function InfoPage({ content }: { content: InfoPageContent }) {
  return (
    <main
      className="info-page"
      style={{ "--accent": content.accent } as CSSProperties}
    >
      <PrimaryAnalytics />
      <header className="info-header">
        <Link className="logo" href="/" aria-label="Open Limits home">
          <BrandLogo />
        </Link>
        <nav aria-label="Information navigation">
          <Link href="/#work">Work</Link>
          <Link href="/about">About</Link>
          <Link href="/process">Process</Link>
          <Link href="/pricing">Pricing</Link>
          <a href={calendarLink} target="_blank" rel="noreferrer">
            Book a call <Arrow diagonal />
          </a>
        </nav>
      </header>

      <section className="info-hero">
        <p className="kicker">{content.eyebrow}</p>
        <h1>{content.title}</h1>
        <p>{content.intro}</p>
        <div className="info-hero__actions">
          <a href={calendarLink} target="_blank" rel="noreferrer">
            Book a project call <Arrow />
          </a>
          <a href="mailto:admin@theopenlimits.com">admin@theopenlimits.com</a>
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
          <h2>Ready when the build is.</h2>
          <p>
            Flexible payments, milestone projects, Fiverr for added marketplace
            trust, Upwork at no extra cost, and 3 months support after launch.
          </p>
        </div>
        <div className="info-footer__links">
          <a href={fiverrLink} target="_blank" rel="noreferrer">
            Fiverr +20% <Arrow diagonal />
          </a>
          <a href={upworkLink} target="_blank" rel="noreferrer">
            Upwork no extra cost <Arrow diagonal />
          </a>
          <Link href="/privacy-policy">Privacy</Link>
          <Link href="/refund-policy">Refunds</Link>
          <Link href="/terms-of-use">Terms</Link>
          <Link href="/admin">Admin panel</Link>
        </div>
      </footer>
    </main>
  );
}
