import type { Metadata } from "next";
import { InfoPage } from "@/tenants/fullstack/components/InfoPage";
import { infoPages } from "@/tenants/fullstack/info-content";

export const metadata: Metadata = {
  title: "Nishit Gajjar Support",
  description: "Post-launch support terms and how to contact Nishit Gajjar.",
};

export default function SupportPage() {
  return <InfoPage content={infoPages.support} />;
}
