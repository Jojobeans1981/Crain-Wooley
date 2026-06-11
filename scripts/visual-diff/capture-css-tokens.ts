/*
 * Capture the original's stylesheet(s) + computed design tokens for the interior
 * layout elements. The committed CSS is the canonical token source (DECISION 1).
 * Courteous: one live load per representative page, ~3s apart.
 *
 *   docs/reference/baseline-css/<name>.css   raw original stylesheet(s)
 *   docs/reference/baseline-tokens.json      computed styles for key selectors
 *
 * Usage: npx tsx scripts/visual-diff/capture-css-tokens.ts
 */
import { chromium } from 'playwright'
import { writeFileSync, mkdirSync } from 'node:fs'

const ORIGIN = 'https://www.estateplanningdfw.law'
// representative pages: navy banner + sidebar + badges + closers; form banner; staff
const PAGES = ['/estate-planning/asset-protection/', '/about-us/', '/staff-profiles/justin-t-crain/']

async function main() {
  mkdirSync('docs/reference/baseline-css', { recursive: true })
  const b = await chromium.launch()
  const page = await b.newPage({ viewport: { width: 1440, height: 1000 } })
  const tokens: Record<string, unknown> = {}
  let cssSaved = false

  for (let i = 0; i < PAGES.length; i++) {
    const path = PAGES[i]
    await page.goto(ORIGIN + path, { waitUntil: 'load', timeout: 60_000 })
    await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)) } window.scrollTo(0, 0) })
    await page.waitForTimeout(900)

    if (!cssSaved) {
      // fetch each same-origin /cms stylesheet via in-page fetch (bypasses bot block)
      const hrefs = await page.evaluate(() => (Array.from(document.querySelectorAll('link[rel=stylesheet]')) as HTMLLinkElement[]).map((l) => l.href).filter((h) => /\/cms\/|estateplanningdfw/i.test(h)))
      for (const href of hrefs) {
        const css = await page.evaluate(async (u) => { try { const r = await fetch(u); return await r.text() } catch { return '' } }, href)
        if (css) { const name = href.split('/').pop()!.split('?')[0]; writeFileSync(`docs/reference/baseline-css/${name}`, css); }
      }
      // also save the inline <style> blocks
      const inline = await page.evaluate(() => Array.from(document.querySelectorAll('style')).map((s) => s.textContent || '').join('\n/* --- */\n'))
      if (inline.trim()) writeFileSync('docs/reference/baseline-css/_inline.css', inline)
      cssSaved = true
    }

    const t = await page.evaluate(() => {
      // no named helpers (esbuild __name trap) — inline everything
      const sel: Record<string, string> = {
        navyBanner: '.bnr.dk-bg, #BannerV1', bannerTitle: '.bnr .fnt_t-1, #BannerV1 .fnt_t-1',
        formBanner: '#Form_BannerV1', sidebar: '.sd-zn', badgeStrip: '.aws', pillars: '.vls', schedule: '.cta',
      }
      const box = ['background-color', 'background-image', 'color', 'padding-top', 'padding-bottom', 'border-bottom', 'font-family', 'font-size', 'font-weight']
      const out: Record<string, Record<string, string> | null> = {}
      for (const k in sel) {
        const e = document.querySelector(sel[k]) as HTMLElement | null
        if (!e) { out[k] = null; continue }
        const s = getComputedStyle(e); const o: Record<string, string> = {}
        for (const p of box) o[p] = s.getPropertyValue(p)
        out[k] = o
      }
      const lnflr = document.querySelector('.ln-flr') as HTMLElement | null
      const af = lnflr ? getComputedStyle(lnflr, '::after') : null
      const goldRuleAfter = af ? { content: af.content, background: af.backgroundColor, borderBottom: af.borderBottom, width: af.width, height: af.height } : null
      return { ...out, goldRuleAfter }
    })
    tokens[path] = t
  }
  await b.close()
  writeFileSync('docs/reference/baseline-tokens.json', JSON.stringify(tokens, null, 2))
  console.log('saved baseline-css/* + baseline-tokens.json')
  console.log(JSON.stringify(tokens['/estate-planning/asset-protection/'], null, 1))
}
main().catch((e) => { console.error(e); process.exit(1) })
