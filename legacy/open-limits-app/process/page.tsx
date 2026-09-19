import type { Metadata } from "next";
import { InfoPage } from "@/app/components/InfoPage";
import { infoPages } from "@/app/info-content";

export const metadata: Metadata = {
  title: "Open Limits Process",
  description: "How Open Limits takes web, software, app and commerce projects from discovery to launch support.",
};

export default function ProcessPage() {
  return <InfoPage content={infoPages.process} />;
}
