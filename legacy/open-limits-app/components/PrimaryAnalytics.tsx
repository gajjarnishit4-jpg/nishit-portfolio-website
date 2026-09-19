"use client";

import { FacebookPixel } from "./FacebookPixel";
import { OpenAIAdsPixel } from "./OpenAIAdsPixel";

// Only the original tenant imports this component, so its identifiers never
// enter the FullStack tenant's browser bundle.
export function PrimaryAnalytics() {
  return <><FacebookPixel /><OpenAIAdsPixel /></>;
}
