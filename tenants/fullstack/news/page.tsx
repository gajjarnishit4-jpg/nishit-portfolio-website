import type { Metadata } from "next";
import { EditorialShell } from "@/tenants/fullstack/components/EditorialShell";
import { getLatestAiNews } from "@/tenants/fullstack/lib/news-feed";

export const metadata: Metadata = { title: "AI and Technology News", description: "Recent AI model releases, research, benchmarks and engineering news from primary sources, curated by Nishit Gajjar.", alternates: { canonical: "/news" } };
export const revalidate = 1800;

export default async function NewsPage() {
  const items = await getLatestAiNews();
  return <EditorialShell>
    <section className="editorial-hero editorial-hero--news"><span>LIVE SOURCE DESK · REFRESHED EVERY 30 MINUTES</span><h1>AI progress, without the leaderboard theatre.</h1><p>Recent releases and research from primary lab feeds. Use the source links to verify claims and publication dates.</p></section>
    <section className="benchmark-desk" aria-label="Model comparisons and live benchmarks">
      <article><span>COMPARISON</span><h2>US vs Chinese AI models</h2><p>A workload-first comparison of capability, price, openness, deployment and risk.</p><a href="/blog/us-vs-chinese-ai-models">Read Nishit&apos;s analysis →</a></article>
      <article><span>LIVE LEADERBOARD</span><h2>LMArena</h2><p>Anonymous human preference comparisons. Treat ranking as one signal, not a product decision.</p><a href="https://lmarena.ai/leaderboard" target="_blank" rel="noreferrer">Open leaderboard ↗</a></article>
      <article><span>LIVE BENCHMARKS</span><h2>Artificial Analysis</h2><p>Compare intelligence, output speed, latency and price across current model APIs.</p><a href="https://artificialanalysis.ai/models" target="_blank" rel="noreferrer">Compare models ↗</a></article>
    </section>
    <section className="news-grid" aria-label="Recent AI news">
      {items.length ? items.map((item) => <article className="news-card" key={`${item.source}-${item.href}`}><div><span>{item.source}</span><time dateTime={item.published}>{item.published ? new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(item.published)) : "Recent"}</time></div><h2><a href={item.href} target="_blank" rel="noreferrer">{item.title}</a></h2>{item.summary ? <p>{item.summary}</p> : null}<a href={item.href} target="_blank" rel="noreferrer">Read original source ↗</a></article>) : <p className="news-empty">Live feeds are temporarily unavailable. Please check the source links again shortly.</p>}
    </section>
  </EditorialShell>;
}
