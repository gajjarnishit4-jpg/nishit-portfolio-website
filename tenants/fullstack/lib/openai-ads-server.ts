const OPENAI_ADS_ENDPOINT = "https://bzr.openai.com/v1/events";
const OPENAI_ADS_PIXEL_ID = "LB7HC8FkK1wXF6pY2WKtN5";

type ConversionInput = { eventId: string; sourceUrl: string; timestampMs?: number };

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function safeSourceUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:" ? url.href : null;
  } catch {
    return null;
  }
}

export async function sendOpenAIAdsLead(input: ConversionInput) {
  const apiKey = process.env.OPENAI_ADS_API_KEY;
  const sourceUrl = safeSourceUrl(input.sourceUrl);
  if (!apiKey || !sourceUrl || !isUuid(input.eventId)) {
    return { sent: false, reason: !apiKey ? "not_configured" : "invalid_event" } as const;
  }

  const validateOnly =
    process.env.NODE_ENV !== "production" || process.env.OPENAI_ADS_VALIDATE_ONLY === "true";
  const response = await fetch(
    `${OPENAI_ADS_ENDPOINT}?pid=${encodeURIComponent(OPENAI_ADS_PIXEL_ID)}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        validate_only: validateOnly,
        events: [{
          id: input.eventId,
          type: "lead_created",
          timestamp_ms: input.timestampMs || Date.now(),
          source_url: sourceUrl,
          action_source: "web",
          data: { type: "customer_action" },
        }],
      }),
      cache: "no-store",
    },
  );
  if (!response.ok) {
    const detail = (await response.text()).slice(0, 500);
    console.error("OpenAI Ads conversion was rejected.", response.status, detail);
    return { sent: false, reason: "rejected", status: response.status } as const;
  }
  return { sent: true, validateOnly } as const;
}
