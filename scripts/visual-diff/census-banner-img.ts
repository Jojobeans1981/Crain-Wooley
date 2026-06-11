/*
 * Correct the banner census: the navy + script-watermark banner is an <img>
 * (e.g. /assets/pack/background/sub-banner-about.jpg) layered over a gold
 * fallback bg — my computed-COLOUR read saw only the fallback. Read the banner
 * <img> from each baseline (offline; the tag is in the captured HTML) and record
 * the real banner kind: 'navy-image' (+ asset) vs 'form' vs 'none'.
 * Patches banner.real into the census and prints the split + distinct assets.
 *
 * Usage: npx tsx scripts/visual-diff/census-banner-img.ts
 */
import { chromium } from 'playwright'
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs'

async function main() {
  const census = JSON.parse(readFileSync('docs/reference/page-structure-census.json', 'utf8')) as Record<string, { banner?: Record<string, unknown>; family?: string }>
  const lp = JSON.parse(readFileSync('lib/legacy/legacy-pages.json', 'utf8')) as Record<string, unknown>
  const slugToPath = new Map<string, string>()
  for (const k of Object.keys(lp)) slugToPath.set(k.replace(/^\//, '').replace(/\//g, '__'), k)

  const b = await chromium.launch()
  const p = await b.newPage()
  await p.route('**', (r) => r.abort())
  const root = 'docs/reference/capture'
  const slugs = readdirSync(root).filter((s) => existsSync(`${root}/${s}/desktop/original.html`))
  const split: Record<string, number> = {}
  const assets = new Map<string, number>()
  for (const slug of slugs) {
    const path = slugToPath.get(slug) || (slug === 'home' ? '/' : '/' + slug.replace(/__/g, '/'))
    if (!census[path]) continue
    await p.setContent(readFileSync(`${root}/${slug}/desktop/original.html`, 'utf8'), { waitUntil: 'commit', timeout: 20000 }).catch(() => {})
    await p.waitForTimeout(15)
    const r = await p.evaluate(() => {
      const banner = document.querySelector('#BannerV1, .bnr.v1') as HTMLElement | null
      const form = document.querySelector('#Form_BannerV1') as HTMLElement | null
      if (banner) {
        const img = banner.querySelector('img') as HTMLImageElement | null
        const src = img ? (img.getAttribute('src') || '') : ''
        return { kind: src && /sub-banner|background/i.test(src) ? 'navy-image' : 'section-nobg', asset: src }
      }
      if (form) return { kind: 'form', asset: '' }
      return { kind: 'none', asset: '' }
    })
    const rec = census[path]
    rec.banner = { ...(rec.banner || {}), real: r }
    const key = `${rec.family || '?'}:${r.kind}`
    split[key] = (split[key] || 0) + 1
    if (r.asset) assets.set(r.asset, (assets.get(r.asset) || 0) + 1)
  }
  await b.close()
  writeFileSync('docs/reference/page-structure-census.json', JSON.stringify(census, null, 2))
  console.log('banner-real split (family:kind):')
  for (const [k, v] of Object.entries(split).sort()) console.log(`  ${k}: ${v}`)
  console.log('\ndistinct banner-image assets:')
  for (const [a, n] of [...assets.entries()].sort((x, y) => y[1] - x[1])) console.log(`  ${n}x  ${a}`)
}
main().catch((e) => { console.error(e); process.exit(1) })
