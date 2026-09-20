import type { Metadata } from "next";
import { InfoPage } from "@/tenants/fullstack/components/InfoPage";
import { infoPages } from "@/tenants/fullstack/info-content";

export const metadata: Metadata = {
  title: "Nishit Gajjar Cookie Notice",
  description: "How The Fullstack Guys uses essential cookies and browser storage.",
};

export default function CookiePolicyPage() {
  return <InfoPage content={infoPages["cookie-policy"]} />;
}
