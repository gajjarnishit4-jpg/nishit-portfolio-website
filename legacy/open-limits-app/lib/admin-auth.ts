import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { getSql } from "@/app/lib/neon";

export const ADMIN_COOKIE = "open_limits_admin";

async function hashValue(value: string) {
  const encoded = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function adminEmail() {
  return process.env.ADMIN_EMAIL || "admin@theopenlimits.com";
}

function adminPassword() {
  return process.env.ADMIN_PASSWORD || "";
}

export async function ensureAdminTables() {
  const sql = getSql();
  await sql`
    CREATE TABLE IF NOT EXISTS open_limits_admin_sessions (
      token_hash TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      expires_at TIMESTAMPTZ NOT NULL
    )
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS open_limits_admin_sessions_expires_idx
      ON open_limits_admin_sessions (expires_at)
  `;
}

export async function verifyAdminCredentials(email: string, password: string) {
  return (
    email.trim().toLowerCase() === adminEmail().toLowerCase() &&
    Boolean(adminPassword()) &&
    password === adminPassword()
  );
}

export async function createAdminSession(email: string) {
  await ensureAdminTables();
  const token = `${crypto.randomUUID()}.${crypto.randomUUID()}`;
  const tokenHash = await hashValue(token);
  const sql = getSql();
  await sql`
    INSERT INTO open_limits_admin_sessions (token_hash, email, expires_at)
    VALUES (${tokenHash}, ${email.toLowerCase()}, now() + interval '7 days')
  `;
  return token;
}

export async function destroyAdminSession(token?: string | null) {
  if (!token) return;
  await ensureAdminTables();
  const sql = getSql();
  await sql`DELETE FROM open_limits_admin_sessions WHERE token_hash = ${await hashValue(token)}`;
}

export async function getAdminFromToken(token?: string | null) {
  if (!token) return null;
  await ensureAdminTables();
  const sql = getSql();
  await sql`DELETE FROM open_limits_admin_sessions WHERE expires_at < now()`;
  const rows = await sql`
    SELECT email
    FROM open_limits_admin_sessions
    WHERE token_hash = ${await hashValue(token)}
      AND expires_at > now()
    LIMIT 1
  `;
  return (rows[0]?.email as string | undefined) || null;
}

export async function getAdminFromCookies() {
  const cookieStore = await cookies();
  return getAdminFromToken(cookieStore.get(ADMIN_COOKIE)?.value);
}

export async function getAdminFromRequest(request: NextRequest) {
  return getAdminFromToken(request.cookies.get(ADMIN_COOKIE)?.value);
}
