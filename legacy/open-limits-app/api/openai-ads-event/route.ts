import { NextRequest, NextResponse } from "next/server";
import { sendOpenAIAdsEvent } from "@/app/lib/openai-ads";

type OpenAIAdsEventBody = {
  id?: string;
  type?: string;
  sourceUrl?: string;
  data?: Record<string, unknown>;
};

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as OpenAIAdsEventBody | null;

  if (body?.type !== "appointment_scheduled") {
    return NextResponse.json({ error: "Unsupported event type." }, { status: 400 });
  }

  await sendOpenAIAdsEvent({
    id: body.id || crypto.randomUUID(),
    type: "appointment_scheduled",
    request,
    sourceUrl: body.sourceUrl,
    data: body.data,
  });

  return NextResponse.json({ ok: true });
}
