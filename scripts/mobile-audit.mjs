import { chromium } from 'playwright'
import { mkdir } from 'node:fs/promises'

const BASE = process.env.BASE_URL || 'http://localhost:3000'
const OUT = 'mobile-audit'
const viewports = [
  { name: 'phone', width: 390, height: 844, isMobile: true },
  { name: 'tablet', width: 768, height: 1024, isMobile: false },
]
const pages = [
  ['home', '/'],
  ['blogs', '/blogs'],
  ['blog-post', '/blogs/2026/may/how-to-choose-the-right-person-for-your-power-of'],
  ['reviews', '/reviews'],
  ['practice-area', '/estate-planning'],
  ['about', '/about-us'],
  ['location', '/allen'],
  ['webinar', '/webinar-registration'],
  ['guide', '/resources/free-estate-planning-guide'],
]

await mkdir(OUT, { recursive: true })
const browser = await chromium.launch()
const flagged = []
for (const vp of viewports) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 2, isMobile: vp.isMobile, hasTouch: vp.isMobile })
  const page = await ctx.newPage()
  for (const [label, path] of pages) {
    try {
      await page.goto(BASE + path, { waitUntil: 'networkidle', timeout: 30000 })
      await page.waitForTimeout(400)
      const m = await page.evaluate((w) => {
        const docW = document.documentElement.scrollWidth
        const over = docW > w + 1
        let culprits = []
        if (over) {
          culprits = [...document.querySelectorAll('body *')]
            .filter((el) => el.offsetParent !== null && el.getBoundingClientRect().right > w + 1)
            .slice(0, 8)
            .map((el) => `${el.tagName.toLowerCase()}.${(typeof el.className === 'string' ? el.className.split(' ')[0] : '')} → right ${Math.round(el.getBoundingClientRect().right)}px`)
        }
        return { docW, over, culprits }
      }, vp.width)
      await page.screenshot({ path: `${OUT}/${vp.name}-${label}.png`, fullPage: true })
      const tag = m.over ? '⚠️ OVERFLOW' : 'ok        '
      console.log(`${tag} [${vp.name}] ${path}  (docW ${m.docW} vs ${vp.width})`)
      if (m.over) { m.culprits.forEach((c) => console.log('    ' + c)); flagged.push(`${vp.name} ${path}`) }
    } catch (e) {
      console.log(`ERROR [${vp.name}] ${path}: ${e.message}`)
    }
  }
  await ctx.close()
}
await browser.close()
console.log(`\nScreenshots → ./${OUT}/   |   ${flagged.length} overflow issue(s):`, flagged)
