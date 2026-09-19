import type { Metadata } from "next";
import { InfoPage } from "@/app/components/InfoPage";
import { infoPages } from "@/app/info-content";

export const metadata: Metadata = {
  title: "Open Limits Refund Policy",
  description: "Lenient refund and milestone terms for Open Limits service projects.",
};

export default function RefundPolicyPage() {
  return <InfoPage content={infoPages["refund-policy"]} />;
}
