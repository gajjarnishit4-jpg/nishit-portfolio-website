import { FULLSTACK_ORIGIN } from "@/tenant-routing";
import { blogArticles } from "@/tenants/fullstack/lib/editorial";
export function GET() {
  const paths = ["", "/about", "/process", "/pricing", "/support", "/blog", "/news", "/privacy-policy", "/terms-of-use", "/refund-policy"];
  const staticUrls = paths.map(path => `<url><loc>${FULLSTACK_ORIGIN}${path || "/"}</loc><changefreq>${path === "/news" ? "hourly" : path === "/blog" ? "weekly" : "monthly"}</changefreq></url>`).join("");
  const articleUrls = blogArticles.map(article => `<url><loc>${FULLSTACK_ORIGIN}/blog/${article.slug}</loc><lastmod>${article.updated}</lastmod><changefreq>monthly</changefreq></url>`).join("");
  const xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${staticUrls}${articleUrls}</urlset>`;
  return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
}
