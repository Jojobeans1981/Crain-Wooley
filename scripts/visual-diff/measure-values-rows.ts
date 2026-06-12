/*
 * 1a — compare the value ROW contents (title/body text + heights + line metrics)
 * between the original ValuesV2 card and the clone, to explain the card-height
 * deficit after the box was pinned.
 * Usage: CLONE_ORIGIN=http://localhost:3210 npx tsx scripts/visual-diff/measure-values-rows.ts
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
  await pg.waitForTimeout(500)
}

async function main() {
  const b = await chromium.launch()
  const pgO = await b.newPage({ viewport: VP, reducedMotion: 'reduce' })
  await prep(pgO, ORIG + P)
  const orig = await pgO.evaluate(() => {
    const feed = document.querySelector('#ValuesV2Feed') || document.querySelector('#ValuesV2')
    if (!feed) return { rows: [] }
    const lis = Array.from(feed.querySelectorAll('li'))
    return {
      rows: lis.map((li) => {
        const r = li.getBoundingClientRect()
        const titleEl = li.querySelector('h1,h2,h3,h4,h5,h6,strong,b,[class*="ttl"],[class*="title"]')
        const bodyEls = Array.from(li.querySelectorAll('p,span,div')).filter((e) => (e.textContent || '').trim().length > 20)
        const tcs = titleEl ? getComputedStyle(titleEl) : null
        const bcs = bodyEls[0] ? getComputedStyle(bodyEls[0]) : null
        return {
          h: Math.round(r.height),
          title: (titleEl?.textContent || '').trim().slice(0, 50),
          titleFont: tcs ? `${tcs.fontSize}/${tcs.lineHeight} ${tcs.fontWeight} ${tcs.fontFamily.split(',')[0]}` : '',
          body: (bodyEls.map((e) => (e.textContent || '').trim()).join(' | ')).slice(0, 120),
          bodyFont: bcs ? `${bcs.fontSize}/${bcs.lineHeight} ${bcs.fontWeight}` : '',
        }
      }),
    }
  })
  await pgO.close()

  const pgC = await b.newPage({ viewport: VP, reducedMotion: 'reduce' })
  await prep(pgC, CLONE + P)
  const clone = await pgC.evaluate(() => {
    const card = document.querySelector('.cw-values-card')
    if (!card) return { rows: [] }
    const lis = Array.from(card.querySelectorAll('.cw-value, li'))
    return {
      rows: lis.map((li) => {
        const r = li.getBoundingClientRect()
        const titleEl = li.querySelector('.cw-value-title')
        const bodyEl = li.querySelector('.cw-value-body')
        const fineEl = li.querySelector('.cw-value-fine')
        const tcs = titleEl ? getComputedStyle(titleEl) : null
        const bcs = bodyEl ? getComputedStyle(bodyEl) : null
        return {
          h: Math.round(r.height),
          title: (titleEl?.textContent || '').trim().slice(0, 50),
          titleFont: tcs ? `${tcs.fontSize}/${tcs.lineHeight} ${tcs.fontWeight} ${tcs.fontFamily.split(',')[0]}` : '',
          body: ((bodyEl?.textContent || '') + (fineEl ? ' | FINE:' + fineEl.textContent : '')).trim().slice(0, 120),
          bodyFont: bcs ? `${bcs.fontSize}/${bcs.lineHeight} ${bcs.fontWeight}` : '',
        }
      }),
    }
  })
  await pgC.close()
  await b.close()

  console.log('=== ORIGINAL value rows ===')
  for (const r of orig.rows) console.log(`  h${r.h} title="${r.title}" [${r.titleFont}]\n      body="${r.body}" [${r.bodyFont}]`)
  console.log('\n=== CLONE value rows ===')
  for (const r of clone.rows) console.log(`  h${r.h} title="${r.title}" [${r.titleFont}]\n      body="${r.body}" [${r.bodyFont}]`)
}
main().catch((e) => { console.error(e); process.exit(1) })
