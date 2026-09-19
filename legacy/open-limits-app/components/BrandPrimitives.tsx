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

export function BrandLogo() {
  return (
    <Image
      className="brand-logo-image"
      src="/open-limits-logo.png"
      alt="Open Limits"
      width={160}
      height={80}
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
