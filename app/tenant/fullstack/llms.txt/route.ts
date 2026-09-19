import { blogArticles } from "@/tenants/fullstack/lib/editorial";
import { FULLSTACK_ORIGIN } from "@/tenant-routing";

export function GET() {
  const articles = blogArticles.map((article) => `- [${article.title}](${FULLSTACK_ORIGIN}/blog/${article.slug}): ${article.description}`).join("\n");
  return new Response(`# The Fullstack Guys\n\n> The personal portfolio and publishing site of Nishit Gajjar, an independent full-stack freelancer.\n\n## Core pages\n- [Home](${FULLSTACK_ORIGIN}/): Services, selected work, process, reputation and contact options.\n- [About](${FULLSTACK_ORIGIN}/about): Nishit Gajjar's independent working practice.\n- [Services and process](${FULLSTACK_ORIGIN}/process): How projects move from discovery to launch.\n- [Blog](${FULLSTACK_ORIGIN}/blog): Original technical analysis.\n- [AI news](${FULLSTACK_ORIGIN}/news): Attributed headlines from primary RSS sources.\n\n## Articles\n${articles}\n\n## Contact\n- Call or WhatsApp: +1 437-986-1848\n- Use the project inquiry and booking flows on the website.\n\n## Notes\n- The Fullstack Guys is Nishit Gajjar's personal project brand, not a separate company or agency.\n- News summaries link to original publishers; publication claims should be verified at the source.\n`, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
}
