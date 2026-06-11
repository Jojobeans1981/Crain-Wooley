import { chromium, type Page } from 'playwright'
import { writeFileSync } from 'node:fs'
import { PNG } from 'pngjs'
import pixelmatch from 'pixelmatch'
const ORIG = 'https://www.estateplanningdfw.law', CLONE = 'http://localhost:3210'
const P = '/about-us/pricing/flat-rate-services/'
const SEL = { clone: process.argv[3] || '.legacy-banner', orig: process.argv[2] || '#Form_BannerV1, [id^="Banner"], .bnr' }
const NAME = process.argv[4] || 'banner'
async function prep(pg: Page, url: string) {
  await pg.goto(url, { waitUntil: 'load', timeout: 60000 })
  await pg.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)) } window.scrollTo(0, 0) })
  await pg.addStyleTag({ content: '[data-onvisible],.anm,[class*="anm"],.reveal,.reveal-stagger,.reveal-stagger>*{opacity:1!important;transform:none!important;visibility:visible!important;animation:none!important;transition:none!important}' })
  await pg.addStyleTag({ content: '.cw-site-header,[id^="Header"],.hdr,header.hdr,[class*="hdr-sticky"],[class*="-sticky"]{position:static!important;top:auto!important}' })
  await pg.addStyleTag({ content: '#scorpion_connect,.connect-page,[class*="cta-tile"],[class*="ctas-tiles"]{display:none!important}' })
  await pg.evaluate(() => { document.querySelectorAll('img[data-src], source[data-src]').forEach((e) => { const s = e.getAttribute('data-src'); if (s) { e.setAttribute('src', s); if (e.tagName === 'SOURCE') e.setAttribute('srcset', s) } }) })
  await pg.evaluate(() => Promise.all(Array.from(document.images).map((i) => i.complete ? 0 : new Promise<void>((r) => { i.onload = () => r(); i.onerror = () => r(); setTimeout(() => r(), 4000) }))))
  await pg.waitForTimeout(600)
}
async function shot(pg: Page, sel: string) {
  const loc = pg.locator(sel).first(); if (!(await loc.count())) return null
  await loc.scrollIntoViewIfNeeded().catch(()=>{})
  await loc.evaluate((el) => Promise.all(Array.from(el.querySelectorAll('img')).map((i) => i.complete && i.naturalWidth>0 ? 0 : new Promise<void>((r) => { (i as any).loading='eager'; i.onload=()=>r(); i.onerror=()=>r(); setTimeout(()=>r(),5000) })))).catch(()=>{})
  await pg.waitForTimeout(150)
  const buf = await loc.screenshot({ timeout: 15000 }).catch(()=>null)
  return buf ? PNG.sync.read(buf as Buffer) : null
}
function pad(src: PNG, w: number, h: number) { const o = new PNG({width:w,height:h}); o.data.fill(255); for (let y=0;y<Math.min(h,src.height);y++) for (let x=0;x<Math.min(w,src.width);x++){const si=(src.width*y+x)<<2,di=(w*y+x)<<2;o.data[di]=src.data[si];o.data[di+1]=src.data[si+1];o.data[di+2]=src.data[si+2];o.data[di+3]=src.data[si+3]} return o }
;(async () => {
  const b = await chromium.launch()
  const pgC = await b.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' })
  const pgO = await b.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' })
  await Promise.all([prep(pgC, CLONE+P), prep(pgO, ORIG+P)])
  const c = await shot(pgC, SEL.clone), o = await shot(pgO, SEL.orig)
  if (!c || !o) { console.log('missing', !c?'clone':'orig'); await b.close(); return }
  const W = Math.max(c.width,o.width), H = Math.max(c.height,o.height)
  const diff = new PNG({width:W,height:H})
  const changed = pixelmatch(pad(o,W,H).data, pad(c,W,H).data, diff.data, W, H, {threshold:0.1})
  console.log(`${NAME}: ${(changed/(W*H)*100).toFixed(2)}%  cloneH ${c.height} origH ${o.height} (delta ${o.height-c.height})`)
  writeFileSync(`pixel-baselines/band/unit0/${NAME}-sidebyside.png`, PNG.sync.write((() => { const g=4,HH=Math.max(o.height,c.height),WW=o.width+g+c.width; const out=new PNG({width:WW,height:HH}); out.data.fill(255); const blit=(s:PNG,ox:number)=>{for(let y=0;y<s.height;y++)for(let x=0;x<s.width;x++){const si=(s.width*y+x)<<2,di=(WW*y+(x+ox))<<2;out.data[di]=s.data[si];out.data[di+1]=s.data[si+1];out.data[di+2]=s.data[si+2];out.data[di+3]=255}}; blit(o,0); blit(c,o.width+g); return out })()))
  await b.close()
})()
