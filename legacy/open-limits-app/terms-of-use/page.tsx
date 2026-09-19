import type { Metadata } from "next";
import { InfoPage } from "@/app/components/InfoPage";
import { infoPages } from "@/app/info-content";

export const metadata: Metadata = {
  title: "Open Limits Terms of Use",
  description: "Plain-language terms for using Open Limits and starting a project.",
};

export default function TermsOfUsePage() {
  return <InfoPage content={infoPages["terms-of-use"]} />;
}
