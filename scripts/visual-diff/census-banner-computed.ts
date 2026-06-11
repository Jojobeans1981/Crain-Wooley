/*
 * Re-census the page-title banner using COMPUTED styles (the class `dk-bg` does
 * NOT imply navy — asset-protection computes gold rgb(155,128,89)). Injects the
 * committed original CSS into each baseline (offline, reproduces live computed
 * colour exactly) and records the real banner bg colour + watermark per page.
 * Patches banner.computed into page-structure-census.json and prints the split.
 *
 * Usage: npx tsx scripts/visual-diff/census-banner-computed.ts
 */
import { chromium } from 'playwright'
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs'

const GOLD = 'rgb(155, 128, 89)'

async function main() {
  const css = readFileSync('docs/reference/baseline-css/ndb22r895wh.2605201301125.css', 'utf8') +
    (existsSync('docs/reference/baseline-css/_inline.css') ? '\n' + readFileSync('docs/reference/baseline-css/_inline.css', 'utf8') : '')
  const census = JSON.parse(readFileSync('docs/reference/page-structure-census.json', 'utf8')) as Record<string, { banner?: Record<string, unknown>; family?: string }>
  const lp = JSON.parse(readFileSync('lib/legacy/legacy-pages.json', 'utf8')) as Record<string, unknown>
  const slugToPath = new Map<string, string>()
  for (const k of Object.keys(lp)) slugToPath.set(k.replace(/^\//, '').replace(/\//g, '__'), k)

  const b = await chromium.launch()
  const p = await b.newPage({ viewport: { width: 1440, height: 1000 } })
  await p.route('**', (r) => r.abort())

  const root = 'docs/reference/capture'
  const slugs = readdirSync(root).filter((s) => existsSync(`${root}/${s}/desktop/original.html`))
  const split: Record<string, number> = {}
  for (const slug of slugs) {
    const path = slugToPath.get(slug) || (slug === 'home' ? '/' : '/' + slug.replace(/__/g, '/'))
    if (!census[path]) continue
    let html = readFileSync(`${root}/${slug}/desktop/original.html`, 'utf8')
    html = html.replace('</head>', `<style>${css}</style></head>`)
    await p.setContent(html, { waitUntil: 'commit', timeout: 20000 }).catch(() => {})
    await p.waitForTimeout(120)
    const c = await p.evaluate(() => {
      const banner = (document.querySelector('#BannerV1, .bnr.v1, #Form_BannerV1') || document.querySelector('main > *')) as HTMLElement | null
      if (!banner) return null
      const s = getComputedStyle(banner)
      // watermark = any descendant (or self) carrying a background-image
      let watermark = ''
      for (const e of [banner, ...Array.from(banner.querySelectorAll('*'))] as HTMLElement[]) { const bi = getComputedStyle(e).backgroundImage; if (bi && bi !== 'none' && /url\(/.test(bi)) { watermark = bi.slice(0, 80); break } }
      return { bg: s.backgroundColor, bgImage: s.backgroundImage.slice(0, 60), watermark, element: banner.tagName.toLowerCase() + '#' + (banner.id || '') }
    })
    if (c) {
      // classify by computed colour
      const r = c.bg.match(/\d+/g)?.map(Number) || [0, 0, 0]
      const isGold = c.bg === GOLD
      const lum = (r[0] + r[1] + r[2]) / 3
      const type = isGold ? 'gold' : c.bg === 'rgba(0, 0, 0, 0)' ? 'transparent' : lum < 90 ? 'navy/dark' : 'light'
      const rec = census[path]
      rec.banner = { ...(rec.banner || {}), computed: { bg: c.bg, type, watermark: !!c.watermark, watermarkUrl: c.watermark || null, element: c.element } }
      const key = `${rec.family || '?'}:${type}${c.watermark ? '+wm' : ''}`
      split[key] = (split[key] || 0) + 1
    }
  }
  await b.close()
  writeFileSync('docs/reference/page-structure-census.json', JSON.stringify(census, null, 2))
  console.log('computed banner split (family:type+watermark):')
  for (const [k, v] of Object.entries(split).sort()) console.log(`  ${k}: ${v}`)
}
main().catch((e) => { console.error(e); process.exit(1) })
