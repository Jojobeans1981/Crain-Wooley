/*
 * Banner — strict 1:1 SAME-SCALE side-by-side per page (owner closure review).
 * Both panels at NATIVE 1440px, blitted with NO resize on either side. Clean path:
 * unified Scorpion hide-set + header de-stick + fonts.ready + img settle.
 * Usage: CLONE_ORIGIN=http://localhost:3210 npx tsx scripts/visual-diff/banner-final-crop.ts
 */
import { chromium, type Page } from 'playwright'
import { writeFileSync, mkdirSync } from 'node:fs'
import { homedir } from 'node:os'
import { PNG } from 'pngjs'
import { SCORPION_HIDE_CSS } from './scorpion-hide'
const ORIG = 'https://www.estateplanningdfw.law', CLONE = process.env.CLONE_ORIGIN || 'http://localhost:3210'
const OUT = `${homedir()}/Desktop/banner-final-review`
const PAGES: [string, string][] = [
  ['flat-rate', '/about-us/pricing/flat-rate-services/'],
  ['allen', '/allen/'],
  ['justin', '/staff-profiles/justin-t-crain/'],
]
async function prep(pg: Page, url: string) {
  await pg.goto(url, { waitUntil: 'load', timeout: 60000 })
  await pg.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 70)) } window.scrollTo(0, 0) })
  await pg.addStyleTag({ content: '[data-onvisible],.anm,[class*="anm"],.reveal,.reveal-stagger,.reveal-stagger>*{opacity:1!important;transform:none!important;visibility:visible!important}' }).catch(() => {})
  await pg.addStyleTag({ content: '.cw-site-header,[id^="Header"],.hdr,header.hdr,[class*="hdr-sticky"],[class*="-sticky"]{position:static!important;top:auto!important}' }).catch(() => {})
  await pg.addStyleTag({ content: SCORPION_HIDE_CSS }).catch(() => {})
  await pg.evaluate(() => Promise.all(Array.from(document.images).map(i => i.complete ? 0 : new Promise<void>(r => { i.onload = () => r(); i.onerror = () => r(); setTimeout(() => r(), 4000) }))))
  await Promise.race([pg.evaluate(() => document.fonts.ready.then(() => undefined)), pg.waitForTimeout(4000)]).catch(() => {})
  await pg.waitForTimeout(700)
}
async function shot(pg: Page, sels: string[]) {
  for (const s of sels) { const l = pg.locator(s).first(); if (await l.count()) { await l.scrollIntoViewIfNeeded().catch(() => {}); await pg.waitForTimeout(250); return PNG.sync.read(await l.screenshot() as Buffer) } }
  return null
}
function sameScale(o: PNG, c: PNG) {
  const H = Math.max(o.height, c.height), gap = 4, CW = o.width + c.width + gap
  const out = new PNG({ width: CW, height: H }); out.data.fill(20)
  const blit = (s: PNG, ox: number) => { for (let y = 0; y < s.height; y++) for (let x = 0; x < s.width; x++) { const si = (s.width * y + x) << 2, di = (CW * y + (x + ox)) << 2; out.data[di] = s.data[si]; out.data[di + 1] = s.data[si + 1]; out.data[di + 2] = s.data[si + 2]; out.data[di + 3] = 255 } }
  blit(o, 0); blit(c, o.width + gap); return out
}
;(async () => {
  mkdirSync(OUT, { recursive: true }); const b = await chromium.launch()
  for (const [name, path] of PAGES) {
    const pgO = await b.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' }); await prep(pgO, ORIG + path)
    const pgC = await b.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' }); await prep(pgC, CLONE + path)
    const o = await shot(pgO, ['.bnr', '[id^="Form_Banner"]', '[id^="Banner"]', '[class*="bnr"]'])
    const c = await shot(pgC, ['.legacy-banner'])
    await pgO.close(); await pgC.close()
    if (!o || !c) { console.log(`${name}: MISSING ${!o ? 'orig' : 'clone'} banner`); continue }
    writeFileSync(`${OUT}/banner-${name}.png`, PNG.sync.write(sameScale(o, c)))
    console.log(`${name}: orig ${o.width}x${o.height} | clone ${c.width}x${c.height}  (same-scale ${o.width === c.width ? o.width + 'px ✓' : o.width + ' vs ' + c.width}) -> banner-${name}.png`)
  }
  await b.close()
})()
