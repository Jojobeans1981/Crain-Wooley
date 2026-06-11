/*
 * Structured extractor for family-B interior pages. Produces a single ordered
 * `bands[]` model (intro / prose / accordion / closer) in DOM source order, so
 * the renderer reproduces the original's band interleaving (e.g. flat-rate:
 * intro+plan-accordions -> values(gold) -> FAQ(navy, expanded) -> testimonials
 * -> schedule). Also downloads the intro image into /public. The original is the
 * client's own site; this migrates its content + assets to the new site.
 *
 * Usage: npx tsx scripts/visual-diff/extract-family-b.ts /about-us/pricing/flat-rate-services/
 * Output: lib/legacy/family-b/pages.json (path-keyed)  +  public/interior/<slug>-intro.<ext>
 */
import { chromium } from 'playwright'
import { writeFileSync, mkdirSync, readFileSync, existsSync } from 'node:fs'

const ORIGIN = 'https://www.estateplanningdfw.law'

async function main() {
  const rawPath = process.argv[2]
  if (!rawPath) throw new Error('usage: extract-family-b.ts <path>')
  const key = '/' + rawPath.replace(/^\/+|\/+$/g, '')
  const slug = key.replace(/^\//, '').replace(/\//g, '__')

  // Reproducible + courteous: load the committed baseline HTML offline when it
  // exists (the live site is never re-hit for a captured URL); otherwise fetch
  // ONCE, save the baseline, then work from the DOM. Detection is structural.
  const capDir = `docs/reference/capture/${slug}/desktop`
  const capFile = `${capDir}/original.html`
  const b = await chromium.launch()
  const p = await b.newPage({ viewport: { width: 1440, height: 1000 } })
  let online = false
  if (existsSync(capFile)) {
    await p.route('**', (r) => r.abort())
    await p.setContent(readFileSync(capFile, 'utf8'), { waitUntil: 'commit', timeout: 20_000 }).catch(() => {})
    await p.waitForTimeout(200)
  } else {
    await p.goto(ORIGIN + key + '/', { waitUntil: 'load', timeout: 60_000 })
    await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 500) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 70)) } window.scrollTo(0, 0) })
    await p.waitForTimeout(1000)
    mkdirSync(capDir, { recursive: true })
    writeFileSync(capFile, await p.content())
    online = true
  }

  const data = await p.evaluate(() => {
    // Walk <main>'s top-level sections in DOM order; each yields zero or more
    // bands. Closer wrappers (#ImageGroupS1) NEST several closer feeds — collect
    // and order them per-section. FAQ Q&A is never inlined as prose (it would
    // duplicate the accordion and inflate the page); a section's intro prose is
    // only what PRECEDES its first accordion control.
    const mainEl = (document.querySelector('main') || document.body) as HTMLElement
    let bannerTitle = '', contentH1 = '', introImage = ''
    let bannerSearch = false, badgeStrip = false, firstContent = true
    type Block = { type: string; text?: string; items?: string[] }
    const bands: Record<string, unknown>[] = []

    for (const sec of Array.from(mainEl.children) as HTMLElement[]) {
      const stx = (sec.textContent || '').replace(/\s+/g, ' ')
      const cls = (sec.className?.toString() || '').toLowerCase()

      // Banner -> page title (not a band; rendered as the gold/navy banner).
      if (sec.tagName === 'FORM' || /^(Form_)?Banner/.test(sec.id) || /(^|\s)(bnr|banner)/.test(cls)) {
        if (!bannerTitle) { const h = sec.querySelector('.fnt_t-1, h1, h2, .h1, strong') as HTMLElement | null; if (h) bannerTitle = (h.textContent || '').replace(/\s+/g, ' ').trim().replace(/\bSearch\s*$/, '').trim() }
        if (sec.querySelector('[name*="SiteSearch"], input[type="search"]')) bannerSearch = true
        continue
      }
      // Badge strip (aws) / staff-LISTING bands -> not bands.
      if (/(^|\s)(aws|awards)/.test(cls)) { badgeStrip = true; continue }
      if (/(^|\s)(stf|staff)/.test(cls) && !/stf-pfl|profile/i.test(cls)) continue

      // Closer / closer-wrapper: collect the closer feeds inside this section in
      // document order, dedupe consecutive, emit closer bands.
      const cNodes: [string, Element][] = []
      sec.querySelectorAll('[id^="Reviews"], .rvw, blockquote.ato').forEach((e) => cNodes.push(['testimonials', e]))
      sec.querySelectorAll('#ValuesV2, .vls').forEach((e) => cNodes.push(['pillars', e]))
      sec.querySelectorAll('section[id^="CTAs"]').forEach((e) => { if (/Schedule a Consultation Today/i.test(e.textContent || '')) cNodes.push(['schedule', e]) })
      if (/(^|\s)vls(\s|$)/.test(cls)) cNodes.push(['pillars', sec])
      if (/(^|\s)cta(\s|$)/.test(cls) && /Schedule a Consultation Today/i.test(stx)) cNodes.push(['schedule', sec])
      if (cNodes.length) {
        cNodes.sort((a, b) => (a[1].compareDocumentPosition(b[1]) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1))
        let prev: string | null = null
        for (const c of cNodes) if (c[0] !== prev) { bands.push({ kind: 'closer', which: c[0] }); prev = c[0] }
        continue
      }
      // A non-schedule CTA strip (e.g. CTAsS7) is chrome — skip.
      if (/(^|\s)cta(\s|$)/.test(cls)) continue

      // Content / accordion section. Intro prose = blocks before the first
      // accordion control (the wrapper-aware boundary: strictly-precedes AND does
      // not contain the boundary).
      const faqBoundary = sec.querySelector('.qst, [aria-expanded], summary, [itemtype*="Question"]')
      let isIntro = false, secHeading = ''
      if (firstContent) {
        firstContent = false; isIntro = true
        const cz = (sec.querySelector('.cnt-zn') || sec) as HTMLElement
        const h = cz.querySelector('h1, h2, h3, h4') as HTMLElement | null
        if (h) { contentH1 = (h.textContent || '').replace(/\s+/g, ' ').trim(); secHeading = contentH1 }
        for (const im of Array.from(cz.querySelectorAll('img')) as HTMLImageElement[]) { const src = im.getAttribute('data-src') || im.getAttribute('data-lazy-src') || im.getAttribute('src') || im.src || ''; if (src && !/^data:|\.svg|logo|accolade|badge|bar-college|elder|naela|banner|icon|sprite/i.test(src)) { introImage = src; break } }
      }

      const blocks: Block[] = []
      for (const e of Array.from(sec.querySelectorAll('h2,h3,h4,p,ul,ol')) as HTMLElement[]) {
        if (e.closest('[aria-expanded], .qst, footer, nav, header, [itemtype*="Question"], .sd-zn') || (faqBoundary && (!(faqBoundary.compareDocumentPosition(e) & Node.DOCUMENT_POSITION_PRECEDING) || (faqBoundary.compareDocumentPosition(e) & Node.DOCUMENT_POSITION_CONTAINS)))) continue
        const tag = e.tagName.toLowerCase()
        if ((tag === 'p' || tag === 'li') && e.closest('ul, ol')) continue
        if ((tag === 'ul' || tag === 'ol') && e.parentElement && e.parentElement.closest('ul, ol')) continue
        const tx = (e.textContent || '').replace(/\s+/g, ' ').trim()
        if (tx.length <= 1 || tx === contentH1) continue
        if (tag === 'ul' || tag === 'ol') { const items = (Array.from(e.querySelectorAll('li')) as HTMLElement[]).filter((li) => !li.querySelector('ul, ol')).map((li) => (li.textContent || '').replace(/\s+/g, ' ').trim()).filter((s) => s.length > 0); if (items.length) blocks.push({ type: 'ul', items }) }
        else if (tag === 'h2') blocks.push({ type: 'h2', text: tx })
        else if (tag === 'h3' || tag === 'h4') blocks.push({ type: 'h3', text: tx })
        else blocks.push({ type: 'p', text: tx })
      }
      for (const e of Array.from(sec.querySelectorAll('article, blockquote, figcaption')) as HTMLElement[]) {
        if (e.closest('[aria-expanded], .qst, footer, nav, header, [itemtype*="Question"], .sd-zn') || (faqBoundary && (!(faqBoundary.compareDocumentPosition(e) & Node.DOCUMENT_POSITION_PRECEDING) || (faqBoundary.compareDocumentPosition(e) & Node.DOCUMENT_POSITION_CONTAINS)))) continue
        if (e.querySelector('p, h2, h3, h4, ul, ol')) continue
        const tx = (e.textContent || '').replace(/\s+/g, ' ').trim()
        if (tx.length >= 20 && tx !== contentH1) blocks.push({ type: 'p', text: tx })
      }
      for (const e of Array.from(sec.querySelectorAll('em, strong')) as HTMLElement[]) {
        if (e.closest('[aria-expanded], .qst, footer, nav, header, p, li, h1, h2, h3, h4, a, article, blockquote, figcaption, .sd-zn') || (faqBoundary && (!(faqBoundary.compareDocumentPosition(e) & Node.DOCUMENT_POSITION_PRECEDING) || (faqBoundary.compareDocumentPosition(e) & Node.DOCUMENT_POSITION_CONTAINS)))) continue
        const tx = (e.textContent || '').replace(/\s+/g, ' ').trim()
        if (tx.length >= 20 && tx !== contentH1) blocks.push({ type: 'p', text: tx })
      }
      for (const e of Array.from(sec.querySelectorAll('address')) as HTMLElement[]) {
        if (e.closest('[aria-expanded], .qst, footer, nav, header, [itemtype*="Question"], .sd-zn') || (faqBoundary && (!(faqBoundary.compareDocumentPosition(e) & Node.DOCUMENT_POSITION_PRECEDING) || (faqBoundary.compareDocumentPosition(e) & Node.DOCUMENT_POSITION_CONTAINS)))) continue
        const tx = (e.textContent || '').replace(/\s+/g, ' ').trim()
        if (tx.length >= 3 && tx !== contentH1) blocks.push({ type: 'p', text: tx })
      }
      const isProfile = /stf-pfl|profile/i.test(cls)
      for (const e of Array.from(sec.querySelectorAll('div')) as HTMLElement[]) {
        if (e.closest('[aria-expanded], .qst, footer, nav, header, [itemtype*="Question"], .sd-zn') || (faqBoundary && (!(faqBoundary.compareDocumentPosition(e) & Node.DOCUMENT_POSITION_PRECEDING) || (faqBoundary.compareDocumentPosition(e) & Node.DOCUMENT_POSITION_CONTAINS)))) continue
        if (e.querySelector('div, p, ul, ol, li, h1, h2, h3, h4, article, blockquote, figcaption, address')) continue
        const tx = (e.textContent || '').replace(/\s+/g, ' ').trim()
        const minLen = isProfile ? 4 : 30
        if (tx.length >= minLen && tx !== contentH1 && tx !== bannerTitle && !/^(About|Locations?|Contact|Search)$/i.test(tx)) blocks.push({ type: 'p', text: tx })
      }

      if (isIntro) bands.push({ kind: 'intro', heading: secHeading, blocks, image: introImage || null })
      else if (blocks.length) bands.push({ kind: 'prose', blocks })

      // Accordion bands (per-section, in order): plan accordions ([aria-expanded]/
      // <summary>) render COLLAPSED; FAQ (.qst slider / schema Question) renders
      // EXPANDED, as the original does. Expand state is the source signature.
      const seen = new Set<string>()
      const planItems: { title: string; body: string }[] = []
      for (const h of Array.from(sec.querySelectorAll('[aria-expanded], summary')) as HTMLElement[]) {
        const t = (h.textContent || '').replace(/\s+/g, ' ').trim()
        if (!t || t.length < 3 || t.length > 120 || seen.has(t) || /accessibility|skip to/i.test(t)) continue
        const ctl = h.getAttribute('aria-controls')
        let panel: HTMLElement | null = ctl ? document.getElementById(ctl) : (h.nextElementSibling as HTMLElement)
        if (!panel && h.parentElement) panel = h.parentElement.querySelector('[class*=body],[class*=panel],[class*=content]')
        planItems.push({ title: t, body: panel ? (panel.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 2000) : '' }); seen.add(t)
      }
      const faqItems: { title: string; body: string }[] = []
      for (const q of Array.from(sec.querySelectorAll('.qst, [class*=qst]')) as HTMLElement[]) {
        const t = (q.textContent || '').replace(/\s+/g, ' ').trim()
        if (!t || t.length < 8 || t.length > 160 || seen.has(t)) continue
        let panel = q.nextElementSibling as HTMLElement | null
        if (!panel || !(panel.textContent || '').trim()) panel = (q.parentElement?.querySelector('.ans, [class*=ans], [class*=answer], [class*=body], [class*=panel]') as HTMLElement | null)
        faqItems.push({ title: t, body: panel ? (panel.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 2000) : '' }); seen.add(t)
      }
      for (const q of Array.from(sec.querySelectorAll('[itemtype*="Question"]')) as HTMLElement[]) {
        const nameEl = q.querySelector('[itemprop="name"]') as HTMLElement | null
        const ansEl = q.querySelector('[itemprop="acceptedAnswer"] [itemprop="text"], [itemprop="text"]') as HTMLElement | null
        const t = (nameEl?.textContent || '').replace(/\s+/g, ' ').trim()
        if (!t || t.length < 5 || t.length > 200 || seen.has(t)) continue
        faqItems.push({ title: t, body: ansEl ? (ansEl.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 2000) : '' }); seen.add(t)
      }
      if (planItems.length) bands.push({ kind: 'accordion', instruction: 'Expand Each Section to Learn More', items: planItems, expanded: false })
      if (faqItems.length) {
        let fh = ''
        for (const e of Array.from(sec.querySelectorAll('h2,h3,h4,strong')) as HTMLElement[]) { const tx = (e.textContent || '').replace(/\s+/g, ' ').trim(); if (/Virtual Services FAQ|Frequently Asked|^FAQ$/i.test(tx) && tx.length < 60) { fh = tx; break } }
        bands.push({ kind: 'accordion', heading: fh || 'Virtual Services FAQ', items: faqItems, expanded: true })
      }
    }

    // Right-rail sidebar (sd-zn three-8ths): sibling-page nav, CTA cards, office.
    const sidebar: { kind: string; heading: string; links: { text: string; href: string }[] }[] = []
    const sdEl = document.querySelector('.sd-zn') as HTMLElement | null
    if (sdEl) {
      for (const aside of Array.from(sdEl.children) as HTMLElement[]) {
        const acls = (aside.className?.toString() || '').toLowerCase()
        const kind = /sd-nv|(^|\s)nav/.test(acls) ? 'nav' : /cta/.test(acls) ? 'cta' : 'block'
        const hEl = aside.querySelector('h1, h2, h3, h4, strong, .fnt_t-co, [class*=fnt_t]') as HTMLElement | null
        const heading = hEl ? (hEl.textContent || '').replace(/\s+/g, ' ').trim() : ''
        const links = (Array.from(aside.querySelectorAll('a')) as HTMLAnchorElement[]).map((a) => ({ text: (a.textContent || '').replace(/\s+/g, ' ').trim(), href: a.getAttribute('href') || '' })).filter((l) => l.text && l.text !== heading)
        if (heading || links.length) sidebar.push({ kind, heading, links })
      }
    }

    return { bannerTitle, contentH1, introImage, bannerSearch, badgeStrip, sidebar, bands }
  })

  // Intro image: resolve + download (online only); offline re-runs reuse the asset.
  let introImagePath = ''
  if (data.introImage) {
    const imgUrl = /^https?:/.test(data.introImage) ? data.introImage : ORIGIN + (data.introImage.startsWith('/') ? '' : '/') + data.introImage
    const ext = ((imgUrl.split('/').pop() || 'jpg').split('?')[0].split('.').pop() || 'jpg').slice(0, 4)
    const candidate = `/interior/${slug}-intro.${ext}`
    if (online) {
      const b64 = await p.evaluate(async (url) => {
        const r = await fetch(url); const buf = await r.arrayBuffer()
        let bin = ''; const bytes = new Uint8Array(buf); for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i])
        return btoa(bin)
      }, imgUrl)
      mkdirSync('public/interior', { recursive: true })
      writeFileSync('public' + candidate, Buffer.from(b64, 'base64'))
      introImagePath = candidate
    } else {
      for (const e of ['jpg', 'jpeg', 'png', 'webp', 'gif']) { if (existsSync(`public/interior/${slug}-intro.${e}`)) { introImagePath = `/interior/${slug}-intro.${e}`; break } }
    }
  }
  await b.close()

  // Resolve the intro band's image to the downloaded asset path.
  const bands = data.bands as Record<string, unknown>[]
  const intro = bands.find((bd) => bd.kind === 'intro')
  if (intro) intro.image = introImagePath || null

  // Legacy fields (derived) keep older non-refactored renderers + tooling working
  // and feed the console summary; the renderer prefers `bands` when present.
  const flow = bands.filter((bd) => bd.kind === 'intro' || bd.kind === 'prose')
  const bodyBlocks = flow.flatMap((bd) => (bd.blocks as unknown[]) || [])
  const accordionGroups = bands.filter((bd) => bd.kind === 'accordion').map((bd) => ({ heading: bd.heading, instruction: bd.instruction, items: bd.items, expanded: bd.expanded }))
  const closers = [...new Set(bands.filter((bd) => bd.kind === 'closer').map((bd) => bd.which as string))]

  const out = {
    path: key,
    bannerTitle: data.bannerTitle,
    contentH1: data.contentH1,
    introImage: introImagePath || null,
    bands,
    sidebar: data.sidebar,
    badgeStrip: data.badgeStrip,
    bannerSearch: data.bannerSearch,
    // legacy/back-compat:
    bodyBlocks,
    accordionGroups,
    closers,
  }
  mkdirSync('lib/legacy/family-b', { recursive: true })
  const idxFile = 'lib/legacy/family-b/pages.json'
  let pages: Record<string, unknown> = {}
  try { pages = JSON.parse(readFileSync(idxFile, 'utf8')) } catch { pages = {} }
  pages[key] = out
  const sorted = Object.fromEntries(Object.keys(pages).sort().map((k) => [k, pages[k]]))
  writeFileSync(idxFile, JSON.stringify(sorted, null, 2))
  const bandSummary = bands.map((bd) => bd.kind === 'closer' ? bd.which : bd.kind === 'accordion' ? (bd.expanded ? 'faq+' : 'acc') : bd.kind).join(' > ')
  console.log(`extracted ${key}: banner="${out.bannerTitle}" image=${introImagePath || 'none'} bands=[${bandSummary}]`)
}

main().catch((e) => { console.error(e); process.exit(1) })
