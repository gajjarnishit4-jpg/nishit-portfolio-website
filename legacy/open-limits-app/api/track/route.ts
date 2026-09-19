import { NextRequest, NextResponse } from "next/server";
import { saveHeatmapEvent } from "@/app/lib/chat-storage";
import { sendMetaEvent } from "@/app/lib/meta-capi";

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as
    | {
        sessionId?: string;
        path?: string;
        eventType?: string;
        x?: number;
        y?: number;
        viewportWidth?: number;
        viewportHeight?: number;
        metadata?: Record<string, unknown>;
      }
    | null;

  if (!body?.eventType) {
    return NextResponse.json({ error: "Missing event type." }, { status: 400 });
  }

  try {
    const eventId =
      typeof body.metadata?.eventId === "string" ? body.metadata.eventId : undefined;
    await saveHeatmapEvent({
      sessionId: body.sessionId,
      path: body.path,
      eventType: body.eventType,
      x: body.x,
      y: body.y,
      viewportWidth: body.viewportWidth,
      viewportHeight: body.viewportHeight,
      metadata: body.metadata,
    });
    if (body.eventType === "pageview") {
      await sendMetaEvent({
        eventName: "PageView",
        request,
        eventId,
        sourceUrl: body.path,
        fbp: typeof body.metadata?.fbp === "string" ? body.metadata.fbp : undefined,
        fbc: typeof body.metadata?.fbc === "string" ? body.metadata.fbc : undefined,
        customData: {
          session_id: body.sessionId,
          visitor_id: body.metadata?.visitorId,
        },
      });
    }
  } catch (error) {
    console.error(error);
  }

  return NextResponse.json({ ok: true });
}
