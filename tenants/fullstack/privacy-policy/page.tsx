import type { Metadata } from "next";
import { InfoPage } from "@/tenants/fullstack/components/InfoPage";
import { infoPages } from "@/tenants/fullstack/info-content";

export const metadata: Metadata = {
  title: "Nishit Gajjar Privacy Policy",
  description: "How Nishit Gajjar handles lead, chat, project, and visitor information.",
};

export default function PrivacyPolicyPage() {
  return <InfoPage content={infoPages["privacy-policy"]} />;
}
