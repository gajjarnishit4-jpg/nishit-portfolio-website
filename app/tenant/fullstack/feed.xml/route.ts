import { blogArticles } from "@/tenants/fullstack/lib/editorial";
import { FULLSTACK_ORIGIN } from "@/tenant-routing";

function escapeXml(value: string) { return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;"); }
export function GET() {
  const items = blogArticles.map((article) => `<item><title>${escapeXml(article.title)}</title><link>${FULLSTACK_ORIGIN}/blog/${article.slug}</link><guid>${FULLSTACK_ORIGIN}/blog/${article.slug}</guid><pubDate>${new Date(article.published).toUTCString()}</pubDate><description>${escapeXml(article.description)}</description></item>`).join("");
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>The Fullstack Guys Blog</title><link>${FULLSTACK_ORIGIN}/blog</link><description>AI, web development and product engineering analysis by Nishit Gajjar.</description>${items}</channel></rss>`, { headers: { "Content-Type": "application/rss+xml; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
}
