import Link from 'next/link'
import Image from 'next/image'
import type { LegacyPage } from '@/lib/legacy'
import { getSectionNav, type SectionNav, type SectionNavItem } from '@/lib/legacy/section-nav'
import blogImages from '@/lib/legacy/blog-images.json'
import type { ReactNode } from 'react'

/**
 * Renders a migrated legacy page from cleaned crawl text. The body is plain
 * paragraphs separated by blank lines; headings are reconstructed by matching a
 * block against the page's h2s/h3s arrays. Inline **bold** and [text](url) are
 * recovered so internal links survive (SEO). Warm-editorial design system.
 */

const KICKER: Record<string, string> = {
  service: 'Estate Planning',
  practice_area: 'Estate Planning',
  location: 'Serving Your Area',
  staff: 'Our Team',
  resource: 'Resources',
  contact: 'Contact',
  blog_post: 'From the Blog',
  other: 'Crain & Wooley',
}

// Inline parser: **bold** and [text](url) → nodes.
function inline(text: string, keyBase: string): ReactNode[] {
  const nodes: ReactNode[] = []
  const re = /\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)]+)\)/g
  let last = 0
  let m: RegExpExecArray | null
  let i = 0
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) nodes.push(text.slice(last, m.index))
    if (m[1] !== undefined) {
      nodes.push(<strong key={`${keyBase}-b${i}`}>{m[1]}</strong>)
    } else {
      const href = m[3]
      const internal = href.startsWith('/') || href.includes('estateplanningdfw.law')
      const clean = href.replace('https://www.estateplanningdfw.law', '') || '/'
      nodes.push(
        internal
          ? <Link key={`${keyBase}-l${i}`} href={clean}>{m[2]}</Link>
          : <a key={`${keyBase}-l${i}`} href={href} rel="nofollow noopener" target="_blank">{m[2]}</a>,
      )
    }
    last = re.lastIndex
    i++
  }
  if (last < text.length) nodes.push(text.slice(last))
  return nodes
}

function isBylineBlock(block: string) {
  return /\|\s*By\s/i.test(block) && block.length < 120
}
function isBulletBlock(block: string) {
  const lines = block.split('\n').filter((l) => l.trim())
  return lines.length > 0 && lines.every((l) => /^[-*]\s+/.test(l.trim()))
}

function SidebarItem({ item }: { item: SectionNavItem }) {
  const cls = item.active ? 'is-active' : item.ancestor ? 'is-ancestor' : undefined
  return (
    <li>
      <Link href={item.path} className={cls} aria-current={item.active ? 'page' : undefined}>{item.label}</Link>
      {item.children.length > 0 && (
        <ul>
          {item.children.map((c) => (
            <li key={c.path}>
              <Link href={c.path} className={c.active ? 'is-active' : undefined} aria-current={c.active ? 'page' : undefined}>{c.label}</Link>
            </li>
          ))}
        </ul>
      )}
    </li>
  )
}

// Section / sibling nav — native <details> so the mobile toggle is keyboard-
// operable with no client JS; CSS forces it open on desktop.
function SectionSidebar({ nav }: { nav: SectionNav }) {
  return (
    <details className="legacy-sidebar">
      <summary className="legacy-sidebar-toggle">{nav.label}<span aria-hidden="true" className="legacy-sidebar-chevron" /></summary>
      <nav aria-label="Section" className="legacy-sidebar-body">
        {nav.landingPath
          ? <Link href={nav.landingPath} className={`legacy-sidebar-head${nav.landingActive ? ' is-active' : ''}`} aria-current={nav.landingActive ? 'page' : undefined}>{nav.label}</Link>
          : <span className="legacy-sidebar-head">{nav.label}</span>}
        <ul>
          {nav.items.map((item) => <SidebarItem key={item.path} item={item} />)}
        </ul>
      </nav>
    </details>
  )
}

export default function LegacyArticle({ page, path }: { page: LegacyPage; path: string }) {
  const h2set = new Set(page.h2s.map((s) => s.trim()))
  const h3set = new Set(page.h3s.map((s) => s.trim()))
  const blocks = page.body.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean)
  const section = KICKER[page.type] ?? 'Crain & Wooley'
  const title = page.h1 || page.title
  const nav = getSectionNav(path)
  // Blog posts carry a re-hosted featured image (parity with the source).
  const featured = page.type === 'blog_post' ? (blogImages as Record<string, string>)[path] : undefined

  return (
    <div className="cw-article-bg">
      {/* Page-title block — dark slate banner with breadcrumb + H1 (matches live interior) */}
      <header className="legacy-banner">
        <div className="cw-container legacy-banner-inner">
          <nav aria-label="Breadcrumb" className="legacy-crumbs">
            <ol>
              <li><Link href="/">Home</Link></li>
              <li><span>{section}</span></li>
              <li><span aria-current="page">{title}</span></li>
            </ol>
          </nav>
          <h1 className="legacy-banner-title">{title}</h1>
        </div>
      </header>

      <div className={nav ? 'cw-container legacy-shell' : 'cw-container legacy-body'}>
        {nav && <SectionSidebar nav={nav} />}
        <div className="legacy-article-col">
        {featured && (
          <div className="legacy-blog-hero">
            {/* decorative — the headline conveys the topic */}
            <Image src={`/legacy/blog/${featured}`} alt="" fill sizes="(max-width: 980px) 100vw, 760px" style={{ objectFit: 'cover' }} priority />
          </div>
        )}
        <article className="learn-article">
          {blocks.map((block, i) => {
        // The H1 line sometimes repeats as the first body block — skip it.
        if (i === 0 && page.h1 && block.trim() === page.h1.trim()) return null
        const t = block.trim()
        if (h2set.has(t)) return <h2 key={i} className="legacy-h2">{t}</h2>
        if (h3set.has(t)) return <h3 key={i} className="legacy-h3">{t}</h3>
        if (i === 0 && isBylineBlock(t)) return <p key={i} className="legacy-byline">{t}</p>
        if (isBulletBlock(t)) {
          const items = t.split('\n').filter((l) => l.trim()).map((l) => l.trim().replace(/^[-*]\s+/, ''))
          return (
            <ul key={i} className="learn-ul">
              {items.map((it, j) => <li key={j}>{inline(it, `${i}-${j}`)}</li>)}
            </ul>
          )
        }
            // collapse soft line breaks within a paragraph into spaces
            return <p key={i} className="learn-p">{inline(t.replace(/\n+/g, ' '), `p${i}`)}</p>
          })}

          <aside className="learn-bookcta" aria-label="Schedule a consultation">
            <p className="m-0 mb-3.5">
              Crain &amp; Wooley offers comprehensive, <strong>flat-rate</strong> estate planning across Dallas–Fort Worth —
              offices in Plano, Mansfield, and Fort Worth, every document explained in plain language.
            </p>
            <Link href="/get-started" className="cw-btn-primary">Book a consultation →</Link>
            <span className="text-cw-ink-mute text-[14px] ml-3">Plano: (972) 945-1610</span>
          </aside>

          <p className="learn-disclaimer">
            The information on this page is for general information purposes only and is not legal advice.
          </p>
        </article>
        </div>
      </div>
    </div>
  )
}
