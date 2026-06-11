/*
 * Structured extractor for family-B interior pages (gold banner + two-column
 * intro + accordion groups + shared closers). Scrapes the original into a
 * structured JSON model the FamilyB template renders, and downloads the intro
 * image into /public. The original is the client's own site; this migrates its
 * content + assets to the new site (same first-party pattern as the legacy crawl).
 *
 * Usage: npx tsx scripts/visual-diff/extract-family-b.ts /about-us/pricing/flat-rate-services/
 * Output: lib/legacy/family-b/<slug>.json  +  public/interior/<slug>-intro.<ext>
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
  // ONCE, save the baseline, then work from the DOM. Detection is structural
  // (section/class signatures), so it does not need live CSS/layout.
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
    // Single structural pass over <main>'s top-level sections (container/class
    // signatures, NOT live positions/styles — so it runs on the offline baseline
    // DOM too). Each band is classified once:
    //  - closer (pillars/testimonials/schedule: dk-bg vls/cta/img-grp, or closer
    //    heading text) -> {type:'closer'} marker, re-inserted by the renderer in
    //    source order (interleaving = layout parity)
    //  - banner (form/bnr) -> page title; awards/staff -> skipped
    //  - first content band -> contentH1 (first heading) + intro photo (first
    //    non-logo img); every content band -> full ordered blocks (h2/h3/p/ul),
    //    accordion panels excluded (extracted separately). No position cutoff.
    const mainEl = (document.querySelector('main') || document.body) as HTMLElement
    let bannerTitle = ''
    let contentH1 = ''
    let introImage = ''
    let firstContent = true
    const bodyBlocks: { type: string; text?: string; items?: string[]; which?: string }[] = []
    for (const sec of Array.from(mainEl.children) as HTMLElement[]) {
      const stx = (sec.textContent || '').replace(/\s+/g, ' ')
      const cls = (sec.className?.toString() || '').toLowerCase()
      if (/Estate Planning With Us Means|DESIGNED FOR YOUR COMFORT/i.test(stx) || /(^|\s)vls(\s|$)/.test(cls)) { bodyBlocks.push({ type: 'closer', which: 'pillars' }); continue }
      if (/Schedule a Consultation Today/i.test(stx) || /(^|\s)cta(\s|$)/.test(cls)) { bodyBlocks.push({ type: 'closer', which: 'schedule' }); continue }
      if (/What (Our|People)[^.]{0,30}Say|client testimonials|hear from our clients/i.test(stx) || /(^|\s)(rvw|tst|testim|review)/.test(cls)) { bodyBlocks.push({ type: 'closer', which: 'testimonials' }); continue }
      if (sec.tagName === 'FORM' || /^(Form_)?Banner/.test(sec.id) || /(^|\s)(bnr|banner)/.test(cls)) {
        if (!bannerTitle) { const h = sec.querySelector('.fnt_t-1, h1, h2, .h1, strong') as HTMLElement | null; if (h) bannerTitle = (h.textContent || '').replace(/\s+/g, ' ').trim().replace(/\bSearch\s*$/, '').trim() }
        continue
      }
      // Skip awards (badges) and staff-LISTING bands — but NOT a staff PROFILE band
      // (stf-pfl), which is the bio content on /staff-profiles/<name> pages.
      if (/(^|\s)(aws|awards)/.test(cls) || (/(^|\s)(stf|staff)/.test(cls) && !/stf-pfl|profile/i.test(cls))) continue
      if (firstContent) {
        firstContent = false
        const cz = (sec.querySelector('.cnt-zn') || sec) as HTMLElement // content zone, not the sd-zn sidebar
        const h = cz.querySelector('h1, h2, h3, h4') as HTMLElement | null
        if (h) contentH1 = (h.textContent || '').replace(/\s+/g, ' ').trim()
        for (const i of Array.from(cz.querySelectorAll('img')) as HTMLImageElement[]) { const src = i.getAttribute('data-src') || i.getAttribute('data-lazy-src') || i.getAttribute('src') || i.src || ''; if (src && !/^data:|\.svg|logo|accolade|badge|bar-college|elder|naela|banner|icon|sprite/i.test(src)) { introImage = src; break } }
      }
      for (const e of Array.from(sec.querySelectorAll('h2,h3,h4,p,ul,ol')) as HTMLElement[]) {
        if (e.closest('[aria-expanded], .qst, footer, nav, header, [itemtype*="Question"], .sd-zn')) continue
        const tag = e.tagName.toLowerCase()
        if ((tag === 'p' || tag === 'li') && e.closest('ul, ol')) continue
        if ((tag === 'ul' || tag === 'ol') && e.parentElement && e.parentElement.closest('ul, ol')) continue
        const tx = (e.textContent || '').replace(/\s+/g, ' ').trim()
        if (tx.length <= 1 || tx === contentH1) continue
        if (tag === 'ul' || tag === 'ol') { const items = (Array.from(e.querySelectorAll('li')) as HTMLElement[]).filter((li) => !li.querySelector('ul, ol')).map((li) => (li.textContent || '').replace(/\s+/g, ' ').trim()).filter((s) => s.length > 0); if (items.length) bodyBlocks.push({ type: 'ul', items }) }
        else if (tag === 'h2') bodyBlocks.push({ type: 'h2', text: tx })
        else if (tag === 'h3' || tag === 'h4') bodyBlocks.push({ type: 'h3', text: tx })
        else bodyBlocks.push({ type: 'p', text: tx })
      }
      // Orphan prose the h/p/ul selector misses: (a) block prose in <article>/
      // <blockquote>/<figcaption> with no inner block (firm-video descriptions);
      // (b) the download-guide widget's heading <strong> + blurb <em> sitting
      // directly in a <div>. Short runs (buttons, bylines) are left out.
      for (const e of Array.from(sec.querySelectorAll('article, blockquote, figcaption')) as HTMLElement[]) {
        if (e.closest('[aria-expanded], .qst, footer, nav, header, [itemtype*="Question"], .sd-zn')) continue
        if (e.querySelector('p, h2, h3, h4, ul, ol')) continue
        const tx = (e.textContent || '').replace(/\s+/g, ' ').trim()
        if (tx.length >= 20 && tx !== contentH1) bodyBlocks.push({ type: 'p', text: tx })
      }
      for (const e of Array.from(sec.querySelectorAll('em, strong')) as HTMLElement[]) {
        if (e.closest('[aria-expanded], .qst, footer, nav, header, p, li, h1, h2, h3, h4, a, article, blockquote, figcaption, .sd-zn')) continue
        const tx = (e.textContent || '').replace(/\s+/g, ' ').trim()
        if (tx.length >= 20 && tx !== contentH1) bodyBlocks.push({ type: 'p', text: tx })
      }
      // Bylines / datelines ('By Crain & Wooley') on media-center video/radio pages.
      for (const e of Array.from(sec.querySelectorAll('address')) as HTMLElement[]) {
        if (e.closest('[aria-expanded], .qst, footer, nav, header, [itemtype*="Question"], .sd-zn')) continue
        const tx = (e.textContent || '').replace(/\s+/g, ' ').trim()
        if (tx.length >= 3 && tx !== contentH1) bodyBlocks.push({ type: 'p', text: tx })
      }
      // Prose authored straight into a bare <div> (no <p> wrapper) — a "prose div"
      // is a leaf block (no block-level child; inline spans/links OK) holding its
      // own text. >=30 chars keeps out UI labels/counters; closer/accordion/nav
      // are already excluded. textContent (not just direct text) so inline-wrapped
      // prose ('<div>...<span>...</span></div>') is captured too.
      for (const e of Array.from(sec.querySelectorAll('div')) as HTMLElement[]) {
        if (e.closest('[aria-expanded], .qst, footer, nav, header, [itemtype*="Question"], .sd-zn')) continue
        if (e.querySelector('div, p, ul, ol, li, h1, h2, h3, h4, article, blockquote, figcaption, address')) continue
        const tx = (e.textContent || '').replace(/\s+/g, ' ').trim()
        // On staff PROFILE bands the role/title + office labels sit in short leaves
        // (e.g. 'Senior Attorney'); capture them too. The name is the banner title,
        // so skip it (avoids a duplicate). Section labels are skipped.
        const isProfile = /stf-pfl|profile/i.test(cls)
        const minLen = isProfile ? 4 : 30
        if (tx.length >= minLen && tx !== contentH1 && tx !== bannerTitle && !/^(About|Locations?|Contact|Search)$/i.test(tx)) bodyBlocks.push({ type: 'p', text: tx })
      }
    }
    const items: { title: string; body: string; top: number; group: string }[] = []
    const seen = new Set<string>()
    // Plan accordions use [aria-expanded]/<summary>; their panel is aria-controlled.
    for (const h of Array.from(document.querySelectorAll('[aria-expanded], summary')) as HTMLElement[]) {
      const t = (h.textContent || '').replace(/\s+/g, ' ').trim()
      if (!t || t.length < 3 || t.length > 120 || seen.has(t) || /accessibility|skip to/i.test(t)) continue
      const ctl = h.getAttribute('aria-controls')
      let panel: HTMLElement | null = ctl ? document.getElementById(ctl) : (h.nextElementSibling as HTMLElement)
      if (!panel && h.parentElement) panel = h.parentElement.querySelector('[class*=body],[class*=panel],[class*=content]')
      items.push({ title: t, body: panel ? (panel.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 2000) : '', top: Math.round(h.getBoundingClientRect().top), group: 'plans' })
      seen.add(t)
    }
    // FAQ uses Scorpion .qst question rows; the answer is the sibling/parent panel.
    for (const q of Array.from(document.querySelectorAll('.qst, [class*=qst]')) as HTMLElement[]) {
      const t = (q.textContent || '').replace(/\s+/g, ' ').trim()
      if (!t || t.length < 8 || t.length > 160 || seen.has(t)) continue
      let panel = q.nextElementSibling as HTMLElement | null
      if (!panel || !(panel.textContent || '').trim()) panel = (q.parentElement?.querySelector('.ans, [class*=ans], [class*=answer], [class*=body], [class*=panel]') as HTMLElement | null)
      items.push({ title: t, body: panel ? (panel.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 2000) : '', top: Math.round(q.getBoundingClientRect().top), group: 'faq' })
      seen.add(t)
    }
    // schema.org FAQ (microdata Question/Answer, no .qst class): question is
    // [itemprop=name], answer is [itemprop=text] inside acceptedAnswer.
    for (const q of Array.from(document.querySelectorAll('[itemtype*="Question"]')) as HTMLElement[]) {
      const nameEl = q.querySelector('[itemprop="name"]') as HTMLElement | null
      const ansEl = q.querySelector('[itemprop="acceptedAnswer"] [itemprop="text"], [itemprop="text"]') as HTMLElement | null
      const t = (nameEl?.textContent || '').replace(/\s+/g, ' ').trim()
      if (!t || t.length < 5 || t.length > 200 || seen.has(t)) continue
      items.push({ title: t, body: ansEl ? (ansEl.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 2000) : '', top: Math.round(q.getBoundingClientRect().top), group: 'faq' })
      seen.add(t)
    }
    let faqHeading = ''
    for (const e of Array.from(document.querySelectorAll('h2,h3,h4,strong')) as HTMLElement[]) { const tx = (e.textContent || '').replace(/\s+/g, ' ').trim(); if (/Virtual Services FAQ|Frequently Asked|^FAQ$/i.test(tx) && tx.length < 60) { faqHeading = tx; break } }

    // Sidebar (sd-zn three-8ths): the right-rail <aside> blocks — sibling-page nav
    // (sd-nv), CTA cards (sd-cta, e.g. download-guide), office/contact. Captured as
    // structured blocks the renderer reproduces; links render as-is (relative).
    const sdEl = document.querySelector('.sd-zn') as HTMLElement | null
    const sidebar: { kind: string; heading: string; links: { text: string; href: string }[] }[] = []
    if (sdEl) {
      for (const aside of Array.from(sdEl.children) as HTMLElement[]) {
        const cls = (aside.className?.toString() || '').toLowerCase()
        const kind = /sd-nv|(^|\s)nav/.test(cls) ? 'nav' : /cta/.test(cls) ? 'cta' : 'block'
        const hEl = aside.querySelector('h1, h2, h3, h4, strong, .fnt_t-co, [class*=fnt_t]') as HTMLElement | null
        const heading = hEl ? (hEl.textContent || '').replace(/\s+/g, ' ').trim() : ''
        const links = (Array.from(aside.querySelectorAll('a')) as HTMLAnchorElement[]).map((a) => ({ text: (a.textContent || '').replace(/\s+/g, ' ').trim(), href: a.getAttribute('href') || '' })).filter((l) => l.text && l.text !== heading)
        if (heading || links.length) sidebar.push({ kind, heading, links })
      }
    }
    return { bannerTitle, contentH1, bodyBlocks, introImage, items, faqHeading, sidebar }
  })

  // Intro image: resolve to absolute, download via in-page fetch (browser
  // networking bypasses the bot-block) ONLY when online. Offline re-runs reuse the
  // asset captured on the original live run — the site is never re-hit.
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

  // split accordion items by source group: plans (aria-expanded) vs FAQ (.qst)
  const plans = data.items.filter((i) => i.group === 'plans').sort((a, b) => a.top - b.top).map(({ title, body }) => ({ title, body }))
  const faq = data.items.filter((i) => i.group === 'faq').sort((a, b) => a.top - b.top).map(({ title, body }) => ({ title, body }))
  // closers list = the section-walk markers, deduped in source order (authoritative;
  // the renderer reads the in-body markers and uses this only as a fallback).
  const closers = [...new Set(data.bodyBlocks.filter((b) => b.type === 'closer').map((b) => b.which as string))]

  const out = {
    path: key,
    bannerTitle: data.bannerTitle,
    contentH1: data.contentH1,
    bodyBlocks: data.bodyBlocks,
    introImage: introImagePath || null,
    accordionGroups: [
      ...(plans.length ? [{ instruction: 'Expand Each Section to Learn More', items: plans }] : []),
      ...(faq.length ? [{ heading: data.faqHeading || 'Virtual Services FAQ', items: faq }] : []),
    ],
    sidebar: data.sidebar,
    closers,
  }
  // Upsert into one combined keyed file so the rollout needs no per-page import.
  mkdirSync('lib/legacy/family-b', { recursive: true })
  const idxFile = 'lib/legacy/family-b/pages.json'
  let pages: Record<string, unknown> = {}
  try { pages = JSON.parse(readFileSync(idxFile, 'utf8')) } catch { pages = {} }
  pages[key] = out
  const sorted = Object.fromEntries(Object.keys(pages).sort().map((k) => [k, pages[k]]))
  writeFileSync(idxFile, JSON.stringify(sorted, null, 2))
  console.log(`extracted ${key}: banner="${out.bannerTitle}" h1="${out.contentH1}" blocks=${out.bodyBlocks.length} image=${introImagePath || 'none'} planAcc=${plans.length} faqAcc=${faq.length} closers=[${closers.join(',')}]`)
}

main().catch((e) => { console.error(e); process.exit(1) })
