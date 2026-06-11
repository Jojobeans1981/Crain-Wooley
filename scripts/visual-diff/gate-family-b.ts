/*
 * Offline body-completeness gate for every family-B page (reproducible: reads the
 * committed baseline HTML, never the live site). Mirrors the extractor's capture
 * rules and measures readable body text the clone does NOT render: text in content
 * bands outside a captured block (p/li/h/ul, article/blockquote/figcaption,
 * em/strong>=20) and outside masked regions (closers/accordions/banner/nav/footer).
 * ratio = (total - uncaptured) / total. Lists pages < 99% with the omitted text.
 *
 * Usage: npx tsx scripts/visual-diff/gate-family-b.ts
 */
import { chromium } from 'playwright'
import { readFileSync, existsSync } from 'node:fs'

async function main() {
  const lp = JSON.parse(readFileSync('lib/legacy/legacy-pages.json', 'utf8')) as Record<string, { type: string }>
  const fam = new Set(['service', 'resource', 'other'])
  const paths = Object.keys(lp).filter((k) => fam.has(lp[k].type)).sort()

  const b = await chromium.launch()
  const p = await b.newPage()
  await p.route('**', (r) => r.abort())

  const results: { path: string; ratio: number; total: number; uncaptured: number; missing: string[] }[] = []
  for (const path of paths) {
    const slug = path.replace(/^\//, '').replace(/\//g, '__')
    const file = `docs/reference/capture/${slug}/desktop/original.html`
    if (!existsSync(file)) { results.push({ path, ratio: -1, total: 0, uncaptured: 0, missing: ['NO BASELINE'] }); continue }
    await p.setContent(readFileSync(file, 'utf8'), { waitUntil: 'commit', timeout: 20000 }).catch(() => {})
    await p.waitForTimeout(30)
    const r = await p.evaluate(() => {
      const mainEl = (document.querySelector('main') || document.body) as HTMLElement
      let total = 0, uncaptured = 0
      const missing: string[] = []
      for (const sec of Array.from(mainEl.children) as HTMLElement[]) {
        const stx = (sec.textContent || '').replace(/\s+/g, ' ')
        const cls = (sec.className?.toString() || '').toLowerCase()
        const isCloser = /Estate Planning With Us Means|DESIGNED FOR YOUR COMFORT|Schedule a Consultation Today/i.test(stx) || /(^|\s)(vls|cta|rvw|tst|testim|review)/.test(cls) || /What (Our|People)[^.]{0,30}Say/i.test(stx)
        const isBanner = sec.tagName === 'FORM' || /^(Form_)?Banner/.test(sec.id) || /(^|\s)(bnr|banner)/.test(cls)
        const isAwardsStaff = /(^|\s)(aws|awards|stf|staff)/.test(cls)
        if (isCloser || isBanner || isAwardsStaff) continue
        const walker = document.createTreeWalker(sec, NodeFilter.SHOW_TEXT)
        let n: Node | null
        while ((n = walker.nextNode())) {
          const t = (n.textContent || '').replace(/\s+/g, ' ').trim()
          if (t.length < 2) continue
          const el = n.parentElement as HTMLElement
          if (el.closest('script,style,nav,header,footer')) continue
          total += t.length
          // captured by the extractor / rendered by FamilyBPage?
          const inBlock = !!el.closest('p,li,h1,h2,h3,h4,ul,ol,article,blockquote,figcaption,address,[aria-expanded],.qst')
          const inEmStrong = /^(EM|STRONG)$/.test(el.tagName) && (el.textContent || '').replace(/\s+/g, ' ').trim().length >= 20 && !el.closest('p,li,h1,h2,h3,h4,a,article,blockquote,figcaption')
          if (inBlock || inEmStrong) continue
          uncaptured += t.length
          if (missing.length < 5) missing.push(t.slice(0, 48))
        }
      }
      return { total, uncaptured, missing }
    })
    const ratio = r.total ? (r.total - r.uncaptured) / r.total : 1
    results.push({ path, ratio, total: r.total, uncaptured: r.uncaptured, missing: r.missing })
  }
  await b.close()

  results.sort((a, b) => a.ratio - b.ratio)
  const noBase = results.filter((r) => r.ratio < 0)
  const below = results.filter((r) => r.ratio >= 0 && r.ratio < 0.99)
  const pass = results.filter((r) => r.ratio >= 0.99)
  const avg = results.filter((r) => r.ratio >= 0).reduce((s, r) => s + r.ratio, 0) / (results.length - noBase.length || 1)
  console.log(`family-B gate: ${results.length} pages | >=99%: ${pass.length} | <99%: ${below.length} | no-baseline: ${noBase.length}`)
  console.log(`mean body completeness: ${(avg * 100).toFixed(1)}%`)
  if (below.length) {
    console.log('\n--- pages < 99% (ratio | uncaptured/total | sample omitted text) ---')
    for (const r of below) console.log(`${(r.ratio * 100).toFixed(1)}%  ${r.path}  (${r.uncaptured}/${r.total})  :: ${r.missing.join(' | ')}`)
  }
  if (noBase.length) console.log('\nno baseline:', noBase.map((r) => r.path).join(', '))
}
main().catch((e) => { console.error(e); process.exit(1) })
