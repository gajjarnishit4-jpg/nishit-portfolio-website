"use client";

import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type KeyboardEvent,
} from "react";
import {
  ArrowUpRight,
  ArrowRight,
  ArrowLeft,
  ArrowDown,
  Plus,
  Minus,
  Menu,
  X,
  Play,
  Pause,
  Check,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  BadgeCheck,
  Star,
} from "lucide-react";
import { BrandLogo } from "@/tenants/fullstack/components/BrandPrimitives";
import { LeadChat } from "@/tenants/fullstack/components/LeadChat";
import { PlatformShowcase } from "@/tenants/fullstack/components/PlatformShowcase";
import { DiscountPopup } from "@/tenants/fullstack/components/DiscountPopup";
import { VisitorTracker } from "@/tenants/fullstack/components/VisitorTracker";
import { OpenAIAdsPixel } from "@/tenants/fullstack/components/OpenAIAdsPixel";
import { BookingCapture, openBookingCapture } from "@/tenants/fullstack/components/BookingCapture";
import { type Project } from "@/tenants/fullstack/lib/projects";
import {
  heroProjects as gallery,
  serviceProjects,
  workProjects,
  showcaseProjects,
} from "@/tenants/fullstack/lib/project-showcase";
import { services, stages, faqs } from "@/tenants/fullstack/lib/studio-content";
import { useStudioMotion } from "@/tenants/fullstack/lib/use-studio-motion";

const filters = ["All", "Brand Web", "Software", "Commerce"] as const;
const serviceLabels = [
  "WEB",
  "SOFTWARE",
  "MOBILE",
  "AI & AUTOMATION",
  "COMMERCE",
  "DESIGN",
];
const studioReelVideo =
  "https://video.gumlet.io/6873c98d14683753e66e90d2/6aa1070c2f578a19ae51fac3/main.mp4";
const fiverrLink = "https://www.fiverr.com/s/m5qDeDN";
const upworkLink =
  "https://www.upwork.com/freelancers/~016de1057b0e843c6b?mp_source=share";
const trustpilotLink = "https://www.trustpilot.com/review/theopenlimits.com";
const dribbbleLink = "https://dribbble.com/ojas314";
const behanceLink = "https://www.behance.net/ojasdixit1";
const designProfiles = [
  {
    platform: "Dribbble",
    handle: "Ojas Dixit / @ojas314",
    description: "Polished interface concepts, commerce experiences, and visual explorations—presented as a quick, highly visual portfolio.",
    href: dribbbleLink,
    mark: "Dr",
  },
  {
    platform: "Behance",
    handle: "Ojas Dixit / ojasdixit1",
    description: "Extended design case studies, art direction, and the thinking behind complete digital experiences.",
    href: behanceLink,
    mark: "Bē",
  },
];
const designShowcase = [
  {
    title: "Tato Pow",
    discipline: "E-commerce · UX/UI",
    image: "/tenant-assets/fullstack/portfolio/project-11.jpg",
  },
  {
    title: "Penrose Skin",
    discipline: "Art direction · Commerce",
    image: "/tenant-assets/fullstack/portfolio/project-13.jpg",
  },
  {
    title: "Emani",
    discipline: "Beauty · Digital experience",
    image: "/tenant-assets/fullstack/portfolio/project-05.jpg",
  },
];
const offerSlide = {
  eyebrow: "NEW PROJECT OFFER",
  title: "Launch with a sharper first sprint.",
  text: "For serious new builds, Nishit can shape the first phase around website direction, conversion structure, responsive design, and the technical roadmap before the full quote.",
  points: ["Discovery call", "UX direction", "Build roadmap", "Tracking plan"],
};
const comparisonPoints = [
  {
    title: "The work is real.",
    text: "Explore live websites and products across commerce, services, and software. See the details for yourself.",
  },
  {
    title: "One accountable partner.",
    text: "Strategy, design, websites, Shopify, WordPress, mobile apps, and custom software—with one direct point of ownership.",
  },
  {
    title: "Clarity before cost.",
    text: "Nishit maps your requirements, priorities, and integrations, then shapes a personalized quote around the actual work.",
  },
  {
    title: "Your way to work.",
    text: "Speak directly with Nishit Gajjar—the person designing and building the work—and keep the scope, approvals, and project communications clear.",
  },
];

const trustSignals = [
  {
    platform: "Upwork",
    score: "Top Rated",
    text: "1,200 hours worked across 150 projects—an established freelance track record you can review directly.",
    logo: "/tenant-assets/fullstack/brands/upwork.svg",
    label: "View Nishit's Upwork profile",
    href: upworkLink,
  },
  {
    platform: "Fiverr",
    score: "4.9",
    text: "200+ projects delivered on Fiverr, backed by public client feedback and completed orders.",
    logo: "/tenant-assets/fullstack/brands/fiverr.svg",
    label: "View Nishit's Fiverr profile",
    href: fiverrLink,
  },
];

function RatingStars({ rating }: { rating: number }) {
  return (
    <span className="proof-stars" role="img" aria-label={`${rating} out of 5 stars`}>
      {[0, 1, 2, 3, 4].map((index) => (
        <span className="proof-star" key={index} aria-hidden="true">
          <Star size={18} fill="currentColor" strokeWidth={0} />
          <span style={{ width: `${Math.min(1, Math.max(0, rating - index)) * 100}%` }}>
            <Star size={18} fill="currentColor" strokeWidth={0} />
          </span>
        </span>
      ))}
    </span>
  );
}


function subscribeMotion(callback: () => void) {
  const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
  preference.addEventListener("change", callback);
  return () => preference.removeEventListener("change", callback);
}
function readMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
function serverMotion() {
  return false;
}

function tabKeys(
  event: KeyboardEvent<HTMLDivElement>,
  index: number,
  count: number,
  select: (value: number) => void,
) {
  const next =
    event.key === "Home"
      ? 0
      : event.key === "End"
        ? count - 1
        : ["ArrowRight", "ArrowDown"].includes(event.key)
          ? (index + 1) % count
          : ["ArrowLeft", "ArrowUp"].includes(event.key)
            ? (index - 1 + count) % count
            : null;
  if (next === null) return;
  event.preventDefault();
  select(next);
  event.currentTarget
    .querySelectorAll<HTMLButtonElement>('[role="tab"]')
    [next]?.focus();
}

function ServiceDial({
  active,
  onChange,
}: {
  active: number;
  onChange: (index: number) => void;
}) {
  return (
    <div
      className="expertise-dial"
      role="tablist"
      aria-label="Choose a service"
      onKeyDown={(event) => tabKeys(event, active, services.length, onChange)}
    >
      <div
        className="dial-ring"
        aria-hidden="true"
        style={{ rotate: active * 60 + "deg" }}
      >
        {Array.from({ length: 48 }, (_, index) => (
          <i key={index} style={{ rotate: index * 7.5 + "deg" }} />
        ))}
      </div>
      <div className="dial-center" aria-hidden="true">
        <span>0{active + 1}</span>
        <small>NISHIT&apos;S EXPERTISE</small>
        <ArrowUpRight size={23} />
      </div>
      {services.map((service, index) => (
        <button
          key={service.kind}
          role="tab"
          id={"service-tab-" + index}
          aria-label={service.name}
          aria-selected={index === active}
          aria-controls="service-panel"
          tabIndex={index === active ? 0 : -1}
          className={index === active ? "dial-option is-active" : "dial-option"}
          style={
            {
              "--angle": index * 60 + "deg",
              left: 50 + Math.sin((index * Math.PI) / 3) * 38 + "%",
              top: 50 - Math.cos((index * Math.PI) / 3) * 38 + "%",
            } as CSSProperties
          }
          onClick={() => onChange(index)}
        >
          <span>{serviceLabels[index]}</span>
        </button>
      ))}
    </div>
  );
}

async function playVideoWithSound(video: HTMLVideoElement | null) {
  if (!video) return;
  video.volume = 0.8;
  video.muted = false;
  try {
    await video.play();
  } catch {
    video.muted = true;
    await video.play().catch(() => undefined);
  }
}

async function playMutedVideo(video: HTMLVideoElement | null) {
  if (!video) return;
  video.muted = true;
  video.volume = 0;
  await video.play().catch(() => undefined);
}

function stopMutedVideo(video: HTMLVideoElement | null) {
  if (!video) return;
  video.pause();
  video.muted = true;
  video.volume = 0;
}

type MobileFullscreenVideo = HTMLVideoElement & {
  webkitEnterFullscreen?: () => void;
};

type LockableScreenOrientation = ScreenOrientation & {
  lock?: (orientation: "landscape") => Promise<void>;
};

function enterMobileLandscape(video: HTMLVideoElement | null) {
  if (!video || !window.matchMedia("(max-width: 900px)").matches) return;

  const mobileVideo = video as MobileFullscreenVideo;
  if (typeof mobileVideo.webkitEnterFullscreen === "function") {
    mobileVideo.webkitEnterFullscreen();
    return;
  }

  if (!video.requestFullscreen) return;
  void video.requestFullscreen().then(() => {
    const orientation = screen.orientation as LockableScreenOrientation;
    return orientation.lock?.("landscape");
  }).catch(() => undefined);
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const contactRequested = useSearchParams().get("contact") === "1";

  useEffect(() => {
    if (!contactRequested) return;
    const frame = window.requestAnimationFrame(() => setChatOpen(true));
    return () => window.cancelAnimationFrame(frame);
  }, [contactRequested]);
  const [offerOpen, setOfferOpen] = useState(false);
  const [activeSlide, setActiveSlide] = useState(2);
  const [service, setService] = useState(0);
  const [stage, setStage] = useState(0);
  const [expandedPrinciple, setExpandedPrinciple] = useState<number | null>(0);
  const [filter, setFilter] = useState<"All" | Project["category"]>("All");
  const [visibleCount, setVisibleCount] = useState(4);
  const [motion, setMotion] = useState(true);
  const [galleryFocused, setGalleryFocused] = useState(false);
  const [reelOpen, setReelOpen] = useState(false);
  const reducedMotion = useSyncExternalStore(
    subscribeMotion,
    readMotion,
    serverMotion,
  );
  const moving = motion && !reducedMotion;
  const rootRef = useRef<HTMLElement>(null);
  const reelRef = useRef<HTMLDialogElement>(null);
  const reelStageRef = useRef<HTMLDivElement>(null);
  const reelPreviewRef = useRef<HTMLVideoElement>(null);
  const reelVideoRef = useRef<HTMLVideoElement>(null);
  const swipeStart = useRef<{ x: number; y: number } | null>(null);
  const dragged = useRef(false);
  const reelButtonRef = useRef<HTMLButtonElement>(null);
  const closeReel = useCallback(() => {
    const preview = reelPreviewRef.current;
    setReelOpen(false);
    reelVideoRef.current?.pause();
    reelRef.current?.close();
    if (document.fullscreenElement) {
      void document.exitFullscreen().catch(() => undefined);
    }
    screen.orientation?.unlock?.();
    if (preview) {
      stopMutedVideo(preview);
      preview.currentTime = 0;
    }
    reelButtonRef.current?.focus({ preventScroll: true });
  }, []);
  useStudioMotion(
    rootRef,
    moving && !menuOpen && !reelOpen && !chatOpen && !offerOpen,
  );
  const filtered =
    filter === "All"
      ? workProjects
      : workProjects.filter((project) => project.category === filter);
  const currentService = services[service];
  const openChat = () => {
    setMenuOpen(false);
    setChatOpen(true);
  };

  useEffect(() => {
    if (!moving || galleryFocused || reelOpen) return;
    const interval = window.setInterval(
      () => setActiveSlide((index) => (index + 1) % gallery.length),
      4200,
    );
    return () => window.clearInterval(interval);
  }, [moving, galleryFocused, reelOpen, activeSlide]);

  useEffect(() => {
    const stage = reelStageRef.current;
    const button = reelButtonRef.current;
    const preview = reelPreviewRef.current;
    if (!stage || !button || !preview) return;

    let frame = 0;
    const updateProgress = () => {
      frame = 0;
      // Measure the untransformed stage so scaling cannot change its own trigger.
      const rect = stage.getBoundingClientRect();
      const viewport = window.innerHeight || 1;
      const progress = Math.min(
        1,
        Math.max(0, (viewport * 0.72 - rect.top) / (viewport * 0.48)),
      );
      const eased = moving ? progress * progress * (3 - 2 * progress) : 1;
      stage.style.setProperty("--reel-progress", eased.toFixed(4));
    };
    const requestProgress = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(updateProgress);
    };
    let visible = false;
    const updatePlayback = () => {
      if (visible && !reelOpen && moving && !document.hidden) {
        playMutedVideo(preview);
      } else {
        stopMutedVideo(preview);
      }
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting && entry.intersectionRatio >= 0.15;
        updatePlayback();
      },
      { threshold: [0, 0.15] },
    );
    const resizeObserver = new ResizeObserver(requestProgress);

    updateProgress();
    observer.observe(button);
    resizeObserver.observe(stage);
    if (rootRef.current) resizeObserver.observe(rootRef.current);
    window.addEventListener("scroll", requestProgress, { passive: true });
    window.addEventListener("resize", requestProgress);
    document.addEventListener("visibilitychange", updatePlayback);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      observer.disconnect();
      resizeObserver.disconnect();
      window.removeEventListener("scroll", requestProgress);
      window.removeEventListener("resize", requestProgress);
      document.removeEventListener("visibilitychange", updatePlayback);
      stopMutedVideo(preview);
    };
  }, [reelOpen, moving]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, index) => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).style.setProperty(
              "--reveal-delay",
              Math.min(index * 70, 210) + "ms",
            );
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08 },
    );
    root
      .querySelectorAll(".reveal")
      .forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [visibleCount, filter]);

  useEffect(() => {
    if (!reelOpen && !menuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const close = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        if (reelOpen) closeReel();
      }
    };
    window.addEventListener("keydown", close);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", close);
    };
  }, [reelOpen, menuOpen, closeReel]);

  function openReel() {
    stopMutedVideo(reelPreviewRef.current);
    setReelOpen(true);
    reelRef.current?.showModal();
    const video = reelVideoRef.current;
    void playVideoWithSound(video);
    enterMobileLandscape(video);
  }
  return (
    <main
      ref={rootRef}
      className={
        "studio-site creative-site" + (!moving ? " motion-paused" : "")
      }
    >
      <header className="floating-header">
        <Link className="floating-brand" href="/" aria-label="Nishit Gajjar home">
          <BrandLogo header />
        </Link>
        <nav className="floating-nav" aria-label="Main navigation">
          <a href="#about">About</a>
          <a href="#services">Services</a>
          <a href="#proof">Proof</a>
          <a href="#design-work">Design</a>
          <a href="#platforms">Platforms</a>
          <a href="#work">Projects</a>
          <Link href="/blog">Blog</Link>
          <Link href="/news">News</Link>
          <a href="#faqs">FAQs</a>
        </nav>
        <button
          className="floating-menu"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={17} /> : <Menu size={17} />}
          <span>Menu</span>
        </button>
        <button className="accent-button nav-contact" onClick={openChat}>
          Let&apos;s talk <ArrowUpRight size={16} />
        </button>
      </header>
      {menuOpen && (
        <nav
          id="mobile-navigation"
          className="mobile-navigation"
          aria-label="Mobile navigation"
        >
          <p className="micro-label">THE FULLSTACK GUYS · NISHIT GAJJAR</p>
          {[
            ["About", "#about"],
            ["Services", "#services"],
            ["Proof", "#proof"],
            ["Design", "#design-work"],
            ["Platforms", "#platforms"],
            ["Projects", "#work"],
            ["Blog", "/blog"],
            ["News", "/news"],
            ["FAQs", "#faqs"],
          ].map(([name, href], index) => (
            <a key={href} href={href} onClick={() => setMenuOpen(false)}>
              <small>0{index + 1}</small>
              {name}
              <ArrowUpRight />
            </a>
          ))}
          <Link className="mobile-email" href="/?contact=1">
            Nishit Gajjar support
          </Link>
        </nav>
      )}

      <section className="creative-hero" id="top">
        <div className="hero-guides" aria-hidden="true">
          <i />
          <i />
          <i />
        </div>
        <div className="creative-hero-title">
          <p className="micro-label">THE FULLSTACK GUYS / BY NISHIT GAJJAR</p>
          <h1>
            <span className="hero-title-line">
              <span>Websites, Shopify</span>
            </span>
            <span className="hero-title-line">
              <span>apps & software.</span>
            </span>
          </h1>
          <p>
            Shopify, WordPress, Next.js, apps, and custom systems.
            <br />
            Digital experiences that move your business forward.
          </p>
        </div>
        <div
          className="hero-gallery"
          aria-label="Featured digital experiences"
          aria-roledescription="carousel"
          onMouseEnter={() => setGalleryFocused(true)}
          onMouseLeave={() => setGalleryFocused(false)}
          onFocusCapture={() => setGalleryFocused(true)}
          onBlurCapture={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node))
              setGalleryFocused(false);
          }}
          onPointerDown={(event) => {
            if (event.button !== 0) return;
            swipeStart.current = { x: event.clientX, y: event.clientY };
            dragged.current = false;
          }}
          onPointerMove={(event) => {
            const start = swipeStart.current;
            if (!start) return;
            const delta = event.clientX - start.x;
            if (
              !dragged.current &&
              Math.abs(event.clientY - start.y) > Math.abs(delta) + 8
            ) {
              swipeStart.current = null;
              return;
            }
            if (Math.abs(delta) > 6) {
              dragged.current = true;
              event.currentTarget.setPointerCapture(event.pointerId);
              event.currentTarget.classList.add("is-dragging");
              event.currentTarget.style.setProperty(
                "--drag-x",
                delta * 0.65 + "px",
              );
            }
          }}
          onPointerUp={(event) => {
            if (
              swipeStart.current !== null &&
              Math.abs(event.clientX - swipeStart.current.x) > 35
            ) {
              dragged.current = true;
              const direction = event.clientX < swipeStart.current.x ? 1 : -1;
              setActiveSlide(
                (index) =>
                  (index + direction + gallery.length) % gallery.length,
              );
            }
            event.currentTarget.classList.remove("is-dragging");
            event.currentTarget.style.setProperty("--drag-x", "0px");
            if (event.currentTarget.hasPointerCapture(event.pointerId))
              event.currentTarget.releasePointerCapture(event.pointerId);
            swipeStart.current = null;
          }}
          onPointerCancel={(event) => {
            swipeStart.current = null;
            event.currentTarget.classList.remove("is-dragging");
            event.currentTarget.style.setProperty("--drag-x", "0px");
          }}
          onKeyDown={(event) => {
            if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;
            event.preventDefault();
            setActiveSlide(
              (index) =>
                (index +
                  (event.key === "ArrowRight" ? 1 : -1) +
                  gallery.length) %
                gallery.length,
            );
          }}
        >
          {gallery.map((item, index) => {
            let position =
              (index - activeSlide + gallery.length) % gallery.length;
            if (position > Math.floor(gallery.length / 2))
              position -= gallery.length;
            return (
              <a
                key={item.title}
                data-distance={Math.abs(position)}
                data-tilt
                className={
                  "gallery-slide" + (position === 0 ? " is-current" : "")
                }
                href={item.url}
                target={item.url?.startsWith("http") ? "_blank" : undefined}
                rel="noreferrer"
                tabIndex={position === 0 ? 0 : -1}
                aria-hidden={Math.abs(position) > 2}
                aria-label={item.title + ", " + item.category}
                style={
                  {
                    "--position": position,
                    "--distance": Math.abs(position),
                    "--slide-color": item.color,
                    zIndex: 5 - Math.abs(position),
                  } as CSSProperties
                }
                onClick={(event) => {
                  if (dragged.current) {
                    event.preventDefault();
                    return;
                  }
                  if (position !== 0) {
                    event.preventDefault();
                    setActiveSlide(index);
                  }
                }}
                draggable={false}
              >
                {Math.abs(position) <= 1 ? (
                  <Image
                    src={item.image}
                    alt={item.title + " digital experience"}
                    width={900}
                    height={600}
                    loading={position === 0 ? "eager" : "lazy"}
                    fetchPriority={position === 0 ? "high" : "low"}
                    sizes="(max-width: 760px) 285px, (max-width: 1150px) 440px, 510px"
                    draggable={false}
                  />
                ) : null}
                <span className="gallery-slide-title">
                  {item.title}
                  <ArrowUpRight size={17} />
                </span>
              </a>
            );
          })}
        </div>
        <div className="gallery-controls">
          <button
            className="icon-control"
            aria-label="Previous featured project"
            title="Previous project"
            onClick={() =>
              setActiveSlide(
                (index) => (index - 1 + gallery.length) % gallery.length,
              )
            }
          >
            <ArrowLeft size={17} />
          </button>
          <span>
            <b>{String(activeSlide + 1).padStart(2, "0")}</b> /{" "}
            {String(gallery.length).padStart(2, "0")}
          </span>
          <button
            className="icon-control"
            aria-label="Next featured project"
            title="Next project"
            onClick={() =>
              setActiveSlide((index) => (index + 1) % gallery.length)
            }
          >
            <ArrowRight size={17} />
          </button>
          <button
            className="icon-control gallery-pause"
            aria-label={moving ? "Pause animations" : "Resume animations"}
            title={moving ? "Pause animations" : "Resume animations"}
            onClick={() => setMotion(!motion)}
          >
            {moving ? <Pause size={14} /> : <Play size={14} />}
          </button>
        </div>
        <a
          className="hero-scroll"
          href="#about"
          aria-label="Discover Nishit Gajjar"
        >
          <ArrowDown size={17} />
        </a>
      </section>

      <section className="clientele-section">
        <div className="center-heading reveal">
          <p className="micro-label">ACROSS INDUSTRIES</p>
          <h2>
            Different businesses.
            <br />
            Extraordinary possibilities.
          </h2>
        </div>
        {[
          [
            "Beauty",
            "Wellness",
            "Shopify",
            "Food & beverage",
            "Fashion",
            "Healthcare",
            "Lifestyle",
          ],
          [
            "Fitness",
            "WordPress",
            "Home & living",
            "Pet care",
            "Hospitality",
            "Technology",
            "Retail",
          ],
        ].map((row, rowIndex) => (
          <div className={"clientele-track track-" + rowIndex} key={rowIndex}>
            <div className="clientele-marquee">
              {[...row, ...row].map((industry, index) => (
                <span
                  key={index}
                  className={"clientele-name clientele-name-" + (index % 4)}
                  aria-hidden={index >= row.length}
                >
                  {industry}
                </span>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section className="trust-proof-section" id="proof" aria-labelledby="proof-heading">
        <div className="content-width">
          <div className="proof-section-label reveal">
            <span>01 / REPUTATION</span>
            <span>Independent work. Public feedback.</span>
          </div>
          <div className="trust-proof-layout">
            <div className="trust-proof-intro reveal">
              <h2 id="proof-heading">
                Built well.<br />
                Rated highly.<br />
                <em>Trusted.</em>
              </h2>
              <p>
                Nishit&apos;s freelance history spans direct projects, Upwork, and Fiverr.
                Review the profiles, ratings, and client feedback for yourself before
                starting a conversation.
              </p>
              <a className="proof-portfolio-link" href="#work">
                <strong>500<span>+</span></strong>
                <span>
                  Websites delivered
                  <small>Explore Nishit&apos;s work <ArrowUpRight size={14} /></small>
                </span>
              </a>
            </div>
            <div className="trust-proof-grid">
              {trustSignals.map((signal) => (
                <a
                  className="trust-proof-card reveal"
                  href={signal.href}
                  target="_blank"
                  rel="noreferrer"
                  key={signal.platform}
                  aria-label={`${signal.platform}: ${signal.score}. ${signal.label}`}
                >
                  <div className="proof-card-top">
                    <span className={`proof-platform proof-platform-${signal.platform.toLowerCase()}`}>
                      <Image src={signal.logo} alt="" width={32} height={32} />
                      <span>{signal.platform}</span>
                    </span>
                    <ArrowUpRight size={18} className="proof-outbound" />
                  </div>
                  <div className="proof-card-rating">
                    {signal.platform === "Upwork" ? (
                      <BadgeCheck size={26} strokeWidth={1.5} aria-hidden="true" />
                    ) : (
                      <RatingStars rating={Number(signal.score)} />
                    )}
                    <strong>
                      {signal.score}
                      {signal.platform === "Fiverr" && <small> / 5</small>}
                    </strong>
                  </div>
                  <p>{signal.text}</p>
                  <span className="trust-proof-link">{signal.label}</span>
                </a>
              ))}
              <a
                className="trustpilot-proof reveal"
                href={trustpilotLink}
                target="_blank"
                rel="noreferrer"
                aria-label="Trustpilot: 4.3 out of 5, with 88+ reviews. Read the reviews"
              >
                <div className="trustpilot-proof-copy">
                  <span className="proof-platform">
                    <Image
                      src="/tenant-assets/fullstack/brands/trustpilot.svg"
                      alt=""
                      width={25}
                      height={25}
                    />
                    <span>Trustpilot</span>
                  </span>
                  <p>88+ published reviews<br />available to read.</p>
                  <span className="trust-proof-link">Read the reviews <ArrowUpRight size={14} /></span>
                </div>
                <div className="trustpilot-proof-rating">
                  <strong>4.3<small> / 5</small></strong>
                  <RatingStars rating={4.3} />
                  <span>Published review score</span>
                </div>
              </a>
            </div>
          </div>
          <div className="proof-approach">
            <div className="proof-approach-heading reveal">
              <p className="proof-eyebrow">THE NISHIT GAJJAR APPROACH</p>
              <h3>A good partner makes<br /><em>all the difference.</em></h3>
              <button type="button" onClick={openBookingCapture} className="proof-call-link">
                Meet Nishit <ArrowUpRight size={17} />
              </button>
            </div>
            <ol className="proof-principles">
              {comparisonPoints.map((point, index) => (
                <li className="reveal" key={point.title} data-open={expandedPrinciple === index}>
                  <span className="proof-principle-number">0{index + 1}</span>
                  <div className="proof-principle-copy">
                    <h4>
                      <span className="proof-principle-title">{point.title}</span>
                      <button
                        className="proof-principle-toggle"
                        aria-expanded={expandedPrinciple === index}
                        aria-controls={`proof-principle-${index}`}
                        onClick={() => setExpandedPrinciple((current) => current === index ? null : index)}
                      >
                        {point.title}
                        {expandedPrinciple === index ? <Minus size={16} aria-hidden="true" /> : <Plus size={16} aria-hidden="true" />}
                      </button>
                    </h4>
                    <div className="proof-principle-body" id={`proof-principle-${index}`}>
                      <div><p>{point.text}</p></div>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="design-proof-section" id="design-work" aria-labelledby="design-work-heading">
        <div className="content-width">
          <div className="design-proof-label reveal">
            <span>02 / DESIGN &amp; ARTWORK</span>
            <span>Selected work. Full portfolios.</span>
          </div>
          <div className="design-proof-heading reveal">
            <p>VISUAL PORTFOLIO</p>
            <h2 id="design-work-heading">
              Made to be noticed.<br />
              <em>Designed to be remembered.</em>
            </h2>
            <span>
              Explore selected interface design, e-commerce experiences, brand direction,
              and digital artwork—then visit the complete Dribbble and Behance portfolios.
            </span>
          </div>

          <div className="design-showcase-grid">
            {designShowcase.map((project, index) => (
              <article className={`design-showcase-card design-showcase-card-${index + 1} reveal`} key={project.title}>
                <div className="design-showcase-image">
                  <Image
                    src={project.image}
                    alt={`${project.title} design work`}
                    fill
                    sizes="(max-width: 760px) 100vw, 50vw"
                  />
                </div>
                <div className="design-showcase-caption">
                  <strong>{project.title}</strong>
                  <span>{project.discipline}</span>
                </div>
              </article>
            ))}
          </div>

          <div className="design-profile-grid">
            {designProfiles.map((profile) => (
              <a
                className={`design-profile-card design-profile-${profile.platform.toLowerCase()} reveal`}
                href={profile.href}
                target="_blank"
                rel="noreferrer"
                key={profile.platform}
                aria-label={`View ${profile.handle} on ${profile.platform}`}
              >
                <span className="design-profile-mark" aria-hidden="true">{profile.mark}</span>
                <div>
                  <span className="design-profile-platform">{profile.platform}</span>
                  <h3>{profile.handle}</h3>
                  <p>{profile.description}</p>
                  <span className="design-profile-link">
                    View the full portfolio <ArrowUpRight size={16} />
                  </span>
                </div>
                <ArrowUpRight className="design-profile-arrow" size={20} aria-hidden="true" />
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="creative-about" id="about">
        <div className="about-outline" aria-hidden="true" />
        <div className="about-copy reveal">
          <p className="micro-label">A LITTLE ABOUT ME</p>
          <h2>
            Design-led. Expertly engineered.{" "}
            <span>One independent partner, from idea to launch.</span>
          </h2>
        </div>
        <div
          className="studio-reel-stage"
          ref={reelStageRef}
          style={{ "--reel-progress": 0 } as CSSProperties}
        >
          <button
            className="studio-reel"
            onClick={openReel}
            ref={reelButtonRef}
            aria-label="Play Nishit Gajjar showreel"
          >
            <video
              ref={reelPreviewRef}
              className="studio-reel-video"
              src={studioReelVideo}
              playsInline
              muted
              loop
              preload="none"
            />
            <span className="reel-play">
              <Play size={16} fill="currentColor" /> PLAY NISHIT&apos;S SHOWREEL
            </span>
            <small>INDEPENDENT FULL-STACK FREELANCER / NISHIT GAJJAR</small>
          </button>
        </div>
      </section>

      <section className="creative-services" id="services">
        <div className="center-heading reveal">
          <p className="micro-label">NISHIT&apos;S EXPERTISE</p>
          <h2>
            Your next big thing.
            <br />
            Nishit&apos;s kind of challenge.
          </h2>
        </div>
        <div className="expertise-workbench content-width reveal">
          <ServiceDial active={service} onChange={setService} />
          <div
            className="expertise-content"
            id="service-panel"
            role="tabpanel"
            aria-labelledby={"service-tab-" + service}
          >
            <div className="expertise-heading">
              <span className="service-number">0{service + 1}</span>
              <div className="expertise-tags">
                {currentService.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            </div>
            <div className="expertise-description" key={currentService.name}>
              <h3>{currentService.name}</h3>
              <p>{currentService.description}</p>
            </div>
            <div
              className="service-filmstrip"
              key={currentService.kind}
              data-lenis-prevent-horizontal
            >
              {serviceProjects[service].map((project) => (
                <a
                  key={project.title}
                  className="service-film-frame"
                  href={project.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Image
                    src={project.image}
                    alt={project.title + " website"}
                    width={440}
                    height={300}
                    sizes="(max-width: 760px) 78vw, 440px"
                  />
                  <span>
                    {project.title} / Website <ArrowUpRight size={12} />
                  </span>
                </a>
              ))}
            </div>
            <div className="expertise-bottom">
              <button className="line-button" onClick={openChat}>
                Explore your project <ArrowUpRight size={16} />
              </button>
              <div className="service-arrows">
                <button
                  className="icon-control"
                  aria-label="Previous service"
                  title="Previous service"
                  onClick={() =>
                    setService(
                      (index) =>
                        (index - 1 + services.length) % services.length,
                    )
                  }
                >
                  <ArrowLeft size={16} />
                </button>
                <button
                  className="icon-control"
                  aria-label="Next service"
                  title="Next service"
                  onClick={() =>
                    setService((index) => (index + 1) % services.length)
                  }
                >
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="service-closing reveal">
          <p>
            Big ambitions deserve
            <br />
            more than a template.
          </p>
          <span>
            Nishit connects strategy, design, and development
            <br />
            to build what your business actually needs.
          </span>
          <button className="accent-button" onClick={openChat}>
            Talk to Nishit <ArrowUpRight size={16} />
          </button>
        </div>
      </section>

      <PlatformShowcase onDiscuss={openChat} />

      <section className="creative-work" id="work">
        <div className="content-width">
          <div className="work-heading reveal">
            <div>
              <p className="micro-label">FEATURED PROJECTS</p>
              <h2>
                Made to stand out.
                <br />
                Built to work.
              </h2>
            </div>
            <p>
              A selection of brands and digital
              <br />
              experiences from Nishit&apos;s portfolio.
            </p>
          </div>
          <div
            className="creative-filters"
            role="group"
            aria-label="Filter projects"
          >
            {filters.map((item) => (
              <button
                key={item}
                aria-pressed={item === filter}
                className={item === filter ? "is-active" : ""}
                onClick={() => {
                  setFilter(item);
                  setVisibleCount(4);
                }}
              >
                {item === "All"
                  ? "All projects"
                  : item === "Brand Web"
                    ? "Websites"
                    : item}
                <sup>
                  {item === "All"
                    ? workProjects.length
                    : workProjects.filter(
                        (project) => project.category === item,
                      ).length}
                </sup>
              </button>
            ))}
          </div>
          <div className="creative-project-grid">
            {filtered.slice(0, visibleCount).map((project, index) => (
              <article className="creative-project reveal" key={project.title}>
                <a
                  data-tilt
                  href={project.url}
                  target="_blank"
                  rel="noreferrer"
                  className="creative-project-image"
                  style={{ "--project-color": project.color } as CSSProperties}
                  aria-label={"Visit " + project.title + " website"}
                >
                  <Image
                    src={project.image}
                    alt={project.title + " website design"}
                    width={1400}
                    height={788}
                    loading="lazy"
                    sizes="(max-width: 760px) calc(100vw - 34px), (max-width: 1100px) 48vw, 620px"
                  />
                  <span className="project-hover">
                    <ArrowUpRight size={24} />
                  </span>
                  <small>
                    NISHIT GAJJAR / {String(index + 1).padStart(2, "0")}
                  </small>
                </a>
                <div className="project-category">
                  <span>
                    {project.category === "Brand Web"
                      ? "WEBSITE"
                      : project.category.toUpperCase()}
                  </span>
                  <span>{project.metric.toUpperCase()}</span>
                </div>
                <h3>
                  <a href={project.url} target="_blank" rel="noreferrer">
                    {project.title}
                    <ArrowUpRight size={19} />
                  </a>
                </h3>
                <p>{project.blurb}</p>
              </article>
            ))}
          </div>
          <div className="work-end">
            <h3>There&apos;s more where that came from.</h3>
            <p>
              {showcaseProjects.length} real projects across the studio.
              Discover {workProjects.length} more here.
            </p>
            {visibleCount < filtered.length ? (
              <button
                className="line-button"
                onClick={() => setVisibleCount((count) => count + 4)}
              >
                View more projects <Plus size={16} />
              </button>
            ) : (
              <button className="line-button" onClick={openChat}>
                Let&apos;s make yours next <ArrowUpRight size={16} />
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="creative-process content-width" id="process">
        <div className="center-heading reveal">
          <p className="micro-label">FROM IDEA TO IMPACT</p>
          <h2>
            Clear thinking.
            <br />
            Exceptional execution.
          </h2>
          <p>
            Know what&apos;s happening, what&apos;s next,
            <br />
            and who&apos;s making it happen.
          </p>
        </div>
        <div className="process-orbit" aria-hidden="true">
          <span>O</span>
          <span>L</span>
        </div>
        <div
          className="creative-process-list"
          role="tablist"
          aria-label="Project process"
          onKeyDown={(event) => tabKeys(event, stage, stages.length, setStage)}
        >
          {stages.map((item, index) => (
            <button
              key={item.name}
              role="tab"
              id={"stage-tab-" + index}
              aria-selected={stage === index}
              aria-controls="stage-detail"
              tabIndex={stage === index ? 0 : -1}
              className={stage === index ? "is-active" : ""}
              onClick={() => setStage(index)}
            >
              <span>0{index + 1}</span>
              <strong>{item.name}</strong>
              <p>{item.title}</p>
              {stage === index ? <Minus size={19} /> : <Plus size={19} />}
            </button>
          ))}
        </div>
        <div
          className="stage-detail"
          key={stage}
          id="stage-detail"
          role="tabpanel"
          aria-labelledby={"stage-tab-" + stage}
        >
          <p>{stages[stage].text}</p>
          <ul>
            {stages[stage].deliverables.map((item) => (
              <li key={item}>
                <Check size={15} />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="partnership" className="partnership-section content-width reveal">
        <div className="partnership-lines" aria-hidden="true">
          {[0, 1, 2, 3, 4].map((i) => (
            <i key={i} style={{ "--line": i } as CSSProperties} />
          ))}
        </div>
        <div className="partnership-copy">
          <p className="micro-label">BUILT AROUND YOU</p>
          <h2>
            Your independent partner,
            <br />
            beside your team.
          </h2>
          <p>
            A direct line to Nishit—the person doing the work.
            <br />One accountable partner for the finished product.
          </p>
          <button type="button" onClick={openBookingCapture} className="white-button">
            Meet your technology partner <ArrowUpRight size={17} />
          </button>
        </div>
        <div className="partnership-marker" aria-hidden="true">
          <Image unoptimized src="/tenant-assets/fullstack/fullstack-logo.svg" alt="" width={400} height={200} />
          <div className="partnership-capabilities">
            <span>Strategy</span>
            <span>Design</span>
            <span>Engineering</span>
            <span>Launch</span>
          </div>
        </div>
      </section>

      <section className="offer-slide-section content-width reveal">
        <div className="offer-slide">
          <div>
            <p className="micro-label">{offerSlide.eyebrow}</p>
            <h2>{offerSlide.title}</h2>
            <p>{offerSlide.text}</p>
          </div>
          <div className="offer-slide-points">
            {offerSlide.points.map((point, index) => (
              <span key={point}>
                <small>{String(index + 1).padStart(2, "0")}</small>
                {point}
              </span>
            ))}
          </div>
          <div className="offer-slide-actions">
            <button className="accent-button" onClick={() => setOfferOpen(true)}>
              View offer <ArrowUpRight size={16} />
            </button>
            <button type="button" onClick={openBookingCapture} className="line-button">
              Request a call <ArrowUpRight size={15} />
            </button>
          </div>
        </div>
      </section>

      <section className="creative-faq" id="faqs">
        <div className="faq-content content-width">
          <div className="faq-sign reveal">
            <HelpCircle size={29} />
            <h2>
              Good
              <br />
              questions.
            </h2>
            <p>
              A little clarity before
              <br />
              your next big move.
            </p>
            <button className="white-button" onClick={openChat}>
              Ask Nishit anything <ArrowUpRight size={16} />
            </button>
          </div>
          <div className="creative-faq-list reveal">
            {faqs.map(([question, answer], index) => (
              <details
                key={question}
                name="studio-faq"
                open={index === 0 ? true : undefined}
              >
                <summary>
                  {question}
                  <ChevronDown className="faq-down" size={19} />
                  <ChevronUp className="faq-up" size={19} />
                </summary>
                <p>{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="creative-contact content-width reveal">
        <p className="micro-label">WHAT&apos;S NEXT?</p>
        <h2>
          Something great
          <br />
          starts with a conversation.
        </h2>
        <p>
          Tell Nishit what you have in mind.
          <br />
          Nishit will help shape the plan and a personalized quote.
        </p>
        <div className="contact-links">
          <button className="accent-button" onClick={openChat}>
            Start a project <ArrowUpRight size={18} />
          </button>
          <button type="button" className="line-button" onClick={openBookingCapture}>
            Request a discovery call <ArrowUpRight size={16} />
          </button>
        </div>
        <button
          className="project-offer-link"
          onClick={() => setOfferOpen(true)}
        >
          View Nishit&apos;s new-project offer <ArrowUpRight size={14} />
        </button>
      </section>

      <footer className="creative-footer">
        <div className="content-width">
          <div className="footer-navigation">
            <nav aria-label="Footer navigation">
              <a href="#about">About</a>
              <a href="#services">Services</a>
              <a href="#proof">Proof</a>
              <a href="#design-work">Design</a>
              <a href="#platforms">Platforms</a>
              <a href="#work">Projects</a>
              <Link href="/blog">Blog</Link>
              <Link href="/news">News</Link>
              <a href="#faqs">FAQs</a>
            </nav>
            <nav aria-label="Profile and contact links">
              <a href={fiverrLink} target="_blank" rel="noreferrer">
                Fiverr <ArrowUpRight size={13} />
              </a>
              <a href={upworkLink} target="_blank" rel="noreferrer">
                Upwork <ArrowUpRight size={13} />
              </a>
              <a href={trustpilotLink} target="_blank" rel="noreferrer">
                Trustpilot <ArrowUpRight size={13} />
              </a>
              <a href={dribbbleLink} target="_blank" rel="noreferrer">
                Dribbble <ArrowUpRight size={13} />
              </a>
              <a href={behanceLink} target="_blank" rel="noreferrer">
                Behance <ArrowUpRight size={13} />
              </a>
              <Link href="/?contact=1">Contact Nishit <ArrowUpRight size={13} /></Link>
            </nav>
          </div>
          <div className="oversized-wordmark" aria-label="Nishit Gajjar">
            <span>FULLSTACK</span>
            <span>
              GUYS<span className="wordmark-period">.</span>
            </span>
          </div>
          <div className="footer-company">
            <Link href="/" aria-label="Nishit Gajjar home">
              <BrandLogo />
            </Link>
            <p>
              NISHIT GAJJAR
              <br />
              Independent Canadian full-stack freelancer
              <br />
              The Fullstack Guys — Nishit&apos;s freelance technology studio
            </p>
            <Link href="/?contact=1">
              Nishit Gajjar support <ArrowUpRight size={16} />
            </Link>
          </div>
          <div className="footer-legal">
            <div>
              <Link href="/privacy-policy">Privacy</Link>
              <Link href="/cookie-policy">Cookie notice</Link>
              <Link href="/terms-of-use">Terms of use</Link>
              <Link href="/refund-policy">Refund policy</Link>
              <Link href="/legal-notice">Legal notice</Link>
              <Link href="/support">Support</Link>
              <Link href="/admin">Admin</Link>
            </div>
            <span>© {new Date().getFullYear()} Nishit Gajjar</span>
            <button
              className="motion-control"
              onClick={() => setMotion(!motion)}
            >
              {moving ? <Pause size={13} /> : <Play size={13} />}
              {moving ? "Pause motion" : "Resume motion"}
            </button>
          </div>
        </div>
      </footer>

      <dialog
        className="reel-dialog"
        ref={reelRef}
        aria-label="Nishit Gajjar showreel"
        onCancel={closeReel}
        onClick={(event) => {
          if (event.target === event.currentTarget) closeReel();
        }}
      >
        <div className="reel-dialog-inner">
          <button
            className="reel-close icon-control"
            aria-label="Close showreel"
            title="Close reel"
            onClick={closeReel}
          >
            <X size={23} />
          </button>
          <video
            ref={reelVideoRef}
            className="reel-video"
            src={studioReelVideo}
            playsInline
            loop
            controls
            preload="none"
          />
        </div>
      </dialog>
      <DiscountPopup open={offerOpen} onOpenChange={setOfferOpen} />

      <BookingCapture />
      <VisitorTracker />
      <OpenAIAdsPixel />
      <LeadChat open={chatOpen} onOpenChange={setChatOpen} />
    </main>
  );
}
