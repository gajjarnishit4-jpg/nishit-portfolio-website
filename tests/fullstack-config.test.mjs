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
