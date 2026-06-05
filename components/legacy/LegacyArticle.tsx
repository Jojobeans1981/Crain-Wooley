import Link from 'next/link'
import type { LegacyPage } from '@/lib/legacy'
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

export default function LegacyArticle({ page }: { page: LegacyPage }) {
  const h2set = new Set(page.h2s.map((s) => s.trim()))
  const h3set = new Set(page.h3s.map((s) => s.trim()))
  const blocks = page.body.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean)

  return (
    <article className="learn-article cw-container">
      <p className="learn-eyebrow">{KICKER[page.type] ?? 'Crain & Wooley'}</p>
      <h1 className="learn-h1-article">{page.h1 || page.title}</h1>

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

      <div className="learn-bookcta">
        <p className="m-0 mb-3.5">
          Crain &amp; Wooley offers comprehensive, <strong>flat-rate</strong> estate planning across Dallas–Fort Worth —
          offices in Plano, Mansfield, and Fort Worth, every document explained in plain language.
        </p>
        <Link href="/qualify" className="cw-btn-primary">Book a consultation →</Link>
        <span className="text-cw-ink-mute text-[14px] ml-3">Plano: (972) 945-1610</span>
      </div>

      <p className="learn-disclaimer">
        The information on this page is for general information purposes only and is not legal advice.
      </p>
    </article>
  )
}
