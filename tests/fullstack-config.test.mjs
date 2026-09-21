import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");

test("the dedicated site uses the Fullstack Guys brand and Supabase", async () => {
  const [page, splash, storage, schema, env] = await Promise.all([
    read("tenants/fullstack/page.tsx"),
    read("tenants/fullstack/components/SplashScreen.tsx"),
    read("tenants/fullstack/lib/chat-storage.ts"),
    read("supabase/fullstack_schema.sql"),
    read(".env.example"),
  ]);

  assert.match(page, /THE FULLSTACK GUYS/);
  assert.match(splash, /WEB · MOBILE · SHOPIFY · WORDPRESS · SOFTWARE/);
  assert.match(storage, /getSupabaseAdmin/);
  assert.match(env, /SUPABASE_URL=/);
  assert.match(env, /GROQ_API_KEY=/);
  assert.match(env, /HUGGINGFACE_API_KEY=/);

  for (const table of [
    "fullstack_visitors",
    "fullstack_sessions",
    "fullstack_analytics_events",
    "fullstack_chat_sessions",
    "fullstack_chat_messages",
    "fullstack_leads",
    "fullstack_ai_runs",
    "fullstack_admin_actions",
    "fullstack_admin_sessions",
  ]) {
    assert.match(schema, new RegExp(`create table if not exists public\\.${table}`));
  }
});

test("active application code has no legacy database integration", async () => {
  const [packageJson, storage, leadStorage, adminAuth] = await Promise.all([
    read("package.json"),
    read("tenants/fullstack/lib/chat-storage.ts"),
    read("tenants/fullstack/lib/lead-storage.ts"),
    read("tenants/fullstack/lib/admin-auth.ts"),
  ]);
  const activeSources = [packageJson, storage, leadStorage, adminAuth].join("\n");

  assert.doesNotMatch(activeSources, /@neondatabase|DATABASE_URL|drizzle-orm/);
  assert.match(activeSources, /@supabase\/supabase-js|getSupabaseAdmin/);
});

test("session geography supports Vercel and is exposed in admin analytics", async () => {
  const [tracking, storage, overview, dashboard] = await Promise.all([
    read("tenants/fullstack/api/track/route.ts"),
    read("tenants/fullstack/lib/chat-storage.ts"),
    read("tenants/fullstack/api/admin/overview/route.ts"),
    read("tenants/fullstack/components/AdminDashboard.tsx"),
  ]);

  assert.match(tracking, /x-vercel-ip-country/);
  assert.match(tracking, /x-vercel-ip-country-region/);
  assert.match(tracking, /x-vercel-ip-city/);
  assert.match(storage, /existingSession\?\.country/);
  assert.match(overview, /buildCountryStats/);
  assert.match(dashboard, /Sessions by country/);
});

test("the mobile homepage defers heavy media and limits eager hero images", async () => {
  const [page, platformShowcase, layout] = await Promise.all([
    read("tenants/fullstack/page.tsx"),
    read("tenants/fullstack/components/PlatformShowcase.tsx"),
    read("app/layout.tsx"),
  ]);

  assert.doesNotMatch(page, /<SplashScreen/);
  assert.doesNotMatch(page, /preload="auto"/);
  assert.match(page, /Math\.abs\(position\) <= 1/);
  assert.match(page, /fetchPriority=\{position === 0 \? "high" : "low"\}/);
  assert.match(platformShowcase, /loading="lazy"/);
  assert.match(layout, /preload: false/);
});
