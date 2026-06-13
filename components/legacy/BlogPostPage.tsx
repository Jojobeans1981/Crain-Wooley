import Link from 'next/link'
import Image from 'next/image'
import type { ReactNode } from 'react'
import type { LegacyPage } from '@/lib/legacy'
import { blogMeta, relatedPosts, adjacentPosts } from '@/lib/legacy/blog-index'

/**
 * Dedicated blog POST template (Family E). Reuses the closed marketing chrome
 * (header + navy banner + footer via the layout) and adds the blog-specific body:
 * a 2-column layout (article + Related Posts sidebar), a date + canonical byline +
 * category chips, h2/h3 + bullets, prev/next nav, and a closing CTA band. Body text is
 * the cleaned crawl in legacy-pages.json; per-post date/author/categories/image come
 * from the normalized blog-meta layer (owner-approved author + category maps applied).
 */

// Inline parser: **bold** and [text](url) → nodes (internal links preserved for SEO).
function inline(text: string, keyBase: string): ReactNode[] {
  const nodes: ReactNode[] = []
  const re = /\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)]+)\)/g
  let last = 0, i = 0, m: RegExpExecArray | null
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) nodes.push(text.slice(last, m.index))
    if (m[1] !== undefined) nodes.push(<strong key={`${keyBase}-b${i}`}>{m[1]}</strong>)
    else {
      const href = m[3]
      const internal = href.startsWith('/') || href.includes('estateplanningdfw.law')
      const clean = href.replace('https://www.estateplanningdfw.law', '') || '/'
      nodes.push(internal
        ? <Link key={`${keyBase}-l${i}`} href={clean}>{m[2]}</Link>
        : <a key={`${keyBase}-l${i}`} href={href} rel="nofollow noopener" target="_blank">{m[2]}</a>)
    }
    last = re.lastIndex; i++
  }
  if (last < text.length) nodes.push(text.slice(last))
  return nodes
}
const isByline = (b: string) => /\|\s*By\s/i.test(b) && b.length < 120
const isBullets = (b: string) => { const l = b.split('\n').filter((x) => x.trim()); return l.length > 0 && l.every((x) => /^[-*]\s+/.test(x.trim())) }

function RelatedCard({ path, title, date, image }: { path: string; title: string; date: string; image: string | null }) {
  return (
    <Link href={path} className="blog-related-card">
      {image && (
        <span className="blog-related-thumb" aria-hidden="true">
          <Image src={`/legacy/blog/${image}`} alt="" fill sizes="120px" style={{ objectFit: 'cover' }} />
        </span>
      )}
      <span className="blog-related-meta">
        <span className="blog-related-date">{date}</span>
        <span className="blog-related-title">{title}</span>
      </span>
    </Link>
  )
}

export default function BlogPostPage({ page, path }: { page: LegacyPage; path: string }) {
  const norm = path.replace(/\/+$/, '')
  const title = (page.h1?.trim() || page.title.replace(/\s*\|\s*Crain\s*&\s*Wooley\s*$/i, '')).trim()
  const meta = blogMeta(norm)
  const related = relatedPosts(norm, 4)
  const { newer, older } = adjacentPosts(norm)
  const h2set = new Set(page.h2s.map((s) => s.trim()))
  const h3set = new Set(page.h3s.map((s) => s.trim()))
  const blocks = page.body.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean)

  return (
    <>
      <header className="legacy-banner legacy-banner--navy">
        <div className="cw-container legacy-banner-inner">
          <h1 className="legacy-banner-title">{title}</h1>
        </div>
      </header>

      <div className="cw-container blog-post-shell">
        <article className="blog-post-article learn-article">
          <p className="blog-post-byline">
            {meta.date && <span className="blog-post-date">{meta.date}</span>}
            {meta.author && <span className="blog-post-author"> | By {meta.author}</span>}
          </p>
          {meta.categories.length > 0 && (
            <p className="blog-post-cats">
              {meta.categories.map((c) => (
                <Link key={c.slug} href={`/blogs/categories/${c.slug}`} className="blog-post-cat">{c.name}</Link>
              ))}
            </p>
          )}
          {blocks.map((block, i) => {
            const t = block.trim()
            if (i === 0 && page.h1 && t === page.h1.trim()) return null      // drop repeated H1
            if (i <= 2 && isByline(t)) return null                            // drop body's own date/byline line
            if (h2set.has(t)) return <h2 key={i} className="legacy-h2">{t}</h2>
            if (h3set.has(t)) return <h3 key={i} className="legacy-h3">{t}</h3>
            if (isBullets(t)) return (
              <ul key={i} className="learn-ul">
                {t.split('\n').filter((l) => l.trim()).map((l, j) => <li key={j}>{inline(l.trim().replace(/^[-*]\s+/, ''), `${i}-${j}`)}</li>)}
              </ul>
            )
            return <p key={i} className="learn-p">{inline(t.replace(/\n+/g, ' '), `p${i}`)}</p>
          })}

          <nav className="blog-post-nav" aria-label="More posts">
            {older
              ? <Link href={older.path} className="blog-post-nav-link blog-post-nav-prev">‹ {older.title}</Link>
              : <span className="blog-post-nav-link is-disabled" aria-hidden="true" />}
            {newer
              ? <Link href={newer.path} className="blog-post-nav-link blog-post-nav-next">{newer.title} ›</Link>
              : <span className="blog-post-nav-link is-disabled" aria-hidden="true" />}
          </nav>
        </article>

        <aside className="blog-post-aside" aria-label="Related posts">
          <h2 className="blog-related-head">Related Posts</h2>
          <div className="blog-related-list">
            {related.map((p) => <RelatedCard key={p.path} path={p.path} title={p.title} date={p.date} image={blogMeta(p.path).image} />)}
          </div>
        </aside>
      </div>

      <section className="blog-cta" aria-label="Schedule a consultation">
        <div className="cw-container blog-cta-inner">
          <h2 className="blog-cta-title">Have questions about your estate plan?</h2>
          <p className="blog-cta-sub">Talk with the Dallas–Fort Worth estate planning attorneys at Crain &amp; Wooley.</p>
          <div className="blog-cta-actions">
            <Link href="/get-started" className="cw-btn-gold">Schedule a Consultation</Link>
            <Link href="/contact-us" className="cw-btn-ghost">Contact Us</Link>
          </div>
        </div>
      </section>
    </>
  )
}
