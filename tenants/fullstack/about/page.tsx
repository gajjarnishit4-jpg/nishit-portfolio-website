import type { Metadata } from "next";
import { InfoPage } from "@/tenants/fullstack/components/InfoPage";
import { infoPages } from "@/tenants/fullstack/info-content";

export const metadata: Metadata = {
  title: "About Nishit Gajjar",
  description: "The story, independent working style, and full-stack practice of Nishit Gajjar.",
};

export default function AboutPage() {
  return <InfoPage content={infoPages.about} />;
}
