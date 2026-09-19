import type { Metadata } from "next";
import { InfoPage } from "@/tenants/fullstack/components/InfoPage";
import { infoPages } from "@/tenants/fullstack/info-content";

export const metadata: Metadata = {
  title: "Nishit Gajjar Refund Policy",
  description: "Lenient refund and milestone terms for Nishit Gajjar service projects.",
};

export default function RefundPolicyPage() {
  return <InfoPage content={infoPages["refund-policy"]} />;
}
