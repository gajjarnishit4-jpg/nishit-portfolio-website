import type { Metadata } from "next";
import { InfoPage } from "@/tenants/fullstack/components/InfoPage";
import { infoPages } from "@/tenants/fullstack/info-content";

export const metadata: Metadata = {
  title: "Nishit Gajjar Legal Notice",
  description: "Legal notice for The Fullstack Guys, an independent Canadian freelance technology studio.",
};

export default function LegalNoticePage() {
  return <InfoPage content={infoPages["legal-notice"]} />;
}
