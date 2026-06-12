/*
 * Banner exception-review crop emitter — 1:1, UNSCALED, EQUAL-DIMENSION panels.
 *
 * Owner rejection #3/#4: the prior side-by-side emitter left the two panels at their
 * native (differing) heights, so a viewer scaling the composite distorted the apparent
 * heading size and invalidated the crops as signing evidence. This emitter pads BOTH
 * panels to the SAME (maxW x maxH) before compositing, so original and clone are the
 * exact same pixel dimensions, placed at native 1:1 with a 2px divider — no scaling.
 * Also emits each panel individually at 1:1 for overlay comparison.
 *
 * Output: ~/Desktop/banner-review-flat/<page>-<vp>.png (sidebyside)
 *         ~/Desktop/banner-review-flat/<page>-<vp>-{orig,clone}.png
 *
 * Usage: CLONE_ORIGIN=http://localhost:3210 npx tsx scripts/visual-diff/banner-review-crops.ts
 */
import { chromium, type Page } from 'playwright'
import { writeFileSync, mkdirSync } from 'node:fs'
import { homedir } from 'node:os'
import { PNG } from 'pngjs'

const ORIG = 'https://www.estateplanningdfw.law'
const CLONE = process.env.CLONE_ORIGIN || 'http://localhost:3210'
const OUT = `${homedir()}/Desktop/banner-review-flat`
const PAGES = [
  { slug: 'flatrate', path: '/about-us/pricing/flat-rate-services/', orig: '#Form_BannerV1, [id^="Banner"], .bnr' },
  { slug: 'justin', path: '/staff-profiles/justin-t-crain/', orig: '#Form_BannerV1, [id^="Banner"], .bnr' },
  { slug: 'allen', path: '/allen/', orig: '#BannerV1, [id^="Banner"], .bnr' },
]
const VPS = [{ n: 'desktop', w: 1440, h: 900 }, { n: 'tablet', w: 768, h: 1024 }, { n: 'mobile', w: 390, h: 844 }]

async function prep(pg: Page, url: string): Promise<void> {
  await pg.goto(url, { waitUntil: 'load', timeout: 60_000 })
  await pg.evaluate(async () => { for (let y = 0; y < 1500; y += 400) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 50)) } window.scrollTo(0, 0) })
  await pg.addStyleTag({ content: '[data-onvisible],.anm,[class*="anm"],.reveal{opacity:1!important;transform:none!important;visibility:visible!important}' }).catch(() => {})
  await pg.addStyleTag({ content: '.cw-site-header,[id^="Header"],.hdr,[class*="-sticky"]{position:static!important;top:auto!important}' }).catch(() => {})
  await pg.addStyleTag({ content: '#scorpion_connect,.connect-page{display:none!important}' }).catch(() => {})
  await pg.waitForTimeout(700)
}
async function shot(pg: Page, sel: string): Promise<PNG | null> {
  const l = pg.locator(sel).first()
  if (!(await l.count())) return null
  await l.scrollIntoViewIfNeeded().catch(() => {})
  await pg.waitForTimeout(200)
  const buf = await l.screenshot({ timeout: 15_000 }).catch(() => null)
  return buf ? PNG.sync.read(buf as Buffer) : null
}
// Pad src into a (w x h) canvas, native pixels (no resize), top-left, light-grey fill.
function canvas(src: PNG, w: number, h: number): PNG {
  const o = new PNG({ width: w, height: h }); o.data.fill(238)
  for (let y = 0; y < Math.min(h, src.height); y++) for (let x = 0; x < Math.min(w, src.width); x++) { const si = (src.width * y + x) << 2, di = (w * y + x) << 2; o.data[di] = src.data[si]; o.data[di + 1] = src.data[si + 1]; o.data[di + 2] = src.data[si + 2]; o.data[di + 3] = 255 }
  return o
}

async function main() {
  mkdirSync(OUT, { recursive: true })
  const b = await chromium.launch()
  for (const p of PAGES) {
    for (const vp of VPS) {
      const pgO = await b.newPage({ viewport: { width: vp.w, height: vp.h } }); await prep(pgO, ORIG + p.path)
      const pgC = await b.newPage({ viewport: { width: vp.w, height: vp.h } }); await prep(pgC, CLONE + p.path)
      const o = await shot(pgO, p.orig), c = await shot(pgC, '.legacy-banner')
      await pgO.close(); await pgC.close()
      if (!o || !c) { console.log(`${p.slug}-${vp.n}: MISSING ${!o ? 'orig' : 'clone'}`); continue }
      // EQUAL dimensions: both panels -> (maxW x maxH), native pixels, no scaling.
      const W = Math.max(o.width, c.width), H = Math.max(o.height, c.height)
      const op = canvas(o, W, H), cp = canvas(c, W, H)
      const gap = 2, CW = W * 2 + gap
      const comp = new PNG({ width: CW, height: H }); comp.data.fill(0)
      const blit = (s: PNG, ox: number) => { for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const si = (W * y + x) << 2, di = (CW * y + (x + ox)) << 2; comp.data[di] = s.data[si]; comp.data[di + 1] = s.data[si + 1]; comp.data[di + 2] = s.data[si + 2]; comp.data[di + 3] = 255 } }
      blit(op, 0); blit(cp, W + gap)
      writeFileSync(`${OUT}/${p.slug}-${vp.n}.png`, PNG.sync.write(comp))
      writeFileSync(`${OUT}/${p.slug}-${vp.n}-orig.png`, PNG.sync.write(op))
      writeFileSync(`${OUT}/${p.slug}-${vp.n}-clone.png`, PNG.sync.write(cp))
      console.log(`${p.slug}-${vp.n}: panels ${W}x${H} (orig ${o.width}x${o.height}, clone ${c.width}x${c.height}) -> ${OUT}/${p.slug}-${vp.n}.png`)
    }
  }
  await b.close()
}
main().catch((e) => { console.error(e); process.exit(1) })
