import type { Metadata } from "next";
import Link from "next/link";
import { EditorialShell } from "@/tenants/fullstack/components/EditorialShell";
import { blogArticles } from "@/tenants/fullstack/lib/editorial";
import { FULLSTACK_ORIGIN } from "@/tenant-routing";

export const metadata: Metadata = {
  title: "AI, Web Development and Product Engineering Blog",
  description: "Practical analysis from Nishit Gajjar on AI models, benchmarks, full-stack development, Shopify, WordPress and product engineering.",
  alternates: { canonical: "/blog" },
};

export default function BlogPage() {
  const jsonLd = { "@context": "https://schema.org", "@type": "Blog", name: "The Fullstack Guys Blog", url: `${FULLSTACK_ORIGIN}/blog`, author: { "@type": "Person", name: "Nishit Gajjar" }, blogPost: blogArticles.map((article) => ({ "@type": "BlogPosting", headline: article.title, url: `${FULLSTACK_ORIGIN}/blog/${article.slug}`, datePublished: article.published, dateModified: article.updated })) };
  return <EditorialShell>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
    <section className="editorial-hero"><span>INSIGHT / NISHIT GAJJAR</span><h1>Useful thinking for the fast-moving web and AI.</h1><p>Independent analysis of models, benchmarks, product architecture and the choices that matter after the demo.</p></section>
    <section className="article-grid" aria-label="Latest articles">
      {blogArticles.map((article, index) => <article className="article-card" key={article.slug}><span>0{index + 1} · {article.readTime}</span><h2><Link href={`/blog/${article.slug}`}>{article.title}</Link></h2><p>{article.description}</p><Link href={`/blog/${article.slug}`}>Read article →</Link></article>)}
    </section>
  </EditorialShell>;
}
