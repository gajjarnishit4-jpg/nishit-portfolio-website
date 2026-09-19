import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE, destroyAdminSession } from "@/app/lib/admin-auth";

export async function POST(request: NextRequest) {
  await destroyAdminSession(request.cookies.get(ADMIN_COOKIE)?.value);
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return response;
}
