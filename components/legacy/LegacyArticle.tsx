import Link from 'next/link'
import Image from 'next/image'
import type { LegacyPage } from '@/lib/legacy'
import { getSectionNav, type SectionNav, type SectionNavItem } from '@/lib/legacy/section-nav'
import { teamMemberByPath } from '@/lib/legacy/team'
import { ValueProps, ReviewsSection, Locations } from '@/components/site/home/sections'
import type { ReactNode } from 'react'

/**
 * Renders a migrated legacy page from cleaned crawl text. The body is plain
 * paragraphs separated by blank lines; headings are reconstructed by matching a
 * block against the page's h2s/h3s arrays. Inline **bold** and [text](url) are
 * recovered so internal links survive (SEO). Warm-editorial design system.
 */

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
  // Strip the SEO "| Crain & Wooley" suffix when the metadata title is reused as
  // display text — page.h1 is empty on ~166 pages, which leaked the SEO title
  // (e.g. "Flat Rate Services | Crain & Wooley") into the visible H1.
  const title = (page.h1?.trim() || page.title.replace(/\s*\|\s*Crain\s*&\s*Wooley\s*$/i, '')).trim()
  const nav = getSectionNav(path)
  // Staff bio pages show the member's portrait (same headshot as the team listing).
  const member = page.type === 'staff' ? teamMemberByPath(path) : undefined

  return (
    <>
    <div className="cw-article-bg">
      {/* Page-title band — full-bleed gold band with the page title. No breadcrumb,
          badges, or invented chrome: interior pages on the original have none.
          Blog posts keep their own banner treatment. */}
      <header className={`legacy-banner${page.type === 'blog_post' ? ' legacy-banner--blog' : ' legacy-banner--navy'}`}>
        <div className="cw-container legacy-banner-inner">
          <h1 className="legacy-banner-title">{title}</h1>
        </div>
      </header>

      <div className={nav ? 'cw-container legacy-shell' : `cw-container legacy-body${page.type === 'blog_post' ? ' legacy-body--blog' : ''}`}>
        {nav && <SectionSidebar nav={nav} />}
        <div className="legacy-article-col">
        {member && (
          <div className="legacy-bio-portrait">
            {/* decorative — the name is the page <h1> in the banner above */}
            <Image src={member.photo} alt="" fill sizes="(max-width: 640px) 100vw, 240px" style={{ objectFit: 'cover' }} priority />
          </div>
        )}
        <article className="learn-article">
          {page.video && (
            <div className="legacy-video">
              {/* Hosted on the Scorpion /media origin — embedded, not committed. */}
              <video controls preload="metadata" playsInline src={page.video}>
                <track kind="captions" />
              </video>
            </div>
          )}
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

        </article>
        </div>
      </div>
    </div>

    {/* Standard interior closing zone — the same designed bands the original
        site puts below every interior page (value props → reviews → schedule).
        Reuses the homepage section components so all legacy pages match at once. */}
    <ValueProps />
    <ReviewsSection />
    <Locations />
    </>
  )
}
