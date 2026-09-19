"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, Check } from "lucide-react";
import { platformProjects } from "@/app/lib/project-showcase";
import "./platform-showcase.css";

const platforms = [
  {
    name: "Shopify",
    category: "Commerce",
    icon: "/brands/shopify.svg",
    eyebrow: "SHOPIFY COMMERCE",
    title: "A storefront with your signature.",
    text: "Distinctive design, thoughtful product pages, and a smooth path to checkout. Built for your brand and ready for its next chapter.",
    points: ["Custom storefronts", "Theme development", "Conversion tracking", "Subscriptions & apps"],
  },
  {
    name: "WordPress",
    category: "Content & publishing",
    icon: "/brands/wordpress.svg",
    eyebrow: "WORDPRESS WEBSITES",
    title: "Your story. Room to grow.",
    text: "A flexible home for your business, with beautifully structured pages, clear navigation, and content your team can keep fresh.",
    points: ["Editable CMS pages", "Service landing pages", "Blogs & resources", "Performance & SEO"],
  },
];

export function PlatformShowcase({ onDiscuss }: { onDiscuss: () => void }) {
  const [active, setActive] = useState(0);
  const [project, setProject] = useState(0);
  const [isGalleryPaused, setIsGalleryPaused] = useState(false);
  const pointer = useRef<{ id: number; x: number; y: number } | null>(null);
  const suppressClick = useRef(false);
  const selected = platformProjects[project];

  useEffect(() => {
    if (isGalleryPaused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const timer = window.setInterval(() => {
      setProject((current) => (current + 1) % platformProjects.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, [isGalleryPaused, project]);

  function changeProject(offset: number) {
    setProject((current) => (current + offset + platformProjects.length) % platformProjects.length);
  }

  function tabKeys(event: KeyboardEvent<HTMLDivElement>) {
    const next = event.key === "Home" ? 0 : event.key === "End" ? 1 :
      ["ArrowLeft", "ArrowRight"].includes(event.key) ? 1 - active : null;
    if (next === null) return;
    event.preventDefault();
    setActive(next);
    event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next]?.focus();
  }

  return (
    <section className="platform-showcase" id="platforms" aria-labelledby="platform-heading" data-platform={active}>
      <div className="content-width">
        <div className="platform-showcase-heading reveal">
          <div>
            <p className="micro-label">PLATFORM SPECIALISTS</p>
            <h2 id="platform-heading">Your business.<br /><em>Your platform.</em></h2>
          </div>
          <p>Thoughtfully designed. Built to sell, publish, and grow with you.</p>
        </div>

        <div className="platform-selector" role="tablist" aria-label="Website platform" onKeyDown={tabKeys} style={{ "--selected-platform": active } as CSSProperties}>
          {platforms.map((platform, index) => (
            <button
              key={platform.name}
              id={`platform-tab-${index}`}
              role="tab"
              aria-selected={active === index}
              aria-controls={`platform-panel-${index}`}
              tabIndex={active === index ? 0 : -1}
              onClick={() => setActive(index)}
            >
              <Image src={platform.icon} alt="" width={30} height={30} />
              <span>{platform.name}<small>{platform.category}</small></span>
              <ArrowUpRight size={19} aria-hidden="true" />
            </button>
          ))}
        </div>

        <div className="platform-showcase-body">
          <div className="platform-copy-viewport">
            <div className="platform-copy-track" style={{ transform: `translateX(-${active * 100}%)` }}>
              {platforms.map((platform, index) => (
                <article
                  className="platform-detail"
                  key={platform.name}
                  id={`platform-panel-${index}`}
                  role="tabpanel"
                  aria-labelledby={`platform-tab-${index}`}
                  aria-hidden={active !== index}
                  inert={active !== index}
                  tabIndex={0}
                >
                  <p className="micro-label"><span>0{index + 1}</span> {platform.eyebrow}</p>
                  <h3>{platform.title}</h3>
                  <p className="platform-detail-text">{platform.text}</p>
                  <ul>
                    {platform.points.map((point) => <li key={point}><Check size={14} aria-hidden="true" />{point}</li>)}
                  </ul>
                  <button className="platform-discuss" onClick={onDiscuss}>
                    Discuss {platform.name} <ArrowUpRight size={17} />
                  </button>
                </article>
              ))}
            </div>
          </div>

          <div
            className="platform-project-gallery"
            role="region"
            aria-roledescription="carousel"
            aria-label="Selected websites and commerce projects"
            aria-live={isGalleryPaused ? "polite" : "off"}
            onMouseOver={(event) => {
              const from = event.relatedTarget as Node | null;
              if (!from || !event.currentTarget.contains(from)) setIsGalleryPaused(true);
            }}
            onMouseOut={(event) => {
              const to = event.relatedTarget as Node | null;
              if (!to || !event.currentTarget.contains(to)) setIsGalleryPaused(false);
            }}
            onFocusCapture={() => setIsGalleryPaused(true)}
            onBlurCapture={(event) => {
              const nextFocus = event.relatedTarget as Node | null;
              if (!nextFocus || !event.currentTarget.contains(nextFocus)) setIsGalleryPaused(false);
            }}
          >
            <div className="platform-gallery-label"><span>FROM OUR PORTFOLIO</span><span>Websites & commerce</span></div>
            <div
              className="platform-project-viewport"
              onDragStart={(event) => event.preventDefault()}
              onPointerDown={(event) => {
                if (!event.isPrimary || event.button !== 0) return;
                setIsGalleryPaused(true);
                pointer.current = { id: event.pointerId, x: event.clientX, y: event.clientY };
                suppressClick.current = false;
              }}
              onPointerMove={(event) => {
                const start = pointer.current;
                if (!start || start.id !== event.pointerId) return;
                const dx = event.clientX - start.x;
                const dy = event.clientY - start.y;
                if (Math.abs(dx) > 12 && Math.abs(dx) > Math.abs(dy) * 1.4) {
                  suppressClick.current = true;
                  event.currentTarget.setPointerCapture(event.pointerId);
                }
              }}
              onPointerUp={(event) => {
                const start = pointer.current;
                pointer.current = null;
                setIsGalleryPaused(false);
                if (!start || start.id !== event.pointerId) return;
                const dx = event.clientX - start.x;
                const dy = event.clientY - start.y;
                if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.4) changeProject(dx < 0 ? 1 : -1);
              }}
              onPointerCancel={() => { pointer.current = null; setIsGalleryPaused(false); }}
              onClickCapture={(event) => {
                if (suppressClick.current) { event.preventDefault(); event.stopPropagation(); suppressClick.current = false; }
              }}
            >
              <div className="platform-project-track" style={{ transform: `translateX(-${project * 100}%)` }}>
                {platformProjects.map((item, index) => (
                  <a href={item.url} target="_blank" rel="noreferrer" key={item.title}
                    aria-label={`Visit ${item.title}`} aria-hidden={project !== index} inert={project !== index} tabIndex={project === index ? 0 : -1}
                    className="platform-project-slide">
                    <Image src={item.image} alt={`${item.title} website`} width={1400} height={788} unoptimized draggable={false} loading={index === project ? "eager" : "lazy"} />
                  </a>
                ))}
              </div>
            </div>
            <div className="platform-project-footer">
              <div className="platform-project-caption" aria-live="polite" aria-atomic="true">
                <a href={selected.url} target="_blank" rel="noreferrer">{selected.title} <ArrowUpRight size={16} /></a>
                <span>{selected.metric}</span>
              </div>
              <div className="platform-project-controls">
                <button onClick={() => changeProject(-1)} aria-label="Previous platform project" title="Previous project"><ArrowLeft size={18} /></button>
                <span>
                  {String(project + 1).padStart(2, "0")}
                  <small> / {String(platformProjects.length).padStart(2, "0")}</small>
                  <b>{isGalleryPaused ? "PAUSED" : "AUTO"}</b>
                </span>
                <button onClick={() => changeProject(1)} aria-label="Next platform project" title="Next project"><ArrowRight size={18} /></button>
              </div>
            </div>
            <div className="platform-project-pagination" role="group" aria-label="Choose a portfolio project">
              {platformProjects.map((item, index) => (
                <button key={item.title} aria-label={`Show ${item.title}`} aria-pressed={index === project} onClick={() => setProject(index)}><span /></button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
