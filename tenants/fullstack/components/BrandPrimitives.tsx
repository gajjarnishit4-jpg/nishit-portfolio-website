import Image from "next/image";

export function SectionWave({
  from,
  to,
  flip = false,
}: {
  from: string;
  to: string;
  flip?: boolean;
}) {
  return (
    <svg
      className={`section-wave ${flip ? "section-wave--flip" : ""}`}
      viewBox="0 0 1440 140"
      preserveAspectRatio="none"
      aria-hidden="true"
      style={{ background: from }}
    >
      <path
        d="M0,34 C180,112 328,112 472,62 C650,0 778,4 946,69 C1111,132 1269,115 1440,48 L1440,140 L0,140 Z"
        fill={to}
      />
    </svg>
  );
}

export function BrandLogo({
  header = false,
  splash = false,
}: {
  header?: boolean;
  splash?: boolean;
}) {
  const wordmark = header || splash;
  return (
    <Image
      className={`brand-logo-image${header ? " brand-logo-image--header" : ""}${splash ? " brand-logo-image--splash" : ""}`}
      src={wordmark
        ? "/tenant-assets/fullstack/fullstack-wordmark-white.png"
        : "/tenant-assets/fullstack/fullstack-logo.svg"}
      alt="The Fullstack Guys — Nishit Gajjar, independent freelancer"
      width={wordmark ? 1694 : 220}
      height={wordmark ? 342 : 90}
      sizes={splash ? "(max-width: 600px) 72vw, 520px" : header ? "(max-width: 760px) 146px, 176px" : "190px"}
      loading={wordmark ? "eager" : "lazy"}
      fetchPriority={splash ? "high" : "auto"}
      unoptimized={!wordmark}
    />
  );
}

export function Mark() {
  return <BrandLogo />;
}

export function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return (
    <span
      className={diagonal ? "arrow arrow--diagonal" : "arrow"}
      aria-hidden="true"
    >
      →
    </span>
  );
}
