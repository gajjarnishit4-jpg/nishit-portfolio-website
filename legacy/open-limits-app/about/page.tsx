import type { Metadata } from "next";
import { InfoPage } from "@/app/components/InfoPage";
import { infoPages } from "@/app/info-content";

export const metadata: Metadata = {
  title: "About Open Limits",
  description: "The story, team philosophy, and working style behind Open Limits.",
};

export default function AboutPage() {
  return <InfoPage content={infoPages.about} />;
}
