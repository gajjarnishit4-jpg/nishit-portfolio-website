import type { Metadata } from "next";
import { InfoPage } from "@/tenants/fullstack/components/InfoPage";
import { infoPages } from "@/tenants/fullstack/info-content";

export const metadata: Metadata = {
  title: "Nishit Gajjar Pricing",
  description: "Custom website, software, iOS, commerce, automation and design pricing options.",
};

export default function PricingPage() {
  return <InfoPage content={infoPages.pricing} />;
}
