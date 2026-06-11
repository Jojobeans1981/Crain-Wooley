/*
 * Sidebar link-validation (DECISION 2: flag only, never rewrite). Checks every
 * census sidebar link against the clone's route tree (legacy-pages.json catch-all
 * paths + app/ page routes + next.config redirect sources). Writes
 * docs/reference/sidebar-link-check.md. tel:/mailto:/http(s) external links are
 * skipped.
 *
 * Usage: npx tsx scripts/visual-diff/sidebar-link-check.ts
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const norm = (p: string) => ('/' + p.replace(/^\/+|\/+$/g, '')).toLowerCase() || '/'

// app/ page routes (static segments; [..] dynamic + (groups) handled)
function appRoutes(dir: string, base = ''): string[] {
  const out: string[] = []
  for (const ent of readdirSync(dir, { withFileTypes: true })) {
    if (!ent.isDirectory()) { if (/^page\.(t|j)sx?$/.test(ent.name)) out.push(base || '/'); continue }
    const seg = ent.name
    if (seg.startsWith('[')) continue // dynamic — covered by legacy catch-all
    const nextBase = seg.startsWith('(') && seg.endsWith(')') ? base : `${base}/${seg}`
    out.push(...appRoutes(join(dir, ent.name), nextBase))
  }
  return out
}

function main() {
  const census = JSON.parse(readFileSync('docs/reference/page-structure-census.json', 'utf8')) as Record<string, { family?: string; sidebar?: { links?: { text: string; href: string }[] } }>
  const lp = JSON.parse(readFileSync('lib/legacy/legacy-pages.json', 'utf8')) as Record<string, unknown>

  const routes = new Set<string>()
  for (const k of Object.keys(lp)) routes.add(norm(k))
  for (const r of appRoutes('app')) routes.add(norm(r))
  // next.config redirect sources (best-effort scrape of `source: '...'`)
  const cfg = readFileSync('next.config.ts', 'utf8')
  for (const m of cfg.matchAll(/source:\s*'([^']+)'/g)) routes.add(norm(m[1].replace(/:[^/]+/g, 'X')))

  // collect unique internal sidebar links + which pages use them
  const links = new Map<string, Set<string>>()
  for (const [path, rec] of Object.entries(census)) {
    for (const l of rec.sidebar?.links || []) {
      const href = (l.href || '').trim()
      if (!href || /^(tel:|mailto:|https?:|#|javascript:)/i.test(href)) continue
      if (!links.has(href)) links.set(href, new Set())
      links.get(href)!.add(path)
    }
  }

  const missing: { href: string; pages: number; sample: string }[] = []
  for (const [href, pages] of links) {
    const n = norm(href.split('#')[0].split('?')[0])
    const ok = routes.has(n) || [...routes].some((r) => r.includes('x') && new RegExp('^' + r.replace(/x/g, '[^/]+') + '$').test(n))
    if (!ok) missing.push({ href, pages: pages.size, sample: [...pages][0] })
  }
  missing.sort((a, b) => b.pages - a.pages)

  let md = `# Sidebar link check\n\nValidated ${links.size} distinct internal sidebar links against the clone route tree (legacy catch-all paths + app routes + redirects). External / tel: / mailto: skipped. **Flagged only — not rewritten** (DECISION 2).\n\n`
  md += missing.length ? `## ${missing.length} link(s) with no matching clone route\n\n| link | # pages | sample page |\n| --- | --- | --- |\n` + missing.map((m) => `| \`${m.href}\` | ${m.pages} | ${m.sample} |`).join('\n') + '\n' : '## All sidebar links resolve to a clone route ✅\n'
  writeFileSync('docs/reference/sidebar-link-check.md', md)
  console.log(`checked ${links.size} links | ${missing.length} unresolved`)
  for (const m of missing.slice(0, 20)) console.log(`  404? ${m.href}  (${m.pages} pages)`)
}
main()
