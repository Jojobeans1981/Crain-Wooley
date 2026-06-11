/*
 * Per-band pixel gate (the owner-review scorecard + future client-QA format).
 *
 * Diffs each band region (boundaries from the source-order band model) between the
 * clone and the live original, classifies it by the TWO-TIER gate, and reports
 * per-band % + pass/fail + masked-area %, with the full-page number informational.
 *
 *   STRUCTURE/CHROME bands (banner, badge, sidebars, closers, location cards,
 *     collapsed FAQ bars, staff cards): <1% per band.
 *   TEXT-CONTENT bands (flowing prose/body): <=5% per band (aim <=3%).
 *   A band failing its tier is a failure; the tiers narrow tolerance, no 3rd bucket.
 *
 * Capture matches pixel-proof: reducedMotion + force-reveal + force-lazy on BOTH
 * sides. Per-band masks (e.g. the badge carousel viewport) come from
 * scripts/visual-diff/band-masks.json keyed `<slug>:<bandKey>` (rects are in the
 * band's own local coords). Screenshots stay out of git.
 *
 * Usage: CLONE_ORIGIN=http://localhost:3210 npx tsx scripts/visual-diff/band-gate.ts
 */
import { chromium, type Page } from 'playwright'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { PNG } from 'pngjs'
import pixelmatch from 'pixelmatch'

const ORIG = 'https://www.estateplanningdfw.law'
const CLONE = process.env.CLONE_ORIGIN || 'https://crain-wooley-intake.vercel.app'
const VPS = [{ n: 'desktop', w: 1440, h: 900 }, { n: 'tablet', w: 768, h: 1024 }, { n: 'mobile', w: 390, h: 844 }]
const STRUCT_TOL = 0.01, TEXT_TOL = 0.05

type Rect = { x: number; y: number; w: number; h: number }
type BandDef = { key: string; tier: 'structure' | 'text'; clone: string; orig: string }
// Per-page ordered band maps (clone selector <-> original selector). Selector is
// the first match. Order is top->bottom so the scorecard reads down the page.
const PAGES: Record<string, BandDef[]> = {
  '/about-us/pricing/flat-rate-services/': [
    { key: 'banner', tier: 'structure', clone: '.legacy-banner', orig: '#Form_BannerV1, [id^="Banner"], .bnr' },
    { key: 'badge', tier: 'structure', clone: '.cw-badges-interior', orig: '#AwardsS2, .aws' },
    { key: 'intro+body', tier: 'text', clone: '.cw-fb-main', orig: '#FAQsS2' },
    { key: 'values', tier: 'structure', clone: '.cw-values', orig: '#ValuesV2' },
    { key: 'faq', tier: 'structure', clone: '.cw-faqband', orig: '#FAQsS3' },
    { key: 'cards', tier: 'structure', clone: '.cw-cardsec', orig: '#CTAsS7' },
    { key: 'testimonials', tier: 'structure', clone: '.cw-reviews', orig: '#ImageGroupS1' },
    { key: 'schedule', tier: 'structure', clone: '.cw-locations', orig: '#CTAsS1' },
    { key: 'footer', tier: 'structure', clone: 'footer.cw-site-footer, footer', orig: 'footer, [id^="Footer"]' },
  ],
  '/allen/': [
    { key: 'banner', tier: 'structure', clone: '.legacy-banner', orig: '#BannerV1, [id^="Banner"], .bnr' },
    { key: 'badge', tier: 'structure', clone: '.cw-badges-interior', orig: '#AwardsS1, .aws' },
    { key: 'sidebar', tier: 'structure', clone: '.cw-fb-sidebar', orig: '.sd-zn' },
    { key: 'intro+body', tier: 'text', clone: '.cw-fb-content', orig: '#TwoColumnLayout .cnt-zn, #TwoColumnLayout' },
    { key: 'testimonials', tier: 'structure', clone: '.cw-reviews', orig: '#ImageGroupS1' },
    { key: 'values', tier: 'structure', clone: '.cw-values', orig: '#ValuesV2' },
    { key: 'schedule', tier: 'structure', clone: '.cw-locations', orig: '#CTAsS1' },
    { key: 'footer', tier: 'structure', clone: 'footer.cw-site-footer, footer', orig: 'footer, [id^="Footer"]' },
  ],
  '/staff-profiles/justin-t-crain/': [
    { key: 'banner', tier: 'structure', clone: '.legacy-banner', orig: '#Form_BannerV1, [id^="Banner"], .bnr' },
    { key: 'intro+body', tier: 'text', clone: '.cw-fb-content', orig: '#StaffSystemS1Profile, .stf-pfl' },
    { key: 'schedule', tier: 'structure', clone: '.cw-locations', orig: '#CTAsS1' },
    { key: 'footer', tier: 'structure', clone: 'footer.cw-site-footer, footer', orig: 'footer, [id^="Footer"]' },
  ],
}
const masks: Record<string, Rect[]> = existsSync('scripts/visual-diff/band-masks.json') ? JSON.parse(readFileSync('scripts/visual-diff/band-masks.json', 'utf8')) : {}

async function shot(pg: Page, url: string): Promise<{ buf: Buffer; rects: Record<string, Rect | null> }> {
  await pg.goto(url, { waitUntil: 'load', timeout: 60_000 })
  await pg.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 70)) } window.scrollTo(0, 0) })
  await pg.addStyleTag({ content: '[data-onvisible],.anm,[class*="anm"],.reveal,.reveal-stagger,.reveal-stagger>*{opacity:1!important;transform:none!important;visibility:visible!important;animation:none!important;transition:none!important}' }).catch(() => {})
  await pg.evaluate(() => { document.querySelectorAll('img[data-src], source[data-src]').forEach((e) => { const s = e.getAttribute('data-src'); if (s) { e.setAttribute('src', s); if (e.tagName === 'SOURCE') e.setAttribute('srcset', s) } }) })
  await pg.waitForTimeout(1400)
  const sels = (globalThis as { __sels?: string[] }).__sels || []
  const rects = await pg.evaluate((selList: string[]) => {
    const out: Record<string, { x: number; y: number; w: number; h: number } | null> = {}
    const sy = window.scrollY
    for (const sel of selList) { const e = document.querySelector(sel) as HTMLElement | null; const r = e ? e.getBoundingClientRect() : null; out[sel] = r ? { x: Math.round(r.x), y: Math.round(r.y + sy), w: Math.round(r.width), h: Math.round(r.height) } : null }
    return out
  }, sels)
  const buf = (await pg.screenshot({ fullPage: true })) as Buffer
  return { buf, rects }
}

// Crop a band region out of a full-page PNG (clamped to bounds).
function crop(src: PNG, r: Rect): PNG {
  const w = Math.max(1, Math.min(r.w, src.width - Math.max(0, r.x))), h = Math.max(1, Math.min(r.h, src.height - Math.max(0, r.y)))
  const o = new PNG({ width: w, height: h })
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const sx = r.x + x, syy = r.y + y; const di = (w * y + x) << 2; if (sx < 0 || syy < 0 || sx >= src.width || syy >= src.height) { o.data[di] = o.data[di + 1] = o.data[di + 2] = o.data[di + 3] = 255; continue } const si = (src.width * syy + sx) << 2; o.data[di] = src.data[si]; o.data[di + 1] = src.data[si + 1]; o.data[di + 2] = src.data[si + 2]; o.data[di + 3] = src.data[si + 3] }
  return o
}
// Place src top-left into a (w x h) white canvas.
function pad(src: PNG, w: number, h: number): PNG { const o = new PNG({ width: w, height: h }); o.data.fill(255); for (let y = 0; y < Math.min(h, src.height); y++) for (let x = 0; x < Math.min(w, src.width); x++) { const si = (src.width * y + x) << 2, di = (w * y + x) << 2; o.data[di] = src.data[si]; o.data[di + 1] = src.data[si + 1]; o.data[di + 2] = src.data[si + 2]; o.data[di + 3] = src.data[si + 3] } return o }
function paint(p: PNG, rs: Rect[]) { for (const r of rs) for (let y = r.y; y < r.y + r.h && y < p.height; y++) for (let x = r.x; x < r.x + r.w && x < p.width; x++) { if (x < 0 || y < 0) continue; const i = (p.width * y + x) << 2; p.data[i] = p.data[i + 1] = p.data[i + 2] = 0; p.data[i + 3] = 255 } }

async function main() {
  for (const d of ['original', 'clone', 'diff']) mkdirSync(`pixel-baselines/band/${d}`, { recursive: true })
  const b = await chromium.launch()
  const scorecard: Record<string, unknown>[] = []
  for (const [path, bands] of Object.entries(PAGES)) {
    const slug = path.replace(/^\/+|\/+$/g, '').replace(/\//g, '__') || 'home'
    ;(globalThis as { __sels?: string[] }).__sels = [...new Set(bands.flatMap((bd) => [bd.clone, bd.orig]))]
    for (const vp of VPS) {
      const pgC = await b.newPage({ viewport: { width: vp.w, height: vp.h }, reducedMotion: 'reduce' })
      const pgO = await b.newPage({ viewport: { width: vp.w, height: vp.h }, reducedMotion: 'reduce' })
      const C = await shot(pgC, CLONE + path)
      const O = await shot(pgO, ORIG + path)
      await pgC.close(); await pgO.close()
      const cloneImg = PNG.sync.read(C.buf), origImg = PNG.sync.read(O.buf)
      for (const bd of bands) {
        const cr = C.rects[bd.clone], or = O.rects[bd.orig]
        if (!cr || !or || cr.h < 8 || or.h < 8) { scorecard.push({ page: path, vp: vp.n, band: bd.key, tier: bd.tier, pct: null, pass: false, note: !cr ? 'clone band not found' : 'orig band not found' }); continue }
        const cCrop = crop(cloneImg, cr), oCrop = crop(origImg, or)
        const W = Math.max(cCrop.width, oCrop.width), H = Math.max(cCrop.height, oCrop.height)
        const a = pad(oCrop, W, H), c = pad(cCrop, W, H)
        const bm = (masks[`${slug}:${bd.key}`] || []) as Rect[]
        paint(a, bm); paint(c, bm)
        const diff = new PNG({ width: W, height: H })
        const changed = pixelmatch(a.data, c.data, diff.data, W, H, { threshold: 0.1 })
        const pct = changed / (W * H)
        const maskArea = bm.reduce((s, r) => s + Math.max(0, r.w) * Math.max(0, r.h), 0) / (W * H)
        const tol = bd.tier === 'text' ? TEXT_TOL : STRUCT_TOL
        writeFileSync(`pixel-baselines/band/diff/${slug}-${vp.n}-${bd.key}.png`, PNG.sync.write(diff))
        scorecard.push({ page: path, vp: vp.n, band: bd.key, tier: bd.tier, pct, pass: pct < tol, tol, maskAreaPct: maskArea, cloneH: cr.h, origH: or.h })
      }
    }
  }
  await b.close()
  writeFileSync('docs/reference/band-scorecard.json', JSON.stringify(scorecard, null, 2))
  // Console scorecard
  let lastKey = ''
  for (const r of scorecard as { page: string; vp: string; band: string; tier: string; pct: number | null; pass: boolean; tol?: number; maskAreaPct?: number; note?: string }[]) {
    const key = `${r.page} @ ${r.vp}`
    if (key !== lastKey) { console.log(`\n${key}`); lastKey = key }
    const pctS = r.pct == null ? r.note || '—' : `${(r.pct * 100).toFixed(2)}%`
    const tierS = r.tier === 'text' ? '≤5%' : '<1%'
    const maskS = r.maskAreaPct ? ` (mask ${(r.maskAreaPct * 100).toFixed(1)}%)` : ''
    console.log(`  ${r.pass ? 'PASS' : 'FAIL'} ${r.band.padEnd(14)} [${tierS}] ${pctS}${maskS}`)
  }
  const struct = scorecard.filter((r) => r.tier === 'structure')
  const text = scorecard.filter((r) => r.tier === 'text')
  const sp = struct.filter((r) => r.pass).length, tp = text.filter((r) => r.pass).length
  console.log(`\nstructure bands: ${sp}/${struct.length} <1% | text bands: ${tp}/${text.length} ≤5%`)
}
main().catch((e) => { console.error(e); process.exit(1) })
