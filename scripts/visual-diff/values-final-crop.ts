/*
 * Values band — ONE strict 1:1 SAME-SCALE side-by-side for owner decision.
 * Both panels rendered at NATIVE 1440px and blitted with NO resize/scale on either side
 * (the earlier banner crop scaled the clone larger — never again). Clean capture path:
 * unified Scorpion hide-set + header de-stick + fonts.ready + img settle.
 * Usage: CLONE_ORIGIN=http://localhost:3210 npx tsx scripts/visual-diff/values-final-crop.ts
 */
import { chromium, type Page } from 'playwright'
import { writeFileSync, mkdirSync } from 'node:fs'
import { homedir } from 'node:os'
import { PNG } from 'pngjs'
import { SCORPION_HIDE_CSS } from './scorpion-hide'
const ORIG = 'https://www.estateplanningdfw.law', CLONE = process.env.CLONE_ORIGIN || 'http://localhost:3210'
const P = '/about-us/pricing/flat-rate-services/', OUT = `${homedir()}/Desktop/values-final-review`
async function prep(pg: Page, url: string) {
  await pg.goto(url, { waitUntil: 'load', timeout: 60000 })
  await pg.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 70)) } window.scrollTo(0, 0) })
  await pg.addStyleTag({ content: '[data-onvisible],.anm,[class*="anm"],.reveal,.reveal-stagger,.reveal-stagger>*{opacity:1!important;transform:none!important;visibility:visible!important}' }).catch(() => {})
  await pg.addStyleTag({ content: '.cw-site-header,[id^="Header"],.hdr,header.hdr,[class*="hdr-sticky"],[class*="-sticky"]{position:static!important;top:auto!important}' }).catch(() => {})
  await pg.addStyleTag({ content: SCORPION_HIDE_CSS }).catch(() => {})
  await pg.evaluate(() => Promise.all(Array.from(document.images).map(i => i.complete ? 0 : new Promise<void>(r => { i.onload = () => r(); i.onerror = () => r(); setTimeout(() => r(), 4000) }))))
  await Promise.race([pg.evaluate(() => document.fonts.ready.then(() => undefined)), pg.waitForTimeout(4000)]).catch(() => {})
  await pg.waitForTimeout(800)
}
async function shot(pg: Page, sel: string) { const l = pg.locator(sel).first(); await l.scrollIntoViewIfNeeded().catch(() => {}); await pg.waitForTimeout(300); return PNG.sync.read(await l.screenshot() as Buffer) }
async function probe(pg: Page, sel: string) {
  return pg.locator(sel).first().evaluate(bd => {
    const titles = ['Expert Service', 'Lifetime Guarantee', 'Flat-Rate']
    const cards = titles.map(t => {
      const el = [...bd.querySelectorAll('*')].find(e => (e.textContent || '').trim().startsWith(t.split(' ')[0]) && /Expert|Guarantee|Flat-Rate|Lifetime/i.test((e.textContent || '').slice(0, 40)) && e.children.length === 0)
      if (!el) return { key: t, found: false }
      const card = el.closest('li,[data-item],.cw-values-card,.half') || el.parentElement
      const body = card ? [...card.querySelectorAll('p,div')].map(p => (p.textContent || '').trim()).filter(x => x.length > 40)[0] : ''
      return { key: t, found: true, title: (el.textContent || '').trim().slice(0, 40), body: (body || '').slice(0, 70) }
    })
    const cs = getComputedStyle(bd)
    return { cards, bg: cs.backgroundImage.slice(0, 70), bgColor: cs.backgroundColor }
  })
}
function sameScale(o: PNG, c: PNG) {
  // NO resize: place both at native width, side by side, padded to equal height only.
  const H = Math.max(o.height, c.height), gap = 4, CW = o.width + c.width + gap
  const out = new PNG({ width: CW, height: H }); out.data.fill(20)
  const blit = (s: PNG, ox: number) => { for (let y = 0; y < s.height; y++) for (let x = 0; x < s.width; x++) { const si = (s.width * y + x) << 2, di = (CW * y + (x + ox)) << 2; out.data[di] = s.data[si]; out.data[di + 1] = s.data[si + 1]; out.data[di + 2] = s.data[si + 2]; out.data[di + 3] = 255 } }
  blit(o, 0); blit(c, o.width + gap); return out
}
;(async () => {
  mkdirSync(OUT, { recursive: true }); const b = await chromium.launch()
  const pgO = await b.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' }); await prep(pgO, ORIG + P)
  const pgC = await b.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' }); await prep(pgC, CLONE + P)
  const o = await shot(pgO, '#ValuesV2'), c = await shot(pgC, '.cw-values')
  const probeO = await probe(pgO, '#ValuesV2'), probeC = await probe(pgC, '.cw-values')
  await pgO.close(); await pgC.close()
  writeFileSync(`${OUT}/values-desktop.png`, PNG.sync.write(sameScale(o, c)))
  console.log(`orig ${o.width}x${o.height} | clone ${c.width}x${c.height}  (same-scale: both native ${o.width === c.width ? o.width + 'px ✓' : o.width + ' vs ' + c.width + ' — widths differ'})`)
  console.log('ORIG cards:', JSON.stringify(probeO.cards))
  console.log('CLONE cards:', JSON.stringify(probeC.cards))
  console.log('ORIG bg:', probeO.bgColor, probeO.bg)
  console.log('CLONE bg:', probeC.bgColor, probeC.bg)
  await b.close()
})()
