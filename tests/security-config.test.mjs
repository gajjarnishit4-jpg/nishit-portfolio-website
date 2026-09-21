import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");

test("advertising measurement requires an explicit stored choice", async () => {
  const [layout, pixel, ads, page] = await Promise.all([
    read("app/layout.tsx"),
    read("tenants/fullstack/components/OpenAIAdsPixel.tsx"),
    read("tenants/fullstack/lib/openai-ads.ts"),
    read("tenants/fullstack/page.tsx"),
  ]);

  assert.doesNotMatch(layout, /fullstack-openai-ads-consent/);
  assert.doesNotMatch(layout, /bzrcdn\.openai\.com/);
  assert.match(pixel, /consent !== "accepted"/);
  assert.match(pixel, /choiceOpen \?/);
  assert.match(ads, /getItem\("fullstack-openai-ads-consent"\) === "accepted"/);
  assert.doesNotMatch(page, /CHAT_AUTO_OPEN|CHAT_AUTO_OPEN_DELAY/);
});

test("public trust routes, canonical origin, and browser protections are configured", async () => {
  const [routing, proxy, config] = await Promise.all([
    read("tenant-routing.ts"),
    read("proxy.ts"),
    read("next.config.ts"),
  ]);

  assert.match(routing, /thefullstackguys\.us/);
  assert.doesNotMatch(routing, /thefullstackguys\.com/);
  assert.match(proxy, /"\/cookie-policy"/);
  assert.match(proxy, /"\/legal-notice"/);
  assert.match(config, /Content-Security-Policy/);
  assert.match(config, /frame-ancestors 'none'/);
  assert.match(config, /X-Content-Type-Options/);
});
