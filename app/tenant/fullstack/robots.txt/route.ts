import { FULLSTACK_ORIGIN } from "@/tenant-routing";
export function GET() {
  return new Response(`User-agent: *\nAllow: /\nAllow: /blog\nAllow: /news\nAllow: /llms.txt\nAllow: /llms-full.txt\nDisallow: /admin\nDisallow: /api/\nDisallow: /tenant/\n\nSitemap: ${FULLSTACK_ORIGIN}/sitemap.xml\nHost: ${FULLSTACK_ORIGIN}\n`, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
}
