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
import { writeFileSync, mkdirSync, readFileSync } from 'node:fs'

const ORIGIN = 'https://www.estateplanningdfw.law'

async function main() {
  const rawPath = process.argv[2]
  if (!rawPath) throw new Error('usage: extract-family-b.ts <path>')
  const key = '/' + rawPath.replace(/^\/+|\/+$/g, '')
  const slug = key.replace(/^\//, '').replace(/\//g, '__')

  const b = await chromium.launch()
  const p = await b.newPage({ viewport: { width: 1440, height: 1000 } })
  await p.goto(ORIGIN + key + '/', { waitUntil: 'load', timeout: 60_000 })
  await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 500) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 70)) } window.scrollTo(0, 0) })
  await p.waitForTimeout(1000)

  const data = await p.evaluate(() => {
    const all = Array.from(document.querySelectorAll('*')) as HTMLElement[]
    // (no named helpers — esbuild wraps them in an undefined __name in page context)
    let band: HTMLElement | null = null
    for (const e of all) { const r = e.getBoundingClientRect(); if (r.width > 1300 && r.top > 100 && r.top < 700 && r.height > 150 && r.height < 360 && getComputedStyle(e).backgroundColor === 'rgb(155, 128, 89)') { band = e; break } }
    const bannerTitle = band ? (band.textContent || '').replace(/\s+/g, ' ').trim().replace(/Search$/, '').trim() : ''
    // content H1 — the original marks it as a large <h4> (~60px Cormorant), so
    // include h3/h4 and pick the first big heading in the content zone.
    let contentH1 = ''
    for (const h of Array.from(document.querySelectorAll('h1,h2,h3,h4,strong,.h1,[class*=heading]')) as HTMLElement[]) { const r = h.getBoundingClientRect(); const tx = (h.textContent || '').replace(/\s+/g, ' ').trim(); if (r.top > 480 && r.top < 1300 && parseFloat(getComputedStyle(h).fontSize) > 30 && tx.length > 6 && tx.length < 90) { contentH1 = tx; break } }
    let introImage = ''
    for (const i of Array.from(document.querySelectorAll('img')) as HTMLImageElement[]) { const r = i.getBoundingClientRect(); if (i.naturalWidth > 250 && i.naturalHeight > 250 && r.top > 480 && r.top < 1500 && !/logo|accolade|badge|bar-college|elder|naela|banner/i.test(i.src)) { introImage = i.src; break } }
    // Intro = body <p> between the banner and the first CONTENT accordion or closer
    // section. Bound only by content accordions BELOW the banner (a header/widget
    // [aria-expanded] near the top must not collapse the range), and by the closer
    // headings, so the footer + accordion panels are excluded.
    let bodyEnd = 99999
    for (const e of Array.from(document.querySelectorAll('[aria-expanded], .qst')) as HTMLElement[]) { if (e.tagName.toLowerCase() === 'svg') continue; if ((e.textContent || '').replace(/\s+/g, ' ').trim().length < 5) continue; const t = e.getBoundingClientRect().top; if (t > 480 && t < bodyEnd) bodyEnd = t }
    for (const e of Array.from(document.querySelectorAll('h2,h3,h4,strong,div,p,span')) as HTMLElement[]) { const tx = (e.textContent || '').replace(/\s+/g, ' '); const t = e.getBoundingClientRect().top; if (t > 480 && t < bodyEnd && e.children.length < 5 && /Estate Planning With Us Means|Schedule a Consultation Today|Expand Each Section|Virtual Services FAQ/i.test(tx)) bodyEnd = t }
    // Full ordered body: every paragraph, sub-heading, and list between the
    // banner and the first accordion/closer — page for page, no truncation.
    const blockEls = (Array.from(document.querySelectorAll('h2,h3,h4,p,ul,ol')) as HTMLElement[]).filter((e) => {
      const r = e.getBoundingClientRect()
      if (!(r.top > 480 && r.top < bodyEnd)) return false
      if (e.closest('[aria-expanded], .qst, footer, nav, header')) return false
      const tag = e.tagName.toLowerCase()
      if ((tag === 'p' || tag === 'li') && e.closest('ul, ol')) return false // captured via the list
      if ((tag === 'ul' || tag === 'ol') && e.parentElement && e.parentElement.closest('ul, ol')) return false // nested
      return (e.textContent || '').replace(/\s+/g, ' ').trim().length > 1
    })
    const bodyBlocks = blockEls.map((e) => {
      const tag = e.tagName.toLowerCase()
      const tx = (e.textContent || '').replace(/\s+/g, ' ').trim()
      if (tag === 'ul' || tag === 'ol') return { type: 'ul', items: (Array.from(e.querySelectorAll('li')) as HTMLElement[]).filter((li) => !li.querySelector('ul, ol')).map((li) => (li.textContent || '').replace(/\s+/g, ' ').trim()).filter((s) => s.length > 0) }
      if (tag === 'h2') return { type: 'h2', text: tx }
      if (tag === 'h3' || tag === 'h4') return { type: 'h3', text: tx }
      return { type: 'p', text: tx }
    }).filter((blk) => ('items' in blk ? blk.items.length > 0 : (blk.text || '').length > 1))
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
    let faqHeading = ''
    for (const e of Array.from(document.querySelectorAll('h2,h3,h4,strong')) as HTMLElement[]) { const tx = (e.textContent || '').replace(/\s+/g, ' ').trim(); if (/Virtual Services FAQ|Frequently Asked|^FAQ$/i.test(tx) && tx.length < 60) { faqHeading = tx; break } }
    const closers = {
      pillars: !!all.find((e) => /Estate Planning With Us Means/i.test(e.textContent || '')),
      testimonials: !!all.find((e) => /Schedule a Consultation|What Our Clients|Testimonial/i.test(e.textContent || '')) || document.querySelectorAll('[class*=review]').length > 0,
      schedule: !!all.find((e) => /Schedule a Consultation Today/i.test(e.textContent || '')),
    }
    return { bannerTitle, contentH1, bodyBlocks, introImage, items, faqHeading, closers }
  })

  // download the intro image via in-page fetch (browser networking bypasses the bot-block)
  let introImagePath = ''
  if (data.introImage) {
    const ext = (data.introImage.split('.').pop() || 'jpg').split('?')[0].slice(0, 4)
    const b64 = await p.evaluate(async (url) => {
      const r = await fetch(url); const buf = await r.arrayBuffer()
      let bin = ''; const bytes = new Uint8Array(buf); for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i])
      return btoa(bin)
    }, data.introImage)
    mkdirSync('public/interior', { recursive: true })
    introImagePath = `/interior/${slug}-intro.${ext}`
    writeFileSync('public' + introImagePath, Buffer.from(b64, 'base64'))
  }
  await b.close()

  // split accordion items by source group: plans (aria-expanded) vs FAQ (.qst)
  const plans = data.items.filter((i) => i.group === 'plans').sort((a, b) => a.top - b.top).map(({ title, body }) => ({ title, body }))
  const faq = data.items.filter((i) => i.group === 'faq').sort((a, b) => a.top - b.top).map(({ title, body }) => ({ title, body }))
  const closers = [data.closers.pillars && 'pillars', data.closers.testimonials && 'testimonials', data.closers.schedule && 'schedule'].filter(Boolean)

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
