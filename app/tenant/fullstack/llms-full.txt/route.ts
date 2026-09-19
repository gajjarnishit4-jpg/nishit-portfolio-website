import { blogArticles } from "@/tenants/fullstack/lib/editorial";

export function GET() {
  const text = blogArticles.map((article) => `# ${article.title}\n\n${article.description}\n\nUpdated: ${article.updated}\n\n${article.sections.map((section) => `## ${section.heading}\n\n${section.paragraphs.join("\n\n")}${section.points ? `\n\n${section.points.map((point) => `- ${point}`).join("\n")}` : ""}`).join("\n\n")}\n\nSources:\n${article.sources.map((source) => `- ${source.label}: ${source.href}`).join("\n")}`).join("\n\n---\n\n");
  return new Response(`# The Fullstack Guys — complete editorial content\n\n${text}\n`, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
}
