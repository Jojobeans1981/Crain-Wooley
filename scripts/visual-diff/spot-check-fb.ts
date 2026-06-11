/*
 * Post-deploy spot-check: masked pixel diff of the LIVE original vs the DEPLOYED
 * clone for a few family-B pages — confirms banner/intro/body layout and that the
 * shared closer bands re-inserted at the right positions. Courteous: one original
 * fetch per page. Reuses masks.json global masks; closer bands carry shared
 * components that already pass on home, so no per-page masks are needed.
 *
 * Usage: CLONE_ORIGIN=https://crain-wooley-intake.vercel.app npx tsx scripts/visual-diff/spot-check-fb.ts
 */
import { chromium } from 'playwright'
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs'
import { PNG } from 'pngjs'
import pixelmatch from 'pixelmatch'

const ORIG = 'https://www.estateplanningdfw.law'
const CLONE = process.env.CLONE_ORIGIN || 'https://crain-wooley-intake.vercel.app'
const PATHS = process.argv.slice(2).length ? process.argv.slice(2) : ['/estate-planning/asset-protection/', '/estate-planning/supplemental-needs-trust/', '/about-us/pricing/flat-rate-services/']
const VP = { width: 1440, height: 900 }

type Rect = { x: number; y: number; w: number; h: number; viewports?: string[] }
const masks: { global?: Rect[] } = JSON.parse(readFileSync('scripts/visual-diff/masks.json', 'utf8'))
const globalMasks = (masks.global || []).filter((r) => !r.viewports || r.viewports.includes('desktop'))

function applyMasks(png: PNG, rects: Rect[]) {
  for (const r of rects) for (let y = r.y; y < r.y + r.h && y < png.height; y++) for (let x = r.x; x < r.x + r.w && x < png.width; x++) {
    if (x < 0 || y < 0) continue
    const i = (png.width * y + x) << 2
    png.data[i] = png.data[i + 1] = png.data[i + 2] = 0; png.data[i + 3] = 255
  }
}
function fit(src: PNG, w: number, h: number): PNG {
  const out = new PNG({ width: w, height: h }); out.data.fill(255)
  for (let y = 0; y < Math.min(h, src.height); y++) for (let x = 0; x < Math.min(w, src.width); x++) {
    const si = (src.width * y + x) << 2, di = (w * y + x) << 2
    out.data[di] = src.data[si]; out.data[di + 1] = src.data[si + 1]; out.data[di + 2] = src.data[si + 2]; out.data[di + 3] = src.data[si + 3]
  }
  return out
}
async function shot(page: import('playwright').Page, url: string): Promise<PNG> {
  await page.goto(url, { waitUntil: 'load', timeout: 60_000 })
  await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 80)) } window.scrollTo(0, 0) })
  await page.waitForTimeout(900)
  return PNG.sync.read(await page.screenshot({ fullPage: true }) as Buffer)
}

async function main() {
  mkdirSync('diff-report/spot-fb', { recursive: true })
  const b = await chromium.launch()
  const page = await b.newPage({ viewport: VP })
  for (const path of PATHS) {
    const slug = path.replace(/^\/+|\/+$/g, '').replace(/\//g, '__')
    let orig: PNG, clone: PNG
    try { orig = await shot(page, ORIG + path) } catch (e) { console.log(`${path}: ORIGINAL fetch failed (${(e as Error).message.slice(0, 40)})`); continue }
    try { clone = await shot(page, CLONE + path) } catch (e) { console.log(`${path}: CLONE fetch failed (${(e as Error).message.slice(0, 40)})`); continue }
    const w = Math.min(orig.width, clone.width), h = Math.min(orig.height, clone.height)
    const a = fit(orig, w, h), c = fit(clone, w, h)
    applyMasks(a, globalMasks); applyMasks(c, globalMasks)
    const diff = new PNG({ width: w, height: h })
    const changed = pixelmatch(a.data, c.data, diff.data, w, h, { threshold: 0.1 })
    const pct = (changed / (w * h)) * 100
    // Top region = banner + two-column intro + body start (above the closer bands):
    // this is where a faithful template must align. Lower band carries the
    // intentionally-replaced shared closers, so full-page diff is expected to be high.
    const topH = Math.min(1600, h)
    const at = fit(a, w, topH), ct = fit(c, w, topH)
    const topDiff = new PNG({ width: w, height: topH })
    const topChanged = pixelmatch(at.data, ct.data, topDiff.data, w, topH, { threshold: 0.1 })
    const topPct = (topChanged / (w * topH)) * 100
    writeFileSync(`diff-report/spot-fb/${slug}.diff.png`, PNG.sync.write(diff))
    writeFileSync(`diff-report/spot-fb/${slug}.clone.png`, PNG.sync.write(fit(clone, w, Math.min(1800, clone.height))))
    writeFileSync(`diff-report/spot-fb/${slug}.original.png`, PNG.sync.write(fit(orig, w, Math.min(1800, orig.height))))
    console.log(`${path}\n  TOP(banner+intro+body) diff ${topPct.toFixed(2)}%  |  full-page diff ${pct.toFixed(2)}%  (orig ${orig.height}px / clone ${clone.height}px)`)
  }
  await b.close()
}
main().catch((e) => { console.error(e); process.exit(1) })
