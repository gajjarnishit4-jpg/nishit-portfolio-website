import type { Metadata } from "next";
import { InfoPage } from "@/tenants/fullstack/components/InfoPage";
import { infoPages } from "@/tenants/fullstack/info-content";

export const metadata: Metadata = {
  title: "Nishit Gajjar Process",
  description: "How Nishit Gajjar takes web, software, app and commerce projects from discovery to launch support.",
};

export default function ProcessPage() {
  return <InfoPage content={infoPages.process} />;
}
