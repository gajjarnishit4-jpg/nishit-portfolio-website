import type { Metadata } from "next";
import { InfoPage } from "@/tenants/fullstack/components/InfoPage";
import { infoPages } from "@/tenants/fullstack/info-content";

export const metadata: Metadata = {
  title: "Nishit Gajjar Terms of Use",
  description: "Plain-language terms for using Nishit Gajjar and starting a project.",
};

export default function TermsOfUsePage() {
  return <InfoPage content={infoPages["terms-of-use"]} />;
}
