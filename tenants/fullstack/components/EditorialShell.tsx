import Link from "next/link";
import { BrandLogo } from "@/tenants/fullstack/components/BrandPrimitives";

export function EditorialShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="editorial-page">
      <header className="editorial-header">
        <Link href="/" aria-label="Nishit Gajjar home"><BrandLogo /></Link>
        <nav aria-label="Editorial navigation">
          <Link href="/blog">Blog</Link>
          <Link href="/news">AI news</Link>
          <Link href="/#work">Work</Link>
          <Link href="/?contact=1">Contact</Link>
        </nav>
      </header>
      {children}
      <footer className="editorial-footer">
        <div><strong>Nishit Gajjar</strong><span>Independent full-stack freelancer</span></div>
        <nav><Link href="/blog">Blog</Link><Link href="/news">News</Link><Link href="/privacy-policy">Privacy</Link></nav>
      </footer>
    </main>
  );
}
