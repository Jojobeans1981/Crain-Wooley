/*
 * STEP 1 — Unified structural census over every committed baseline (offline; the
 * baseline HTML is the only source of truth). Emits one layout record per page to
 * docs/reference/page-structure-census.json. Visual facts are read from the
 * baseline markup + Scorpion class signatures (dk-bg=navy, bg-image=watermark,
 * ln-flr=gold rule, aws=badge strip, sd-zn=sidebar zone, bnr s5=webinar strip).
 * Exact computed colours/asset URLs come from the original CSS in Step 2.
 *
 * Usage: npx tsx scripts/visual-diff/census-structure.ts
 */
import { chromium } from 'playwright'
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs'

function familyOf(type: string | undefined): string {
  if (!type) return 'other'
  if (['service', 'resource', 'other'].includes(type)) return 'B'
  if (type === 'location') return 'D'
  if (type === 'staff') return 'C'
  if (type === 'blog_post') return 'E'
  if (['contact'].includes(type)) return 'F'
  return type
}

async function main() {
  const lp = JSON.parse(readFileSync('lib/legacy/legacy-pages.json', 'utf8')) as Record<string, { type: string }>
  const slugToPath = new Map<string, string>()
  for (const k of Object.keys(lp)) slugToPath.set(k.replace(/^\//, '').replace(/\//g, '__'), k)
  const root = 'docs/reference/capture'
  const slugs = readdirSync(root).filter((s) => existsSync(`${root}/${s}/desktop/original.html`))

  const b = await chromium.launch()
  const p = await b.newPage()
  await p.route('**', (r) => r.abort())
  const records: Record<string, unknown>[] = []
  for (const slug of slugs) {
    const path = slugToPath.get(slug) || (slug === 'home' ? '/' : '/' + slug.replace(/__/g, '/'))
    const type = (lp[path] || lp[path.replace(/\/$/, '')] || {}).type
    await p.setContent(readFileSync(`${root}/${slug}/desktop/original.html`, 'utf8'), { waitUntil: 'commit', timeout: 20000 }).catch(() => {})
    await p.waitForTimeout(20)
    const rec = await p.evaluate(() => {
      const main = (document.querySelector('main') || document.body) as HTMLElement
      const kids = Array.from(main.children) as HTMLElement[]

      // page-title banner = main child with a bnr/Banner class+title that is NOT the bnr s5 webinar strip
      let banner: Record<string, unknown> = { type: 'none' }
      for (let i = 0; i < kids.length; i++) {
        const e = kids[i]; const c = (e.className?.toString() || '').toLowerCase()
        if ((/(^|\s)bnr(\s|$)/.test(c) || /^(Form_)?Banner/.test(e.id)) && !/(^|\s)s5(\s|$)/.test(c)) {
          const titleEl = e.querySelector('.fnt_t-1, h1, h2, strong') as HTMLElement | null
          const isFormBanner = e.tagName === 'FORM' || /Form_Banner/.test(e.id)
          banner = {
            // dk-bg=navy via class; the <form> banner carries no bg class so its
            // colour is CSS-only -> 'form (style via CSS in step 2)'
            type: /(^|\s)dk-bg/.test(c) ? 'navy' : /(^|\s)lt-bg/.test(c) ? 'light' : isFormBanner ? 'form' : 'other',
            element: e.tagName.toLowerCase() + '#' + (e.id || '') + (c ? '.' + c.slice(0, 30) : ''),
            hasWatermark: /(^|\s)bg-image/.test(c),
            rule: !!e.querySelector('.ln-flr'),
            title: (titleEl?.textContent || '').replace(/\s+/g, ' ').trim(),
            pos: i,
          }
          break
        }
      }

      // announcement / webinar strip: a bnr s5 band OR webinar-register/sign-up text
      let annEl: HTMLElement | null = null
      for (const e of Array.from(document.querySelectorAll('section, div, p, a, span')) as HTMLElement[]) {
        const ec = (e.className?.toString() || '').toLowerCase()
        if ((/(^|\s)bnr(\s|$)/.test(ec) && /(^|\s)s5(\s|$)/.test(ec)) || /register for our free webinar|webinar to compare|watch a quick.{0,20}webinar|sign up below/i.test((e.textContent || '').slice(0, 160))) { annEl = e; break }
      }
      const announcementBar = !!annEl
      const announcementText = annEl ? (annEl.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 70) : ''

      // badge strip = aws section
      let badge: Record<string, unknown> = { present: false }
      for (let i = 0; i < kids.length; i++) { const kc = (kids[i].className?.toString() || '').toLowerCase(); if (/(^|\s)aws(\s|$)|award/.test(kc)) { badge = { present: true, pos: i, classes: kc.slice(0, 30) }; break } }

      // sidebar = sd-zn zone inside the two-column content band
      let sidebar: Record<string, unknown> = { present: false }
      const sd = main.querySelector('.sd-zn, [class*=sd-zn]') as HTMLElement | null
      if (sd) {
        const links = (Array.from(sd.querySelectorAll('a')) as HTMLAnchorElement[]).map((a) => ({ text: (a.textContent || '').replace(/\s+/g, ' ').trim(), href: a.getAttribute('href') || '' })).filter((l) => l.text)
        sidebar = {
          present: true, zone: (sd.className?.toString() || '').toLowerCase().slice(0, 24),
          hasForm: !!sd.querySelector('form, input'),
          hasOffice: /office|suite|tx \d{5}|\(\d{3}\)/i.test(sd.textContent || ''),
          linkCount: links.length,
          links: links.slice(0, 30),
          chars: (sd.textContent || '').replace(/\s+/g, ' ').trim().length,
        }
      }

      // closers in source order (existing model)
      const closers: { which: string; pos: number }[] = []
      for (let i = 0; i < kids.length; i++) {
        const e = kids[i]; const c = (e.className?.toString() || '').toLowerCase(); const stx = (e.textContent || '').replace(/\s+/g, ' ')
        if (/Estate Planning With Us Means|DESIGNED FOR YOUR COMFORT/i.test(stx) || /(^|\s)vls(\s|$)/.test(c)) closers.push({ which: 'pillars', pos: i })
        else if (/Schedule a Consultation Today/i.test(stx) || /(^|\s)cta(\s|$)/.test(c)) closers.push({ which: 'schedule', pos: i })
        else if (/What (Our|People)[^.]{0,30}Say/i.test(stx) || /(^|\s)(rvw|tst|testim|review)/.test(c)) closers.push({ which: 'testimonials', pos: i })
      }

      // intro layout: image inside the content zone
      const cnt = main.querySelector('.cnt-zn, [class*=cnt-zn]') as HTMLElement | null
      let introImage: string | null = null
      const scope = cnt || main
      for (const i of Array.from(scope.querySelectorAll('img')) as HTMLImageElement[]) { const src = i.getAttribute('data-src') || i.getAttribute('src') || ''; if (src && !/^data:|\.svg|logo|accolade|badge|bar-college|elder|naela|banner|icon|sprite/i.test(src)) { introImage = src; break } }

      return { banner, announcementBar, announcementText, badgeStrip: badge, sidebar, closers, intro: { twoColumn: !!sd, introImage } }
    })
    records.push({ path, family: familyOf(type), type, ...rec })
  }
  await b.close()
  const byPath = Object.fromEntries(records.sort((a, b) => String(a.path).localeCompare(String(b.path))).map((r) => [r.path, r]))
  writeFileSync('docs/reference/page-structure-census.json', JSON.stringify(byPath, null, 2))
  console.log(`census: ${records.length} baselines -> docs/reference/page-structure-census.json`)
}
main().catch((e) => { console.error(e); process.exit(1) })
