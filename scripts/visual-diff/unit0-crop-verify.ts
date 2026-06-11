/*
 * UNIT 0 — cross-side band-crop verification.
 *
 * For the two stubborn high bands (testimonials, banner), emit the ACTUAL cropped
 * band images from BOTH sides at desktop, plus a side-by-side composite and an
 * overlay-diff. Verify the crops cover the same visual extent (same top/bottom
 * content edges). A structurally-correct rebuilt band should NOT sit at 41% — if
 * crops misalign, the harness band-boundary extraction is the bug, not the band.
 *
 * Uses the SAME prep()/bandShot() capture path as band-gate.ts so what we see here
 * is exactly what the scorecard measured.
 *
 * Usage: CLONE_ORIGIN=http://localhost:3210 npx tsx scripts/visual-diff/unit0-crop-verify.ts
 */
import { chromium, type Page } from 'playwright'
import { writeFileSync, mkdirSync } from 'node:fs'
import { PNG } from 'pngjs'
import pixelmatch from 'pixelmatch'

const ORIG = 'https://www.estateplanningdfw.law'
const CLONE = process.env.CLONE_ORIGIN || 'http://localhost:3210'

// Same selectors band-gate.ts uses for the flat-rate-services page.
const P = '/about-us/pricing/flat-rate-services/'
const TARGETS = [
  { page: P, band: 'banner', clone: '.legacy-banner', orig: '#Form_BannerV1, [id^="Banner"], .bnr' },
  { page: P, band: 'intro+body', clone: '.cw-fb-main', orig: '#FAQsS2' },
  { page: P, band: 'values', clone: '.cw-values', orig: '#ValuesV2' },
  { page: P, band: 'faq', clone: '.cw-faqband', orig: '#FAQsS3' },
  { page: P, band: 'cards', clone: '.cw-cardsec', orig: '#CTAsS7' },
  { page: P, band: 'testimonials', clone: '.cw-reviews', orig: '#ReviewsS8, .rvw' },
  { page: P, band: 'footer', clone: 'footer.cw-site-footer, footer', orig: 'footer, [id^="Footer"]' },
]
const VP = { width: 1440, height: 900 }

async function prep(pg: Page, url: string): Promise<void> {
  await pg.goto(url, { waitUntil: 'load', timeout: 60_000 })
  await pg.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 70)) } window.scrollTo(0, 0) })
  await pg.addStyleTag({ content: '[data-onvisible],.anm,[class*="anm"],.reveal,.reveal-stagger,.reveal-stagger>*{opacity:1!important;transform:none!important;visibility:visible!important;animation:none!important;transition:none!important}' }).catch(() => {})
  await pg.addStyleTag({ content: '.cw-site-header,[id^="Header"],.hdr,header.hdr,[class*="hdr-sticky"],[class*="-sticky"]{position:static!important;top:auto!important}' }).catch(() => {})
  await pg.addStyleTag({ content: '#scorpion_connect,.connect-page,[class*="cta-tile"],[class*="ctas-tiles"]{display:none!important}' }).catch(() => {})
  await pg.evaluate(() => { document.querySelectorAll('img[data-src], source[data-src]').forEach((e) => { const s = e.getAttribute('data-src'); if (s) { e.setAttribute('src', s); if (e.tagName === 'SOURCE') e.setAttribute('srcset', s) } }) })
  await pg.evaluate(() => Promise.all(Array.from(document.images).map((i) => i.complete ? 0 : new Promise<void>((r) => { i.onload = () => r(); i.onerror = () => r(); setTimeout(() => r(), 4000) }))))
  await pg.waitForTimeout(800)
}

async function bandShot(pg: Page, sel: string): Promise<{ png: PNG; box: { x: number; y: number; width: number; height: number } } | null> {
  const loc = pg.locator(sel).first()
  if (!(await loc.count())) return null
  const box = await loc.boundingBox().catch(() => null)
  if (!box || box.height < 8) return null
  await loc.scrollIntoViewIfNeeded().catch(() => {})
  await loc.evaluate((el) => Promise.all(Array.from(el.querySelectorAll('img')).map((i) => i.complete && i.naturalWidth > 0 ? 0 : new Promise<void>((r) => { i.loading = 'eager'; i.onload = () => r(); i.onerror = () => r(); setTimeout(() => r(), 5000) })))).catch(() => {})
  await pg.waitForTimeout(150)
  const buf = await loc.screenshot({ timeout: 15_000 }).catch(() => null)
  return buf ? { png: PNG.sync.read(buf as Buffer), box } : null
}

function pad(src: PNG, w: number, h: number): PNG { const o = new PNG({ width: w, height: h }); o.data.fill(255); for (let y = 0; y < Math.min(h, src.height); y++) for (let x = 0; x < Math.min(w, src.width); x++) { const si = (src.width * y + x) << 2, di = (w * y + x) << 2; o.data[di] = src.data[si]; o.data[di + 1] = src.data[si + 1]; o.data[di + 2] = src.data[si + 2]; o.data[di + 3] = src.data[si + 3] } return o }

// Side-by-side composite: original | gap | clone, with a 2px black gutter.
function sideBySide(a: PNG, c: PNG): PNG {
  const gap = 4
  const H = Math.max(a.height, c.height)
  const W = a.width + gap + c.width
  const o = new PNG({ width: W, height: H }); o.data.fill(255)
  const blit = (src: PNG, ox: number) => { for (let y = 0; y < src.height; y++) for (let x = 0; x < src.width; x++) { const si = (src.width * y + x) << 2, di = (W * y + (x + ox)) << 2; o.data[di] = src.data[si]; o.data[di + 1] = src.data[si + 1]; o.data[di + 2] = src.data[si + 2]; o.data[di + 3] = 255 } }
  blit(a, 0)
  for (let y = 0; y < H; y++) for (let g = 0; g < gap; g++) { const di = (W * y + (a.width + g)) << 2; o.data[di] = o.data[di + 1] = o.data[di + 2] = 0; o.data[di + 3] = 255 }
  blit(c, a.width + gap)
  return o
}

async function main() {
  const dir = 'pixel-baselines/band/unit0'
  mkdirSync(dir, { recursive: true })
  const b = await chromium.launch()
  for (const t of TARGETS) {
    const pgC = await b.newPage({ viewport: VP, reducedMotion: 'reduce' })
    const pgO = await b.newPage({ viewport: VP, reducedMotion: 'reduce' })
    await prep(pgC, CLONE + t.page)
    await prep(pgO, ORIG + t.page)
    const c = await bandShot(pgC, t.clone)
    const o = await bandShot(pgO, t.orig)
    console.log(`\n=== ${t.band} @ desktop ===`)
    if (!c) { console.log('  CLONE band not found:', t.clone) }
    if (!o) { console.log('  ORIG band not found:', t.orig) }
    if (c && o) {
      console.log(`  clone box: ${JSON.stringify(c.box)}  png ${c.png.width}x${c.png.height}`)
      console.log(`  orig  box: ${JSON.stringify(o.box)}  png ${o.png.width}x${o.png.height}`)
      console.log(`  height delta: ${o.png.height - c.png.height}px (orig - clone)`)
      writeFileSync(`${dir}/${t.band}-clone.png`, PNG.sync.write(c.png))
      writeFileSync(`${dir}/${t.band}-orig.png`, PNG.sync.write(o.png))
      writeFileSync(`${dir}/${t.band}-sidebyside.png`, PNG.sync.write(sideBySide(o.png, c.png)))
      // overlay diff at common size (top-aligned)
      const W = Math.max(c.png.width, o.png.width), H = Math.max(c.png.height, o.png.height)
      const ap = pad(o.png, W, H), cp = pad(c.png, W, H)
      const diff = new PNG({ width: W, height: H })
      const changed = pixelmatch(ap.data, cp.data, diff.data, W, H, { threshold: 0.1 })
      console.log(`  overlay diff: ${(changed / (W * H) * 100).toFixed(2)}% at ${W}x${H}`)
      writeFileSync(`${dir}/${t.band}-overlaydiff.png`, PNG.sync.write(diff))
    }
    await pgC.close(); await pgO.close()
  }
  await b.close()
  console.log(`\nWrote crops to ${dir}/`)
}
main().catch((e) => { console.error(e); process.exit(1) })
