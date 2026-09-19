import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  createAdminSession,
  verifyAdminCredentials,
} from "@/app/lib/admin-auth";

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as
    | { email?: string; password?: string }
    | null;
  const email = body?.email || "";
  const password = body?.password || "";

  if (!(await verifyAdminCredentials(email, password))) {
    return NextResponse.json({ error: "Invalid admin login." }, { status: 401 });
  }

  const token = await createAdminSession(email);
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}
