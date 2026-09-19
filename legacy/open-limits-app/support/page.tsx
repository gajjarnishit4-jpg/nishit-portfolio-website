import type { Metadata } from "next";
import { InfoPage } from "@/app/components/InfoPage";
import { infoPages } from "@/app/info-content";

export const metadata: Metadata = {
  title: "Open Limits Support",
  description: "Post-launch support terms and how to contact Open Limits.",
};

export default function SupportPage() {
  return <InfoPage content={infoPages.support} />;
}
