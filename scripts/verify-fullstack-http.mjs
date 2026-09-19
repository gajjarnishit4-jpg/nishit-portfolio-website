import assert from "node:assert/strict";
import http from "node:http";
const base = process.env.TENANT_TEST_BASE_URL || "http://localhost:3003";
const host = "thefullstackguys.com";
const legacy = /open[ _-]?limits|theopenlimits|1385887806813423|5TgKHqLs9uaMYoWgBMjTCh|connect\.facebook\.net|bzr\.openai\.com/i;
async function get(path, selectedHost = host) {
  return new Promise((resolve, reject) => {
    const req = http.get(new URL(path, base), { headers: { Host: selectedHost } }, response => {
      const chunks=[];
      response.on("data", chunk=>chunks.push(chunk));
      response.on("end", ()=>resolve(new Response(Buffer.concat(chunks), {status:response.statusCode})));
      response.on("error", reject);
    });
    req.on("error", reject);
  });
}
const paths = ["/", "/about", "/process", "/pricing", "/support", "/privacy-policy", "/terms-of-use", "/refund-policy", "/admin"];
let home="";
for (const path of paths) {
  const response=await get(path); assert.equal(response.status,200,path);
  const html=await response.text(); assert.doesNotMatch(html,legacy,path);
  assert.match(html,/Nishit Gajjar|NISHIT GAJJAR/,path);
  assert.ok(html.includes(`https://thefullstackguys.com${path}`),`canonical missing for ${path}`);
  if (path==="/") home=html;
}
const scripts=[...home.matchAll(/<script[^>]+src="([^"]+)"/g)].map(m=>m[1]);
for(const path of scripts) {
  const response=await get(path);assert.equal(response.status,200,path);
  assert.doesNotMatch(await response.text(),legacy,`delivered script ${path}`);
}
for (const path of ["/robots.txt","/sitemap.xml"]) {
  const response=await get(path);assert.equal(response.status,200,path);
  const text=await response.text();assert.match(text,/https:\/\/thefullstackguys\.com/);assert.doesNotMatch(text,legacy);
}
for(const path of ["/open-limits-logo.png","/og.png","/tenant/fullstack","/api/track","/api/openai-ads-event"]) {
  const response=await get(path);assert.ok(response.status>=400,`unexpected access to ${path}`);assert.doesNotMatch(await response.text(),legacy);
}
for(const path of ["/tenant-assets/fullstack/fullstack-logo.svg","/tenant-assets/fullstack/portfolio/project-01.jpg","/tenant-assets/fullstack/studio-reel.mp4"]) {
  const response=await get(path);assert.equal(response.status,200,path);await response.arrayBuffer();
}
const original=await get("/","openlimits.agency");assert.equal(original.status,200);assert.match(await original.text(),/Open Limits/);
const www=await get("/","www.thefullstackguys.com");assert.equal(www.status,200);assert.match(await www.text(),/NISHIT GAJJAR/);
console.log(`Verified ${paths.length} pages, ${scripts.length} delivered scripts, tenant assets, SEO files, excluded routes, www hostname and unchanged original-domain homepage. No database writes performed.`);
