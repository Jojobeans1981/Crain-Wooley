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
// `origClipBoxes`: when the original band element is a COLUMN that spans far past its
// visible content (e.g. the geo sidebar `.sd-zn` is as tall as the whole article —
// boxes in the top ~1858px, empty below to ~5934px), clip the orig crop to the
// bottom of its real boxes so the empty column isn't diffed against the clone's
// box-stack-height crop. Selector matches the box children whose union defines the
// content region.
type BandDef = { key: string; tier: 'structure' | 'text'; clone: string; orig: string; origClipBoxes?: string }
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
    { key: 'testimonials', tier: 'structure', clone: '.cw-reviews', orig: '#ReviewsS8, .rvw' },
    { key: 'schedule', tier: 'structure', clone: '.cw-locations', orig: '#CTAsS1' },
    { key: 'footer', tier: 'structure', clone: 'footer.cw-site-footer, footer', orig: 'footer, [id^="Footer"]' },
  ],
  '/allen/': [
    { key: 'banner', tier: 'structure', clone: '.legacy-banner', orig: '#BannerV1, [id^="Banner"], .bnr' },
    { key: 'badge', tier: 'structure', clone: '.cw-badges-interior', orig: '#AwardsS1, .aws' },
    { key: 'sidebar', tier: 'structure', clone: '.cw-fb-sidebar', orig: '.sd-zn', origClipBoxes: '.sd-nv, .sd-cta' },
    { key: 'intro+body', tier: 'text', clone: '.cw-fb-content', orig: '#TwoColumnLayout .cnt-zn, #TwoColumnLayout' },
    { key: 'testimonials', tier: 'structure', clone: '.cw-reviews', orig: '#ReviewsS8, .rvw' },
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
// Owner-sign-off exception registry (keyed `<page>|<vp>|<band>`). A band whose
// geometry verifies identical but whose residual is pure sub-pixel AA is recorded
// here as PENDING (awaiting owner crop review) or SIGNED. It NEVER bends the <1%
// gate — it relabels a FAIL as EXCEPTION-PENDING/SIGNED so the scorecard tracks it
// honestly. docs/reference/exceptions.md carries the human-readable evidence.
type Exc = { status: 'PENDING' | 'SIGNED' | 'REJECTED'; residualPct?: number; reason?: string; evidence?: string }
const exceptions: Record<string, Exc> = existsSync('scripts/visual-diff/exceptions.json') ? JSON.parse(readFileSync('scripts/visual-diff/exceptions.json', 'utf8')) : {}

// Prepare a page for band-element screenshots: navigate, scroll-reveal, force
// reveal-gated content + lazy images, settle images so layout is final.
async function prep(pg: Page, url: string): Promise<void> {
  await pg.goto(url, { waitUntil: 'load', timeout: 60_000 })
  await pg.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 70)) } window.scrollTo(0, 0) })
  await pg.addStyleTag({ content: '[data-onvisible],.anm,[class*="anm"],.reveal,.reveal-stagger,.reveal-stagger>*{opacity:1!important;transform:none!important;visibility:visible!important;animation:none!important;transition:none!important}' }).catch(() => {})
  // De-stick sticky/fixed site headers so they don't overlap a band's top when
  // locator.screenshot() scrolls it into view (contaminates the clone crops, which
  // have a sticky header; the original's isn't) -> false reds on every band.
  await pg.addStyleTag({ content: '.cw-site-header,[id^="Header"],.hdr,header.hdr,[class*="hdr-sticky"],[class*="-sticky"]{position:static!important;top:auto!important}' }).catch(() => {})
  // Hide the Scorpion "Connect" 3rd-party webchat widget (.connect-page green panel
  // + cta-tile launcher). It mounts NONDETERMINISTICALLY on the live original only
  // (absent from the clone) and the force-reveal rule above un-hides its panel,
  // floating it over banner/testimonials/etc and inflating EVERY overlapped band's
  // diff (instrument bug class #6 — overlay contamination). No clone collision
  // (grep: zero refs). Hiding on both sides normalizes to the same content.
  await pg.addStyleTag({ content: '#scorpion_connect,.connect-page,[class*="cta-tile"],[class*="ctas-tiles"]{display:none!important}' }).catch(() => {})
  await pg.evaluate(() => { document.querySelectorAll('img[data-src], source[data-src]').forEach((e) => { const s = e.getAttribute('data-src'); if (s) { e.setAttribute('src', s); if (e.tagName === 'SOURCE') e.setAttribute('srcset', s) } }) })
  await pg.evaluate(() => Promise.all(Array.from(document.images).map((i) => i.complete ? 0 : new Promise<void>((r) => { i.onload = () => r(); i.onerror = () => r(); setTimeout(() => r(), 4000) }))))
  await pg.waitForTimeout(800)
}
// Screenshot a single band ELEMENT directly (Playwright clips its bbox + scrolls
// it into view) — avoids fullPage relayout coordinate skew. null if not found.
async function bandShot(pg: Page, sel: string, clipBoxes?: string): Promise<PNG | null> {
  const loc = pg.locator(sel).first()
  if (!(await loc.count())) return null
  const box = await loc.boundingBox().catch(() => null)
  if (!box || box.height < 8) return null
  // Scroll the band into view + settle ITS OWN images before the screenshot. The
  // page-level settle in prep() runs at scroll-top, so a band's lazy (loading=lazy
  // / Next <Image>) photos haven't triggered their IntersectionObserver yet and
  // screenshot EMPTY (e.g. the testimonials couple photo requested a heavy w=3840
  // variant). Settling per-band after scroll-in makes the crop deterministic.
  await loc.scrollIntoViewIfNeeded().catch(() => {})
  await loc.evaluate((el) => Promise.all(Array.from(el.querySelectorAll('img')).map((i) => i.complete && i.naturalWidth > 0 ? 0 : new Promise<void>((r) => { i.loading = 'eager'; i.onload = () => r(); i.onerror = () => r(); setTimeout(() => r(), 5000) })))).catch(() => {})
  await pg.waitForTimeout(150)
  // Poll the band HEIGHT until it stabilizes (2 consecutive equal reads) before the
  // screenshot. Late-settling bands — notably the footer, whose legal strip + cover
  // background-image lay out after first paint — otherwise capture SHORT and
  // nondeterministically (the original #FooterZone read 854px on allen/justin vs its
  // true 960). Background-images aren't <img>, so the per-band img-settle above can't
  // catch them; height-stability does.
  let lastH = -1
  for (let i = 0; i < 12; i++) {
    const bb = await loc.boundingBox().catch(() => null)
    const h = bb ? Math.round(bb.height) : -1
    if (h === lastH && h > 0) break
    lastH = h
    await pg.waitForTimeout(250)
  }
  const buf = await loc.screenshot({ timeout: 15_000 }).catch(() => null)
  if (!buf) return null
  const png = PNG.sync.read(buf as Buffer)
  // Clip a too-tall column crop to the bottom of its real boxes (e.g. sidebar.sd-zn).
  if (clipBoxes) {
    const contentH = await loc.evaluate((el, csel) => {
      const top = el.getBoundingClientRect().top
      let max = 0
      for (const b of Array.from(el.querySelectorAll(csel as string))) {
        const r = (b as Element).getBoundingClientRect()
        if (r.height > 8) max = Math.max(max, r.bottom - top)
      }
      return Math.round(max)
    }, clipBoxes).catch(() => 0)
    if (contentH > 8 && contentH < png.height) {
      const clipped = new PNG({ width: png.width, height: contentH })
      for (let y = 0; y < contentH; y++) for (let x = 0; x < png.width; x++) { const i = (png.width * y + x) << 2; clipped.data[i] = png.data[i]; clipped.data[i + 1] = png.data[i + 1]; clipped.data[i + 2] = png.data[i + 2]; clipped.data[i + 3] = png.data[i + 3] }
      return clipped
    }
  }
  return png
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
    for (const vp of VPS) {
      const pgC = await b.newPage({ viewport: { width: vp.w, height: vp.h }, reducedMotion: 'reduce' })
      const pgO = await b.newPage({ viewport: { width: vp.w, height: vp.h }, reducedMotion: 'reduce' })
      await prep(pgC, CLONE + path)
      await prep(pgO, ORIG + path)
      for (const bd of bands) {
        const cCrop = await bandShot(pgC, bd.clone), oCrop = await bandShot(pgO, bd.orig, bd.origClipBoxes)
        if (!cCrop || !oCrop) { scorecard.push({ page: path, vp: vp.n, band: bd.key, tier: bd.tier, pct: null, pass: false, note: !cCrop ? 'clone band not found' : 'orig band not found' }); continue }
        const W = Math.max(cCrop.width, oCrop.width), H = Math.max(cCrop.height, oCrop.height)
        const a = pad(oCrop, W, H), c = pad(cCrop, W, H)
        // Masks are in the band's local coords; values <=1 are treated as
        // FRACTIONS of the band box (viewport-agnostic).
        const bm = ((masks[`${slug}:${bd.key}`] || masks[`*:${bd.key}`] || []) as Rect[]).map((r) => ({
          x: Math.round(r.x <= 1 ? r.x * W : r.x), y: Math.round(r.y <= 1 ? r.y * H : r.y),
          w: Math.round(r.w <= 1 ? r.w * W : r.w), h: Math.round(r.h <= 1 ? r.h * H : r.h),
        }))
        paint(a, bm); paint(c, bm)
        const diff = new PNG({ width: W, height: H })
        const changed = pixelmatch(a.data, c.data, diff.data, W, H, { threshold: 0.1 })
        const pct = changed / (W * H)
        const maskArea = bm.reduce((s, r) => s + Math.max(0, r.w) * Math.max(0, r.h), 0) / (W * H)
        const tol = bd.tier === 'text' ? TEXT_TOL : STRUCT_TOL
        writeFileSync(`pixel-baselines/band/diff/${slug}-${vp.n}-${bd.key}.png`, PNG.sync.write(diff))
        const exc = exceptions[`${path}|${vp.n}|${bd.key}`]
        // A REJECTED exception is owner-rejected — it reverts to FAIL, never an exception.
        const classification = pct < tol ? 'PASS' : (exc && exc.status !== 'REJECTED') ? `EXCEPTION-${exc.status}` : 'FAIL'
        scorecard.push({ page: path, vp: vp.n, band: bd.key, tier: bd.tier, pct, pass: pct < tol, classification, tol, maskAreaPct: maskArea, cloneH: cCrop.height, origH: oCrop.height })
      }
      await pgC.close(); await pgO.close()
    }
  }
  await b.close()
  writeFileSync('docs/reference/band-scorecard.json', JSON.stringify(scorecard, null, 2))
  // Console scorecard
  let lastKey = ''
  for (const r of scorecard as { page: string; vp: string; band: string; tier: string; pct: number | null; pass: boolean; classification?: string; tol?: number; maskAreaPct?: number; note?: string }[]) {
    const key = `${r.page} @ ${r.vp}`
    if (key !== lastKey) { console.log(`\n${key}`); lastKey = key }
    const pctS = r.pct == null ? r.note || '—' : `${(r.pct * 100).toFixed(2)}%`
    const tierS = r.tier === 'text' ? '≤5%' : '<1%'
    const maskS = r.maskAreaPct ? ` (mask ${(r.maskAreaPct * 100).toFixed(1)}%)` : ''
    const label = r.classification === 'EXCEPTION-PENDING' ? 'EXC-PEND' : r.classification === 'EXCEPTION-SIGNED' ? 'EXC-SIGN' : r.pass ? 'PASS' : 'FAIL'
    console.log(`  ${label.padEnd(8)} ${r.band.padEnd(14)} [${tierS}] ${pctS}${maskS}`)
  }
  const struct = scorecard.filter((r) => r.tier === 'structure')
  const text = scorecard.filter((r) => r.tier === 'text')
  const sp = struct.filter((r) => r.pass).length, tp = text.filter((r) => r.pass).length
  const excP = scorecard.filter((r) => (r as { classification?: string }).classification === 'EXCEPTION-PENDING').length
  const excS = scorecard.filter((r) => (r as { classification?: string }).classification === 'EXCEPTION-SIGNED').length
  console.log(`\nstructure bands: ${sp}/${struct.length} <1% | text bands: ${tp}/${text.length} ≤5% | exceptions: ${excS} signed, ${excP} pending`)
}
main().catch((e) => { console.error(e); process.exit(1) })
