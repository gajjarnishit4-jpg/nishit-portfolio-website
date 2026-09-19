import type { Metadata } from "next";
import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google";
import { headers } from "next/headers";
import { FULLSTACK_ORIGIN, isFullstackHost } from "@/tenant-routing";
import "./globals.css";
import "lenis/dist/lenis.css";
import "./studio.css";
import "@/tenants/fullstack/brand.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  if (isFullstackHost(requestHeaders.get("host"), process.env.NODE_ENV === "development")) {
    const path = requestHeaders.get("x-site-path") || "/";
    const canonicalPath = path.startsWith("/") && !path.startsWith("//") ? path : "/";
    return {
      metadataBase: new URL(FULLSTACK_ORIGIN),
      title: { default: "Nishit Gajjar | Independent Full-Stack Freelancer", template: "%s | Nishit Gajjar" },
      description: "The Fullstack Guys is Nishit Gajjar’s personal portfolio for websites, Shopify, WordPress, mobile apps and custom software.",
      alternates: {
        canonical: new URL(canonicalPath, FULLSTACK_ORIGIN).href,
        types: { "application/rss+xml": `${FULLSTACK_ORIGIN}/feed.xml` },
      },
      robots: canonicalPath.startsWith("/admin")
        ? { index: false, follow: false }
        : {
            index: true,
            follow: true,
            googleBot: {
              index: true,
              follow: true,
              "max-image-preview": "large",
              "max-snippet": -1,
              "max-video-preview": -1,
            },
          },
      icons: { icon: "/tenant-assets/fullstack/fullstack-icon.svg", shortcut: "/tenant-assets/fullstack/fullstack-icon.svg" },
      openGraph: {
        title: "Nishit Gajjar | Independent Full-Stack Freelancer", siteName: "The Fullstack Guys", type: "website",
        url: new URL(canonicalPath, FULLSTACK_ORIGIN).href,
        description: "Independent digital design and full-stack development by Nishit Gajjar.",
        images: [{ url: "/tenant-assets/fullstack/fullstack-social.svg", width: 1730, height: 909 }],
      },
      twitter: { card: "summary_large_image", title: "Nishit Gajjar | Independent Full-Stack Freelancer", images: ["/tenant-assets/fullstack/fullstack-social.svg"] },
      category: "technology",
      creator: "Nishit Gajjar",
      publisher: "Nishit Gajjar",
      authors: [{ name: "Nishit Gajjar", url: `${FULLSTACK_ORIGIN}/about` }],
      keywords: ["Nishit Gajjar", "full-stack freelancer", "AI development", "Shopify developer", "WordPress developer", "Next.js developer", "mobile app developer"],
    };
  }

  const host =
    requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const protocol =
    requestHeaders.get("x-forwarded-proto") ??
    (host?.includes("localhost") ? "http" : "https");
  const siteUrl = host ? `${protocol}://${host}` : "https://openlimits.agency";

  return {
    metadataBase: new URL(siteUrl),
    title: "Open Limits — Web, Software, iOS and Commerce Development",
    description:
      "Open Limits designs and engineers websites, software, iOS apps, commerce systems, automation and conversion infrastructure for ambitious companies.",
    icons: {
      icon: "/open-limits-logo.png",
      shortcut: "/open-limits-logo.png",
    },
    openGraph: {
      title: "Open Limits — Complete digital product and development company.",
      description:
        "Websites, software, iOS apps, commerce systems and automation built with taste, speed and technical depth.",
      type: "website",
      images: [{ url: `${siteUrl}/og.png`, width: 1730, height: 909 }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Open Limits — Web, Software, iOS and Commerce Development",
      description:
        "Websites, software, iOS apps, commerce systems and automation built with taste, speed and technical depth.",
      images: [`${siteUrl}/og.png`],
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const requestHeaders = await headers();
  const fullstack = isFullstackHost(requestHeaders.get("host"), process.env.NODE_ENV === "development");
  return (
    <html lang="en" data-tenant={fullstack ? "fullstack" : "default"}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable}`}
      >
        {fullstack ? (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@graph": [
                  { "@type": "Person", "@id": `${FULLSTACK_ORIGIN}/#nishit-gajjar`, name: "Nishit Gajjar", url: FULLSTACK_ORIGIN, jobTitle: "Independent Full-Stack Freelancer", sameAs: ["https://www.fiverr.com/s/m5qDeDN", "https://www.upwork.com/freelancers/~016de1057b0e843c6b"] },
                  { "@type": "WebSite", "@id": `${FULLSTACK_ORIGIN}/#website`, url: FULLSTACK_ORIGIN, name: "The Fullstack Guys", publisher: { "@id": `${FULLSTACK_ORIGIN}/#nishit-gajjar` }, inLanguage: "en" },
                ],
              }).replace(/</g, "\\u003c"),
            }}
          />
        ) : null}
        {children}
      </body>
    </html>
  );
}
