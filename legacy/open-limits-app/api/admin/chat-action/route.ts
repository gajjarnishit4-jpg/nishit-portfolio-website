import { NextRequest, NextResponse } from "next/server";
import { getAdminFromRequest } from "@/app/lib/admin-auth";
import { addAdminMessage, joinChatSession } from "@/app/lib/chat-storage";

export async function POST(request: NextRequest) {
  const admin = await getAdminFromRequest(request);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as
    | { sessionId?: string; action?: "join" | "send"; message?: string }
    | null;
  const sessionId = body?.sessionId?.trim();
  if (!sessionId) {
    return NextResponse.json({ error: "Missing session." }, { status: 400 });
  }

  if (body?.action === "send") {
    const message = body.message?.trim();
    if (!message) {
      return NextResponse.json({ error: "Message required." }, { status: 400 });
    }
    await addAdminMessage(sessionId, message);
    return NextResponse.json({ ok: true });
  }

  await joinChatSession(sessionId);
  return NextResponse.json({ ok: true });
}
