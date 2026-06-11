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

const norm = (s: string) => (s || '').replace(/\s+/g, ' ').trim()

// family key -> legacy-pages.json type set
const FAMILIES: Record<string, Set<string>> = {
  B: new Set(['service', 'resource', 'other']),
  D: new Set(['location']),
  C: new Set(['staff']), // individual /staff-profiles/<name> bios (index excluded below)
}

async function main() {
  const lp = JSON.parse(readFileSync('lib/legacy/legacy-pages.json', 'utf8')) as Record<string, { type: string; title?: string; description?: string }>
  const famKey = (process.argv[2] || 'B').toUpperCase()
  const fam = FAMILIES[famKey] || FAMILIES.B
  const onlyPath = process.argv[3] // optional single-path proof
  const ORIGIN = 'https://www.estateplanningdfw.law'
  const paths = (onlyPath ? [onlyPath.replace(/\/+$/, '')] : Object.keys(lp).filter((k) => fam.has(lp[k].type) && k !== '/staff-profiles')).sort()
  console.log(`gating family ${famKey}: ${paths.length} page(s)`)

  const b = await chromium.launch()
  const p = await b.newPage()
  await p.route('**', (r) => r.abort())

  type Meta = { titleOk: boolean; descOk: boolean; canonOk: boolean; origTitle: string; cloneTitle: string; origDesc: string; cloneDesc: string }
  const results: { path: string; ratio: number; total: number; uncaptured: number; missing: string[]; meta?: Meta }[] = []
  for (const path of paths) {
    const slug = path.replace(/^\//, '').replace(/\//g, '__')
    const file = `docs/reference/capture/${slug}/desktop/original.html`
    if (!existsSync(file)) { results.push({ path, ratio: -1, total: 0, uncaptured: 0, missing: ['NO BASELINE'] }); continue }
    await p.setContent(readFileSync(file, 'utf8'), { waitUntil: 'commit', timeout: 20000 }).catch(() => {})
    await p.waitForTimeout(30)
    const r = await p.evaluate(() => {
      const mainEl = (document.querySelector('main') || document.body) as HTMLElement
      // banner title is rendered in the gold banner, so text equal to it elsewhere
      // (e.g. a staff name repeated in the profile card) is NOT a body gap.
      let bannerTitle = ''
      for (const sec of Array.from(mainEl.children) as HTMLElement[]) { const c = (sec.className?.toString() || '').toLowerCase(); if (sec.tagName === 'FORM' || /^(Form_)?Banner/.test(sec.id) || /(^|\s)(bnr|banner)/.test(c)) { const h = sec.querySelector('.fnt_t-1, h1, h2, .h1, strong'); if (h) bannerTitle = (h.textContent || '').replace(/\s+/g, ' ').trim(); break } }
      let total = 0, uncaptured = 0
      const missing: string[] = []
      for (const sec of Array.from(mainEl.children) as HTMLElement[]) {
        const stx = (sec.textContent || '').replace(/\s+/g, ' ')
        const cls = (sec.className?.toString() || '').toLowerCase()
        const isCloser = /Estate Planning With Us Means|DESIGNED FOR YOUR COMFORT|Schedule a Consultation Today/i.test(stx) || /(^|\s)(vls|cta|rvw|tst|testim|review)/.test(cls) || /What (Our|People)[^.]{0,30}Say/i.test(stx)
        const isBanner = sec.tagName === 'FORM' || /^(Form_)?Banner/.test(sec.id) || /(^|\s)(bnr|banner)/.test(cls)
        const isAwardsStaff = /(^|\s)(aws|awards)/.test(cls) || (/(^|\s)(stf|staff)/.test(cls) && !/stf-pfl|profile/i.test(cls))
        if (isCloser || isBanner || isAwardsStaff) continue
        const isProfile = /stf-pfl|profile/i.test(cls) // staff bio: short role/office leaves count
        const walker = document.createTreeWalker(sec, NodeFilter.SHOW_TEXT)
        let n: Node | null
        while ((n = walker.nextNode())) {
          const t = (n.textContent || '').replace(/\s+/g, ' ').trim()
          if (t.length < 2) continue
          const el = n.parentElement as HTMLElement
          if (el.closest('script,style,nav,header,footer')) continue
          total += t.length
          // captured by the extractor / rendered by FamilyBPage?
          const inBlock = !!el.closest('p,li,h1,h2,h3,h4,ul,ol,article,blockquote,figcaption,address,[aria-expanded],.qst,[itemtype*="Question"]')
          const inEmStrong = /^(EM|STRONG)$/.test(el.tagName) && (el.textContent || '').replace(/\s+/g, ' ').trim().length >= 20 && !el.closest('p,li,h1,h2,h3,h4,a,article,blockquote,figcaption')
          const pd = el.closest('div')
          const inLeafDiv = !!pd && !pd.querySelector('div,p,ul,ol,li,h1,h2,h3,h4,article,blockquote,figcaption,address') && (pd.textContent || '').replace(/\s+/g, ' ').trim().length >= (isProfile ? 4 : 30)
          if (inBlock || inEmStrong || inLeafDiv || (bannerTitle && t === bannerTitle)) continue
          uncaptured += t.length
          if (missing.length < 5) missing.push(t.slice(0, 48))
        }
      }
      const head = { title: document.title, desc: (document.querySelector('meta[name=description]') as HTMLMetaElement | null)?.content || '', canon: (document.querySelector('link[rel=canonical]') as HTMLLinkElement | null)?.getAttribute('href') || '' }
      return { total, uncaptured, missing, head }
    })
    const ratio = r.total ? (r.total - r.uncaptured) / r.total : 1
    // Metadata parity: the clone emits legacy-pages.json title/description and a
    // canonical of ORIGIN+path; compare to the original <head> (SEO-critical for geo).
    const entry = lp[path] || lp[path + '/'] || {}
    // curly vs straight quotes / dashes are an encoding artifact, not a metadata
    // difference — normalize them so only real title/description diffs surface.
    const normMeta = (s: string) => norm(s).replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/[–—]/g, '-')
    const meta = {
      titleOk: normMeta(r.head.title) === normMeta(entry.title || ''),
      descOk: normMeta(r.head.desc) === normMeta(entry.description || ''),
      canonOk: norm(r.head.canon).replace(/\/+$/, '') === (ORIGIN + path).replace(/\/+$/, ''),
      origTitle: norm(r.head.title), cloneTitle: norm(entry.title || ''),
      origDesc: norm(r.head.desc), cloneDesc: norm(entry.description || ''),
    }
    results.push({ path, ratio, total: r.total, uncaptured: r.uncaptured, missing: r.missing, meta })
  }
  await b.close()

  results.sort((a, b) => a.ratio - b.ratio)
  const noBase = results.filter((r) => r.ratio < 0)
  const below = results.filter((r) => r.ratio >= 0 && r.ratio < 0.99)
  const pass = results.filter((r) => r.ratio >= 0.99)
  const avg = results.filter((r) => r.ratio >= 0).reduce((s, r) => s + r.ratio, 0) / (results.length - noBase.length || 1)
  console.log(`gate: ${results.length} pages | body >=99%: ${pass.length} | <99%: ${below.length} | no-baseline: ${noBase.length}`)
  console.log(`mean body completeness: ${(avg * 100).toFixed(1)}%`)
  // metadata parity
  const withMeta = results.filter((r) => r.meta)
  const metaTitle = withMeta.filter((r) => r.meta!.titleOk).length
  const metaDesc = withMeta.filter((r) => r.meta!.descOk).length
  const metaCanon = withMeta.filter((r) => r.meta!.canonOk).length
  console.log(`metadata parity: title ${metaTitle}/${withMeta.length} | description ${metaDesc}/${withMeta.length} | canonical ${metaCanon}/${withMeta.length}`)
  const metaFail = withMeta.filter((r) => !r.meta!.titleOk || !r.meta!.descOk || !r.meta!.canonOk)
  if (metaFail.length) {
    console.log('\n--- metadata mismatches ---')
    for (const r of metaFail) {
      const m = r.meta!
      if (!m.titleOk) console.log(`  TITLE ${r.path}\n    orig:  ${m.origTitle}\n    clone: ${m.cloneTitle}`)
      if (!m.descOk) console.log(`  DESC  ${r.path}\n    orig:  ${m.origDesc.slice(0, 90)}\n    clone: ${m.cloneDesc.slice(0, 90)}`)
      if (!m.canonOk) console.log(`  CANON ${r.path} (clone canonical = origin+path; verify trailing-slash handling)`)
    }
  }
  if (below.length) {
    console.log('\n--- pages < 99% body (ratio | uncaptured/total | sample omitted text) ---')
    for (const r of below) console.log(`${(r.ratio * 100).toFixed(1)}%  ${r.path}  (${r.uncaptured}/${r.total})  :: ${r.missing.join(' | ')}`)
  }
  if (noBase.length) console.log('\nno baseline:', noBase.map((r) => r.path).join(', '))
}
main().catch((e) => { console.error(e); process.exit(1) })
