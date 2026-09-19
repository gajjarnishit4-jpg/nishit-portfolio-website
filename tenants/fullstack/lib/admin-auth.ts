import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { getSupabaseAdmin, throwIfSupabaseError } from "@/tenants/fullstack/lib/supabase";

export const ADMIN_COOKIE = "fullstack_guys_admin";

async function hashValue(value: string) {
  const encoded = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function adminEmail() {
  return process.env.FULLSTACK_ADMIN_EMAIL || process.env.ADMIN_EMAIL || "";
}

function adminPassword() {
  return process.env.FULLSTACK_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD || "";
}

export async function verifyAdminCredentials(email: string, password: string) {
  return (
    email.trim().toLowerCase() === adminEmail().toLowerCase() &&
    Boolean(adminPassword()) &&
    password === adminPassword()
  );
}

export async function createAdminSession(email: string) {
  const token = `${crypto.randomUUID()}.${crypto.randomUUID()}`;
  const tokenHash = await hashValue(token);
  const { error } = await getSupabaseAdmin().from("fullstack_admin_sessions").insert({
    token_hash: tokenHash,
    email: email.toLowerCase(),
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  });
  throwIfSupabaseError(error);
  return token;
}

export async function destroyAdminSession(token?: string | null) {
  if (!token) return;
  const { error } = await getSupabaseAdmin()
    .from("fullstack_admin_sessions")
    .delete()
    .eq("token_hash", await hashValue(token));
  throwIfSupabaseError(error);
}

export async function getAdminFromToken(token?: string | null) {
  if (!token) return null;
  const supabase = getSupabaseAdmin();
  const now = new Date().toISOString();
  await supabase.from("fullstack_admin_sessions").delete().lt("expires_at", now);
  const { data, error } = await supabase
    .from("fullstack_admin_sessions")
    .select("email")
    .eq("token_hash", await hashValue(token))
    .gt("expires_at", now)
    .maybeSingle();
  throwIfSupabaseError(error);
  return data?.email || null;
}

export async function getAdminFromCookies() {
  const cookieStore = await cookies();
  return getAdminFromToken(cookieStore.get(ADMIN_COOKIE)?.value);
}

export async function getAdminFromRequest(request: NextRequest) {
  return getAdminFromToken(request.cookies.get(ADMIN_COOKIE)?.value);
}
