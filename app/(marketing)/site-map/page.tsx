import Link from 'next/link'
import { allLegacyPaths, LEGACY_PAGES } from '@/lib/legacy'
import { PILLAR_SLUGS, PILLAR_BY_SLUG } from '@/lib/learn/pillars'
import { years } from '@/lib/legacy/blog-index'
import { pageMetadata } from '@/lib/seo'

/**
 * HTML sitemap (closes the footer-linked /site-map 404). Generated from the same
 * sources that feed app/sitemap.ts — static entry points, the Learning Center
 * pillars, every migrated legacy page (grouped by section), and the blog
 * archive — so it stays in sync as the legacy crawl grows.
 */
export const metadata = pageMetadata({
  title: 'Site Map | Crain & Wooley',
  description: 'A directory of every page on the Crain & Wooley website.',
  path: '/site-map',
})

const MAIN: { href: string; label: string }[] = [
  { href: '/', label: 'Home' },
  { href: '/learn', label: 'The Learning Center' },
  { href: '/blogs', label: 'Blog' },
  { href: '/site-search', label: 'Site Search' },
  { href: '/privacy-policy', label: 'Privacy Policy' },
]

const humanize = (s: string) =>
  s.replace(/^\//, '').split('/').pop()!.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

export default function SiteMapPage() {
  // Group every legacy path by its first URL segment (cities, practice areas,
  // about-us, etc.). Privacy is surfaced under Main, so drop it from the groups.
  const groups: Record<string, string[]> = {}
  for (const p of allLegacyPaths()) {
    if (p === '/privacy-policy') continue
    const seg = p.split('/')[1] || 'other'
    ;(groups[seg] ||= []).push(p)
  }
  const segs = Object.keys(groups).sort()

  return (
    <div className="cw-article-bg">
      <header className="legacy-banner">
        <div className="cw-container legacy-banner-inner">
          <nav aria-label="Breadcrumb" className="legacy-crumbs">
            <ol>
              <li><Link href="/">Home</Link></li>
              <li><span aria-current="page">Site Map</span></li>
            </ol>
          </nav>
          <h1 className="legacy-banner-title">Site Map</h1>
        </div>
      </header>

      <div className="cw-container cw-sitemap">
        <section>
          <h2 className="legacy-h2">Main Pages</h2>
          <ul>{MAIN.map((m) => <li key={m.href}><Link href={m.href}>{m.label}</Link></li>)}</ul>
        </section>

        <section>
          <h2 className="legacy-h2">The Learning Center</h2>
          <ul>{PILLAR_SLUGS.map((s) => <li key={s}><Link href={`/learn/${s}`}>{PILLAR_BY_SLUG[s].title}</Link></li>)}</ul>
        </section>

        {segs.map((seg) => (
          <section key={seg}>
            <h2 className="legacy-h2">{humanize('/' + seg)}</h2>
            <ul>
              {groups[seg].sort().map((p) => (
                <li key={p}><Link href={p}>{LEGACY_PAGES[p]?.h1 || humanize(p)}</Link></li>
              ))}
            </ul>
          </section>
        ))}

        <section>
          <h2 className="legacy-h2">Blog Archive</h2>
          <ul>{years().map((y) => <li key={y}><Link href={`/blogs/${y}`}>{y} Posts</Link></li>)}</ul>
        </section>
      </div>
    </div>
  )
}
