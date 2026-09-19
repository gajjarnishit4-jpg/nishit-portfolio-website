import { NextRequest } from "next/server";

export const OPENAI_ADS_PIXEL_ID =
  process.env.NEXT_PUBLIC_OPENAI_ADS_PIXEL_ID ||
  process.env.OPENAI_ADS_PIXEL_ID ||
  "5TgKHqLs9uaMYoWgBMjTCh";

const OPENAI_ADS_API_KEY = process.env.OPENAI_ADS_API_KEY;

type OpenAIAdsEventInput = {
  id: string;
  type: "appointment_scheduled";
  request: NextRequest;
  sourceUrl?: string | null;
  data?: Record<string, unknown>;
};

function getSourceUrl(request: NextRequest, sourceUrl?: string | null) {
  if (sourceUrl?.startsWith("http")) return sourceUrl;
  const origin = request.nextUrl.origin;
  if (sourceUrl?.startsWith("/")) return `${origin}${sourceUrl}`;
  return request.headers.get("referer") || origin;
}

export async function sendOpenAIAdsEvent({
  id,
  type,
  request,
  sourceUrl,
  data,
}: OpenAIAdsEventInput) {
  if (!OPENAI_ADS_API_KEY || !OPENAI_ADS_PIXEL_ID) return;

  try {
    const response = await fetch(
      `https://bzr.openai.com/v1/events?pid=${encodeURIComponent(OPENAI_ADS_PIXEL_ID)}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENAI_ADS_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          validate_only: false,
          events: [
            {
              id,
              type,
              timestamp_ms: Date.now(),
              source_url: getSourceUrl(request, sourceUrl),
              action_source: "web",
              data: {
                type: "customer_action",
                ...data,
              },
            },
          ],
        }),
        cache: "no-store",
      },
    );

    if (!response.ok) {
      console.error("OpenAI Ads event failed", await response.text());
    }
  } catch (error) {
    console.error("OpenAI Ads event error", error);
  }
}
