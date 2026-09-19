import type { Metadata } from "next";
import { InfoPage } from "@/app/components/InfoPage";
import { infoPages } from "@/app/info-content";

export const metadata: Metadata = {
  title: "Open Limits Pricing",
  description: "Custom website, software, iOS, commerce, automation and design pricing options.",
};

export default function PricingPage() {
  return <InfoPage content={infoPages.pricing} />;
}
