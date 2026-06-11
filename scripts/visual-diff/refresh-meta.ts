/*
 * Refresh legacy-pages.json title/description from the committed baselines for
 * family B+D, so the clone carries the CURRENT original metadata (the Phase-0
 * crawl drifted on a few pages). Curly/straight quote + dash differences are
 * ignored (encoding artifacts). Logs every genuine change; writes the file.
 *
 * Usage: npx tsx scripts/visual-diff/refresh-meta.ts          # dry run
 *        npx tsx scripts/visual-diff/refresh-meta.ts --write  # apply
 */
import { chromium } from 'playwright'
import { readFileSync, writeFileSync, existsSync } from 'node:fs'

const norm = (s: string) => (s || '').replace(/\s+/g, ' ').trim()
const normMeta = (s: string) => norm(s).replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/[–—]/g, '-')

async function main() {
  const write = process.argv.includes('--write')
  const FILE = 'lib/legacy/legacy-pages.json'
  const lp = JSON.parse(readFileSync(FILE, 'utf8')) as Record<string, { type: string; title?: string; description?: string }>
  const fam = new Set(['service', 'resource', 'other', 'location', 'staff'])
  const paths = Object.keys(lp).filter((k) => fam.has(lp[k].type) && k !== '/staff-profiles').sort()

  const b = await chromium.launch()
  const p = await b.newPage()
  await p.route('**', (r) => r.abort())
  const changes: string[] = []
  for (const path of paths) {
    const slug = path.replace(/^\//, '').replace(/\//g, '__')
    const file = `docs/reference/capture/${slug}/desktop/original.html`
    if (!existsSync(file)) continue
    await p.setContent(readFileSync(file, 'utf8'), { waitUntil: 'commit', timeout: 20000 }).catch(() => {})
    await p.waitForTimeout(20)
    const head = await p.evaluate(() => ({ title: document.title, desc: (document.querySelector('meta[name=description]') as HTMLMetaElement | null)?.content || '' }))
    const e = lp[path]
    if (head.title && normMeta(head.title) !== normMeta(e.title || '')) { changes.push(`TITLE ${path}\n   was: ${norm(e.title || '')}\n   now: ${norm(head.title)}`); if (write) e.title = norm(head.title) }
    if (head.desc && normMeta(head.desc) !== normMeta(e.description || '')) { changes.push(`DESC  ${path}\n   was: ${norm(e.description || '').slice(0, 90)}\n   now: ${norm(head.desc).slice(0, 90)}`); if (write) e.description = norm(head.desc) }
  }
  await b.close()
  console.log(`${changes.length} metadata field(s) ${write ? 'updated' : 'differ (dry run)'}:`)
  for (const c of changes) console.log('  ' + c)
  if (write && changes.length) { writeFileSync(FILE, JSON.stringify(lp, null, 2)); console.log(`\nwrote ${FILE}`) }
}
main().catch((e) => { console.error(e); process.exit(1) })
