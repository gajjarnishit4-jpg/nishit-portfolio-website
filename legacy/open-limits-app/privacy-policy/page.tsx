import type { Metadata } from "next";
import { InfoPage } from "@/app/components/InfoPage";
import { infoPages } from "@/app/info-content";

export const metadata: Metadata = {
  title: "Open Limits Privacy Policy",
  description: "How Open Limits handles lead, chat, project, and visitor information.",
};

export default function PrivacyPolicyPage() {
  return <InfoPage content={infoPages["privacy-policy"]} />;
}
