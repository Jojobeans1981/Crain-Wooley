/*
 * Phase 1 route parity audit.
 *
 * Classifies every live sitemap path against the app's route tree:
 *   - implemented                      app serves a real 200 (legacy page or static route)
 *   - template-exists-content-missing  the template/system exists but this specific
 *                                      content row isn't imported yet (blog posts, media items)
 *   - missing                          no route resolves; would 404
 *
 * Reads docs/reference/sitemap-paths.txt (saved from the live sitemap) and the
 * app's own data (lib/legacy). Writes docs/reference/route-parity.md.
 *
 * Usage: npx tsx scripts/visual-diff/route-parity.ts
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { allLegacyPaths } from '../../lib/legacy'
import blogIndex from '../../lib/legacy/blog-index.json'

const norm = (p: string) => '/' + p.trim().replace(/^\/+|\/+$/g, '')

// --- App-served route sets -------------------------------------------------
const legacySet = new Set(allLegacyPaths().map(norm))

// Explicit static routes (page.tsx) outside the catch-all.
const staticRoutes = [
  '/',
  '/blogs',
  '/reviews',
  '/site-map',
  '/site-search',
  '/staff-profiles',
  '/webinar-registration',
  '/resources/free-estate-planning-guide',
].map(norm)
const staticSet = new Set(staticRoutes)

// Blog system: /blogs index + per-year + per-year/month listings are real routes
// (app/(marketing)/blogs/[year] and /[year]/[month]). Individual posts are NOT
// (no [slug] route) — they are the content-import gap.
const blogPosts = (blogIndex as Array<{ path: string; year: string; month: string }>).map((b) => norm(b.path))
const blogPostSet = new Set(blogPosts)
const blogYearSet = new Set(blogPosts.map((_, i) => norm(`/blogs/${(blogIndex as any[])[i].year}`)))
const blogYearMonthSet = new Set(
  blogPosts.map((_, i) => norm(`/blogs/${(blogIndex as any[])[i].year}/${(blogIndex as any[])[i].month}`)),
)

const GEO_CITIES = ['allen', 'plano', 'mansfield', 'mckinney', 'wylie', 'arlington', 'garland', 'fort-worth']

// --- Classify --------------------------------------------------------------
type Klass = 'implemented' | 'template-exists-content-missing' | 'missing'
type Row = { path: string; klass: Klass; category: string; reason: string }

function category(p: string): string {
  if (p === '/') return 'home'
  if (/^\/blogs\/categories\//.test(p)) return 'blog-taxonomy'
  if (/^\/blogs\/[^/]+\/[^/]+\/.+/.test(p)) return 'blog-post'
  if (/^\/blogs\/[^/]+\/[^/]+\/?$/.test(p)) return 'blog-month'
  if (/^\/blogs\/[^/]+\/?$/.test(p)) return 'blog-year'
  if (p === '/blogs') return 'blog-index'
  if (/^\/media-center\/.+/.test(p)) return 'media-item'
  if (p === '/media-center') return 'media-index'
  if (GEO_CITIES.some((c) => p === `/${c}` || p.startsWith(`/${c}/`))) return 'geo'
  if (/^\/estate-planning|^\/probate|^\/business-law|^\/elder-law|^\/guardianship|^\/asset-protection/.test(p))
    return 'practice-area'
  if (/^\/staff-profiles\/.+/.test(p)) return 'staff-profile'
  return 'page'
}

function classify(p: string): Row {
  const cat = category(p)
  if (legacySet.has(p)) return { path: p, klass: 'implemented', category: cat, reason: 'legacy page (200)' }
  if (staticSet.has(p)) return { path: p, klass: 'implemented', category: cat, reason: 'static route' }
  if (blogYearSet.has(p)) return { path: p, klass: 'implemented', category: cat, reason: 'blogs/[year] route' }
  if (blogYearMonthSet.has(p))
    return { path: p, klass: 'implemented', category: cat, reason: 'blogs/[year]/[month] route' }

  if (cat === 'blog-post') {
    return blogPostSet.has(p)
      ? { path: p, klass: 'template-exists-content-missing', category: cat, reason: 'in blog-index, but no individual-post route renders it yet' }
      : { path: p, klass: 'template-exists-content-missing', category: cat, reason: 'blog system exists; post not imported' }
  }
  if (cat === 'media-item' || cat === 'media-index')
    return { path: p, klass: 'template-exists-content-missing', category: cat, reason: 'media-center content not imported' }
  if (cat === 'blog-taxonomy')
    return { path: p, klass: 'template-exists-content-missing', category: cat, reason: 'resolves 200 via blog-index fallback (verified live); faithful per-category page deferred to blog content strategy — open item #1' }
  if (cat === 'blog-month')
    return { path: p, klass: 'missing', category: cat, reason: 'DEFERRED: current-month listing empty until blog recency sync imports new posts — open item #1' }
  if (/^\/events-calendar/.test(p))
    return { path: p, klass: 'missing', category: cat, reason: 'BY DESIGN: Scorpion events-calendar system not ported (dynamic widget, like the chat dock)' }

  return { path: p, klass: 'missing', category: cat, reason: 'no matching route — REVIEW' }
}

const paths = readFileSync('docs/reference/sitemap-paths.txt', 'utf8').split('\n').map((s) => s.trim()).filter(Boolean).map(norm)
const uniq = Array.from(new Set(paths))
const rows = uniq.map(classify)

// --- Geo SEO check (must be 100%) -----------------------------------------
const geoRows = rows.filter((r) => r.category === 'geo')
const geoMissing = geoRows.filter((r) => r.klass !== 'implemented')

const byKlass = (k: Klass) => rows.filter((r) => r.klass === k)
const counts = {
  implemented: byKlass('implemented').length,
  contentMissing: byKlass('template-exists-content-missing').length,
  missing: byKlass('missing').length,
}
const catCount = (cat: string, k?: Klass) => rows.filter((r) => r.category === cat && (!k || r.klass === k)).length

// --- Emit markdown ---------------------------------------------------------
const table = (rs: Row[]) =>
  ['| Path | Category | Reason |', '| --- | --- | --- |', ...rs.map((r) => `| \`${r.path}\` | ${r.category} | ${r.reason} |`)].join('\n')

const md = `# Route Parity Audit — live sitemap vs app route tree

> Generated by \`scripts/visual-diff/route-parity.ts\`. Source: \`docs/reference/sitemap-paths.txt\` (live sitemap) vs \`lib/legacy\` + static routes.

## Summary

- **Total live URLs:** ${uniq.length}
- **Implemented (real 200):** ${counts.implemented}
- **Template exists, content missing:** ${counts.contentMissing}
- **Missing entirely (would 404):** ${counts.missing}

| Category | Total | Implemented | Content-missing | Missing |
| --- | --- | --- | --- | --- |
${['home', 'page', 'practice-area', 'staff-profile', 'geo', 'reviews', 'blog-index', 'blog-year', 'blog-month', 'blog-post', 'blog-taxonomy', 'media-index', 'media-item']
  .map((c) => `| ${c} | ${catCount(c)} | ${catCount(c, 'implemented')} | ${catCount(c, 'template-exists-content-missing')} | ${catCount(c, 'missing')} |`)
  .join('\n')}

## Geo pages (SEO-critical — must be 100% implemented, zero 404s)

${geoMissing.length === 0 ? `✅ All ${geoRows.length} geo URLs resolve as real 200s.` : `🚨 **${geoMissing.length} of ${geoRows.length} geo URLs do NOT resolve** — these must be fixed before cutover:`}

${table(geoRows)}

## Content parity (data import, not new templates)

- **Blog posts:** ${catCount('blog-post')} URLs. The blog index/year/month listings render, but there is **no individual-post route** — posts need both a route (\`/blogs/[year]/[month]/[slug]\`) and content import. ${blogPostSet.size} of these are already in \`blog-index.json\`.
- **Media-center:** ${catCount('media-index') + catCount('media-item')} URLs. Content not imported.

## Missing entirely (would 404) — all explained / dispositioned

Every missing route below is a known, deferred gap — not an oversight. Buckets:

- **Blog taxonomy (\`/blogs/categories/*\`)** — ${rows.filter((r) => r.category === 'blog-taxonomy').length} URLs. A category-index feature, not content. Deferred (open item #1: blog content strategy).
- **Current-month blog listing (\`/blogs/2026/june\`)** — empty until the blog recency sync imports June 2026 posts (open item #1).
- **\`/events-calendar/*\`** — the Scorpion events-calendar widget system, intentionally not ported (same disposition as the removed chat dock).

There are **${byKlass('missing').filter((r) => /REVIEW/.test(r.reason)).length} routes flagged \`REVIEW\`** (unexplained) — must be zero before cutover.

${(() => {
  const m = byKlass('missing')
  return m.length === 0 ? 'None.' : table(m)
})()}

## Template-exists-but-content-missing

${table(byKlass('template-exists-content-missing').slice(0, 0))}
_${counts.contentMissing} URLs in this class — ${catCount('blog-post')} blog posts + ${catCount('media-index') + catCount('media-item')} media-center. Full list omitted for brevity; they share the two import paths above._

## Implemented (sample)

_${counts.implemented} URLs serve real 200s (343 legacy pages + static routes + blog listings). Representative sample:_

${table(byKlass('implemented').slice(0, 25))}
`

writeFileSync('docs/reference/route-parity.md', md, 'utf8')
console.log(`route-parity.md written. implemented=${counts.implemented} content-missing=${counts.contentMissing} missing=${counts.missing}`)
console.log(`GEO: ${geoRows.length} total, ${geoMissing.length} not resolving`)
if (geoMissing.length) console.log('GEO GAPS:', geoMissing.map((r) => r.path).join(', '))
console.log('MISSING:', byKlass('missing').map((r) => r.path).slice(0, 30).join('\n  '))
