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
import { writeFileSync, mkdirSync } from 'node:fs'

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
    let contentH1 = ''
    for (const h of Array.from(document.querySelectorAll('h1,h2,strong,.h1,[class*=heading]')) as HTMLElement[]) { const r = h.getBoundingClientRect(); const tx = (h.textContent || '').replace(/\s+/g, ' ').trim(); if (r.top > 480 && r.top < 1100 && parseFloat(getComputedStyle(h).fontSize) > 26 && tx.length > 6) { contentH1 = tx; break } }
    let introImage = ''
    for (const i of Array.from(document.querySelectorAll('img')) as HTMLImageElement[]) { const r = i.getBoundingClientRect(); if (i.naturalWidth > 250 && i.naturalHeight > 250 && r.top > 480 && r.top < 1500 && !/logo|accolade|badge|bar-college|elder|naela|banner/i.test(i.src)) { introImage = i.src; break } }
    const firstAcc = (document.querySelector('[aria-expanded]') as HTMLElement | null)?.getBoundingClientRect().top ?? 99999
    const introBody = (Array.from(document.querySelectorAll('p')) as HTMLElement[]).filter((e) => { const r = e.getBoundingClientRect(); return r.top > 480 && r.top < firstAcc && (e.textContent || '').replace(/\s+/g, ' ').trim().length > 40 }).map((e) => (e.textContent || '').replace(/\s+/g, ' ').trim()).slice(0, 8)
    const items: { title: string; body: string; top: number }[] = []
    const seen = new Set<string>()
    for (const h of Array.from(document.querySelectorAll('[aria-expanded], summary')) as HTMLElement[]) {
      const t = (h.textContent || '').replace(/\s+/g, ' ').trim()
      if (!t || t.length < 3 || t.length > 120 || seen.has(t) || /accessibility|skip to/i.test(t)) continue
      const ctl = h.getAttribute('aria-controls')
      let panel: HTMLElement | null = ctl ? document.getElementById(ctl) : (h.nextElementSibling as HTMLElement)
      if (!panel && h.parentElement) panel = h.parentElement.querySelector('[class*=body],[class*=panel],[class*=content]')
      items.push({ title: t, body: panel ? (panel.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 2000) : '', top: Math.round(h.getBoundingClientRect().top) })
      seen.add(t)
    }
    let faqHeadingTop = 99999
    for (const e of Array.from(document.querySelectorAll('h2,h3,strong')) as HTMLElement[]) { if (/FAQ|Frequently Asked/i.test((e.textContent || '').replace(/\s+/g, ' '))) { faqHeadingTop = e.getBoundingClientRect().top; break } }
    const closers = {
      pillars: !!all.find((e) => /Estate Planning With Us Means/i.test(e.textContent || '')),
      testimonials: !!all.find((e) => /Schedule a Consultation|What Our Clients|Testimonial/i.test(e.textContent || '')) || document.querySelectorAll('[class*=review]').length > 0,
      schedule: !!all.find((e) => /Schedule a Consultation Today/i.test(e.textContent || '')),
    }
    return { bannerTitle, contentH1, introBody, introImage, items, faqHeadingTop, closers }
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

  // split accordion items into groups: plans (before FAQ heading) vs FAQ (after)
  const plans = data.items.filter((i) => i.top < data.faqHeadingTop).map(({ title, body }) => ({ title, body }))
  const faq = data.items.filter((i) => i.top >= data.faqHeadingTop).map(({ title, body }) => ({ title, body }))
  const closers = [data.closers.pillars && 'pillars', data.closers.testimonials && 'testimonials', data.closers.schedule && 'schedule'].filter(Boolean)

  const out = {
    path: key,
    bannerTitle: data.bannerTitle,
    contentH1: data.contentH1,
    introBody: data.introBody,
    introImage: introImagePath || null,
    accordionGroups: [
      ...(plans.length ? [{ instruction: 'Expand Each Section to Learn More', items: plans }] : []),
      ...(faq.length ? [{ heading: 'Virtual Services FAQ', items: faq }] : []),
    ],
    closers,
  }
  mkdirSync('lib/legacy/family-b', { recursive: true })
  writeFileSync(`lib/legacy/family-b/${slug}.json`, JSON.stringify(out, null, 2))
  console.log(`extracted ${key}: banner="${out.bannerTitle}" h1="${out.contentH1}" introPara=${out.introBody.length} image=${introImagePath || 'none'} planAcc=${plans.length} faqAcc=${faq.length} closers=[${closers.join(',')}]`)
}

main().catch((e) => { console.error(e); process.exit(1) })
