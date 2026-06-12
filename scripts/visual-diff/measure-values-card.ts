/*
 * 1a-REMAINDER — measure the ORIGINAL values card box by DOM (getBoundingClientRect
 * + computed padding/gap), NOT pixel probes. Print the original #ValuesV2 card and
 * the clone .cw-values-card so the box can be pinned exactly in one pass.
 *
 * Usage: CLONE_ORIGIN=http://localhost:3210 npx tsx scripts/visual-diff/measure-values-card.ts
 */
import { chromium, type Page } from 'playwright'

const ORIG = 'https://www.estateplanningdfw.law'
const CLONE = process.env.CLONE_ORIGIN || 'http://localhost:3210'
const P = '/about-us/pricing/flat-rate-services/'
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

async function main() {
  const b = await chromium.launch()
  // ORIGINAL — dump #ValuesV2 subtree: each element's tag/class, rect, padding, gap.
  const pgO = await b.newPage({ viewport: VP, reducedMotion: 'reduce' })
  await prep(pgO, ORIG + P)
  const orig = await pgO.evaluate(() => {
    const root = document.querySelector('#ValuesV2')
    if (!root) return { error: 'no #ValuesV2' }
    const rootBox = root.getBoundingClientRect()
    const out: any[] = []
    const stack: { el: Element; depth: number }[] = [{ el: root, depth: 0 }]
    while (stack.length) {
      const { el, depth } = stack.shift()!
      const cs = getComputedStyle(el)
      const r = el.getBoundingClientRect()
      if (r.width > 40 && r.height > 20 && depth <= 5) {
        out.push({
          depth,
          tag: el.tagName.toLowerCase(),
          id: el.id || '',
          cls: (el.className && typeof el.className === 'string') ? el.className.slice(0, 60) : '',
          left: Math.round(r.left), right: Math.round(r.right), top: Math.round(r.top - rootBox.top), w: Math.round(r.width), h: Math.round(r.height),
          bg: cs.backgroundColor,
          pad: `${cs.paddingTop} ${cs.paddingRight} ${cs.paddingBottom} ${cs.paddingLeft}`,
          gap: cs.rowGap !== 'normal' ? cs.rowGap : (cs.gap !== 'normal' ? cs.gap : ''),
          display: cs.display,
        })
      }
      if (depth < 5) for (const c of Array.from(el.children)) stack.push({ el: c, depth: depth + 1 })
    }
    return { rootTop: Math.round(rootBox.top), rootLeft: Math.round(rootBox.left), rootW: Math.round(rootBox.width), rootH: Math.round(rootBox.height), nodes: out }
  })
  await pgO.close()

  // CLONE — measure .cw-values-card + its grid container.
  const pgC = await b.newPage({ viewport: VP, reducedMotion: 'reduce' })
  await prep(pgC, CLONE + P)
  const clone = await pgC.evaluate(() => {
    const band = document.querySelector('.cw-values')
    const bt = band ? band.getBoundingClientRect().top : 0
    const out: any = {}
    for (const [name, sel] of [['band', '.cw-values'], ['grid', '.cw-values-grid'], ['head', '.cw-values-head'], ['card', '.cw-values-card']] as [string, string][]) {
      const el = document.querySelector(sel)
      if (!el) { out[name] = null; continue }
      const cs = getComputedStyle(el)
      const r = el.getBoundingClientRect()
      out[name] = { left: Math.round(r.left), right: Math.round(r.right), top: Math.round(r.top - bt), w: Math.round(r.width), h: Math.round(r.height), pad: `${cs.paddingTop} ${cs.paddingRight} ${cs.paddingBottom} ${cs.paddingLeft}`, gap: cs.rowGap !== 'normal' ? cs.rowGap : cs.gap, bg: cs.backgroundColor }
    }
    return out
  })
  await pgC.close()
  await b.close()

  console.log('=== ORIGINAL #ValuesV2 subtree ===')
  console.log(`root: top@page=${(orig as any).rootTop} left=${(orig as any).rootLeft} w=${(orig as any).rootW} h=${(orig as any).rootH}`)
  for (const n of (orig as any).nodes || []) {
    console.log(`  ${'  '.repeat(n.depth)}<${n.tag}${n.id ? '#' + n.id : ''} .${n.cls}> L${n.left} R${n.right} T${n.top} ${n.w}x${n.h} bg=${n.bg} pad=[${n.pad}] gap=${n.gap} ${n.display}`)
  }
  console.log('\n=== CLONE ===')
  console.log('band:', JSON.stringify(clone.band))
  console.log('grid:', JSON.stringify(clone.grid))
  console.log('head:', JSON.stringify(clone.head))
  console.log('card:', JSON.stringify(clone.card))
}
main().catch((e) => { console.error(e); process.exit(1) })
