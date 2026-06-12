/*
 * Banner sub-desktop (tablet + mobile) crops for owner exception review — the
 * companion to STEP 0's desktop set. Emits orig/clone/sidebyside/overlay per page
 * per viewport using the band-gate capture path, into ~/Desktop/banner-exception-review.
 *
 * Usage: CLONE_ORIGIN=http://localhost:3210 npx tsx scripts/visual-diff/banner-subdesktop-crops.ts
 */
import { chromium, type Page } from 'playwright'
import { writeFileSync, mkdirSync } from 'node:fs'
import { homedir } from 'node:os'
import { PNG } from 'pngjs'
import pixelmatch from 'pixelmatch'

const ORIG = 'https://www.estateplanningdfw.law'
const CLONE = process.env.CLONE_ORIGIN || 'http://localhost:3210'
const OUT = `${homedir()}/Desktop/banner-exception-review`
const PAGES = [
  { slug: 'flat-rate', path: '/about-us/pricing/flat-rate-services/', orig: '#Form_BannerV1, [id^="Banner"], .bnr' },
  { slug: 'justin', path: '/staff-profiles/justin-t-crain/', orig: '#Form_BannerV1, [id^="Banner"], .bnr' },
  { slug: 'allen', path: '/allen/', orig: '#BannerV1, [id^="Banner"], .bnr' },
]
const VPS = [{ n: 'tablet', w: 768, h: 1024 }, { n: 'mobile', w: 390, h: 844 }]

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
function pad(src: PNG, w: number, h: number): PNG { const o = new PNG({ width: w, height: h }); o.data.fill(255); for (let y = 0; y < Math.min(h, src.height); y++) for (let x = 0; x < Math.min(w, src.width); x++) { const si = (src.width * y + x) << 2, di = (w * y + x) << 2; o.data[di] = src.data[si]; o.data[di + 1] = src.data[si + 1]; o.data[di + 2] = src.data[si + 2]; o.data[di + 3] = src.data[si + 3] } return o }
function sideBySide(a: PNG, c: PNG): PNG {
  const gap = 4, H = Math.max(a.height, c.height), W = a.width + gap + c.width
  const o = new PNG({ width: W, height: H }); o.data.fill(255)
  const blit = (s: PNG, ox: number) => { for (let y = 0; y < s.height; y++) for (let x = 0; x < s.width; x++) { const si = (s.width * y + x) << 2, di = (W * y + (x + ox)) << 2; o.data[di] = s.data[si]; o.data[di + 1] = s.data[si + 1]; o.data[di + 2] = s.data[si + 2]; o.data[di + 3] = 255 } }
  blit(a, 0); for (let y = 0; y < H; y++) for (let g = 0; g < gap; g++) { const di = (W * y + (a.width + g)) << 2; o.data[di] = o.data[di + 1] = o.data[di + 2] = 0; o.data[di + 3] = 255 } blit(c, a.width + gap)
  return o
}

async function main() {
  const b = await chromium.launch()
  for (const p of PAGES) {
    for (const vp of VPS) {
      const dir = `${OUT}/${p.slug}/${vp.n}`
      mkdirSync(dir, { recursive: true })
      const pgO = await b.newPage({ viewport: { width: vp.w, height: vp.h } }); await prep(pgO, ORIG + p.path)
      const pgC = await b.newPage({ viewport: { width: vp.w, height: vp.h } }); await prep(pgC, CLONE + p.path)
      const o = await shot(pgO, p.orig), c = await shot(pgC, '.legacy-banner')
      await pgO.close(); await pgC.close()
      if (!o || !c) { console.log(`${p.slug} ${vp.n}: MISSING ${!o ? 'orig' : 'clone'}`); continue }
      writeFileSync(`${dir}/banner-original.png`, PNG.sync.write(o))
      writeFileSync(`${dir}/banner-clone.png`, PNG.sync.write(c))
      writeFileSync(`${dir}/banner-sidebyside.png`, PNG.sync.write(sideBySide(o, c)))
      const W = Math.max(o.width, c.width), H = Math.max(o.height, c.height)
      const ap = pad(o, W, H), cp = pad(c, W, H), d = new PNG({ width: W, height: H })
      const ch = pixelmatch(ap.data, cp.data, d.data, W, H, { threshold: 0.1 })
      writeFileSync(`${dir}/banner-diff-overlay.png`, PNG.sync.write(d))
      console.log(`${p.slug} ${vp.n}: ${(ch / (W * H) * 100).toFixed(2)}%  (clone ${c.height}h, orig ${o.height}h) -> ${dir}`)
    }
  }
  await b.close()
}
main().catch((e) => { console.error(e); process.exit(1) })
