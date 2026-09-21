import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EditorialShell } from "@/tenants/fullstack/components/EditorialShell";
import { blogArticles, getBlogArticle } from "@/tenants/fullstack/lib/editorial";
import { FULLSTACK_ORIGIN } from "@/tenant-routing";

export function generateStaticParams() { return blogArticles.map(({ slug }) => ({ slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const article = getBlogArticle((await params).slug);
  if (!article) return {};
  return { title: article.title, description: article.description, authors: [{ name: "Nishit Gajjar" }], alternates: { canonical: `/blog/${article.slug}` }, openGraph: { type: "article", title: article.title, description: article.description, publishedTime: article.published, modifiedTime: article.updated, authors: ["Nishit Gajjar"] } };
}

export default async function BlogArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const article = getBlogArticle((await params).slug);
  if (!article) notFound();
  const jsonLd = { "@context": "https://schema.org", "@type": "Article", headline: article.title, description: article.description, datePublished: article.published, dateModified: article.updated, mainEntityOfPage: `${FULLSTACK_ORIGIN}/blog/${article.slug}`, author: { "@type": "Person", name: "Nishit Gajjar", url: `${FULLSTACK_ORIGIN}/about` }, publisher: { "@type": "Person", name: "Nishit Gajjar" } };
  return <EditorialShell>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
    <article className="longform-article">
      <header><Link href="/blog">← All articles</Link><span>{article.updated} · {article.readTime}</span><h1>{article.title}</h1><p>{article.description}</p></header>
      {article.sections.map((section) => <section key={section.heading}><h2>{section.heading}</h2>{section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}{section.points ? <ul>{section.points.map((point) => <li key={point}>{point}</li>)}</ul> : null}</section>)}
      <aside><h2>Primary references and live benchmarks</h2>{article.sources.map((source) => <a href={source.href} target="_blank" rel="noreferrer" key={source.href}>{source.label} ↗</a>)}</aside>
    </article>
  </EditorialShell>;
}
