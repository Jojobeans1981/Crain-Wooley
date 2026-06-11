/*
 * Pixel gate for the proof trio (flat-rate-services, allen, justin) at 1440/768/390.
 * Captures the live original ONCE (courteous, 3s-spaced, cached on disk forever)
 * and the deployed clone, masked-diffs them, and reports % per page/viewport.
 * Screenshots stay OUT of git (pixel-baselines/* gitignored); commits only the
 * manifest + masks + diff report.
 *
 * Usage: CLONE_ORIGIN=https://crain-wooley-intake.vercel.app npx tsx scripts/visual-diff/pixel-proof.ts
 */
import { chromium, type Page } from 'playwright'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { PNG } from 'pngjs'
import pixelmatch from 'pixelmatch'

const ORIG = 'https://www.estateplanningdfw.law'
const CLONE = process.env.CLONE_ORIGIN || 'https://crain-wooley-intake.vercel.app'
const PAGES = process.argv.slice(2).length ? process.argv.slice(2) : ['/about-us/pricing/flat-rate-services/', '/allen/', '/staff-profiles/justin-t-crain/']
const VPS = [{ n: 'desktop', w: 1440, h: 900 }, { n: 'tablet', w: 768, h: 1024 }, { n: 'mobile', w: 390, h: 844 }]
const TOL = 0.01
type Rect = { x: number; y: number; w: number; h: number }
const masks: Record<string, Rect[]> = existsSync('scripts/visual-diff/proof-masks.json') ? JSON.parse(readFileSync('scripts/visual-diff/proof-masks.json', 'utf8')) : {}

function fit(src: PNG, w: number, h: number): PNG { const o = new PNG({ width: w, height: h }); o.data.fill(255); for (let y = 0; y < Math.min(h, src.height); y++) for (let x = 0; x < Math.min(w, src.width); x++) { const si = (src.width * y + x) << 2, di = (w * y + x) << 2; o.data[di] = src.data[si]; o.data[di + 1] = src.data[si + 1]; o.data[di + 2] = src.data[si + 2]; o.data[di + 3] = src.data[si + 3] } return o }
function paint(p: PNG, rs: Rect[]) { for (const r of rs) for (let y = r.y; y < r.y + r.h && y < p.height; y++) for (let x = r.x; x < r.x + r.w && x < p.width; x++) { if (x < 0 || y < 0) continue; const i = (p.width * y + x) << 2; p.data[i] = p.data[i + 1] = p.data[i + 2] = 0; p.data[i + 3] = 255 } }
async function shot(pg: Page, url: string): Promise<Buffer> {
  await pg.goto(url, { waitUntil: 'load', timeout: 60_000 })
  await pg.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 70)) } window.scrollTo(0, 0) })
  // Force-reveal scroll-gated content on BOTH sides. The original hides bands
  // behind `data-onvisible="anm"` IntersectionObserver reveals (opacity:0 until
  // intersected) and headless capture doesn't fire them reliably, so whole bands
  // screenshot EMPTY (text is in the DOM but invisible). The clone uses .reveal/
  // .reveal-stagger. Pin both visible so the capture is deterministic + complete.
  await pg.addStyleTag({ content: '[data-onvisible],.anm,[class*="anm"],.reveal,.reveal-stagger,.reveal-stagger>*{opacity:1!important;transform:none!important;visibility:visible!important;animation:none!important;transition:none!important}' }).catch(() => {})
  // Force lazy backgrounds/images to resolve (data-src -> src). The dark bands'
  // navy watermark is a lazy <img>/<source>; without this it loads inconsistently
  // band-to-band and the gold fallback shows through, making the baseline itself
  // non-deterministic. Pinning data-src loads the intended (navy) layer everywhere.
  await pg.evaluate(() => { document.querySelectorAll('img[data-src], source[data-src]').forEach((e) => { const s = e.getAttribute('data-src'); if (s) { e.setAttribute('src', s); if (e.tagName === 'SOURCE') e.setAttribute('srcset', s) } }) })
  await pg.waitForTimeout(1400)
  return (await pg.screenshot({ fullPage: true })) as Buffer
}

async function main() {
  for (const d of ['original', 'clone', 'diff']) mkdirSync(`pixel-baselines/${d}`, { recursive: true })
  const b = await chromium.launch()
  const results: { page: string; vp: string; pct: number; pass: boolean; w: number; h: number; masks: number }[] = []
  const manifest: Record<string, unknown>[] = []
  for (const path of PAGES) {
    const slug = path.replace(/^\/+|\/+$/g, '').replace(/\//g, '__') || 'home'
    for (const vp of VPS) {
      // reducedMotion freezes scroll-reveal + carousels on BOTH sides (the clone's
      // .reveal/.reveal-stagger resolve to visible; the original's `anm` bands too),
      // so the capture is deterministic instead of racing intersection observers.
      const pg = await b.newPage({ viewport: { width: vp.w, height: vp.h }, reducedMotion: 'reduce' })
      const origFile = `pixel-baselines/original/${slug}-${vp.n}.png`
      if (!existsSync(origFile)) { const buf = await shot(pg, ORIG + path); writeFileSync(origFile, buf); manifest.push({ src: 'original', url: ORIG + path, viewport: vp.n, bytes: buf.length }); await pg.waitForTimeout(3000) /* courtesy */ }
      const cloneBuf = await shot(pg, CLONE + path)
      writeFileSync(`pixel-baselines/clone/${slug}-${vp.n}.png`, cloneBuf)
      await pg.close()
      const orig = PNG.sync.read(readFileSync(origFile)); const clone = PNG.sync.read(cloneBuf)
      const w = Math.min(orig.width, clone.width), h = Math.min(orig.height, clone.height)
      const a = fit(orig, w, h), c = fit(clone, w, h)
      const rs = (masks[`${slug}-${vp.n}`] || masks[slug] || []) as Rect[]
      paint(a, rs); paint(c, rs)
      const diff = new PNG({ width: w, height: h })
      const changed = pixelmatch(a.data, c.data, diff.data, w, h, { threshold: 0.1 })
      const pct = changed / (w * h)
      const maskArea = rs.reduce((s, r) => s + Math.max(0, r.w) * Math.max(0, r.h), 0) / (w * h)
      writeFileSync(`pixel-baselines/diff/${slug}-${vp.n}.png`, PNG.sync.write(diff))
      results.push({ page: path, vp: vp.n, pct, pass: pct < TOL, w, h, masks: rs.length, maskAreaPct: maskArea })
      console.log(`${path} @ ${vp.n}: ${(pct * 100).toFixed(2)}% ${pct < TOL ? 'PASS' : 'FAIL'} (orig ${orig.height} / clone ${clone.height}px, ${rs.length} masks / ${(maskArea * 100).toFixed(2)}% area)`)
    }
  }
  await b.close()
  writeFileSync('docs/reference/proof-pixel-report.json', JSON.stringify({ tolerance: TOL, results }, null, 2))
  if (manifest.length) { const mf = existsSync('pixel-baselines/manifest.json') ? JSON.parse(readFileSync('pixel-baselines/manifest.json', 'utf8')) : []; writeFileSync('pixel-baselines/manifest.json', JSON.stringify([...mf, ...manifest], null, 2)) }
  const fails = results.filter((r) => !r.pass).length
  console.log(`\n${results.length} comparisons, ${fails} over ${TOL * 100}%`)
}
main().catch((e) => { console.error(e); process.exit(1) })
