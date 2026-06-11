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
    // Section-based body capture (container signatures, not positions). Walk
    // <main>'s top-level sections in document order:
    //  - closer bands (pillars/testimonials/schedule: dk-bg vls/cta/img-grp, or the
    //    closer heading text) -> a {type:'closer'} marker, so the renderer re-inserts
    //    the shared component AT THE SAME position (mid-page interleaving = parity)
    //  - banner / awards (badges) / staff-listing bands -> skipped
    //  - content bands -> their full ordered blocks (h2/h3/p/ul); accordion panels
    //    are excluded (extracted separately). No position cutoff -> body after a
    //    mid-page closer band survives.
    const mainEl = (document.querySelector('main') || document.body) as HTMLElement
    const bodyBlocks: { type: string; text?: string; items?: string[]; which?: string }[] = []
    for (const sec of Array.from(mainEl.children) as HTMLElement[]) {
      const stx = (sec.textContent || '').replace(/\s+/g, ' ')
      const cls = (sec.className?.toString() || '').toLowerCase()
      if (/Estate Planning With Us Means|DESIGNED FOR YOUR COMFORT/i.test(stx) || /(^|\s)vls(\s|$)/.test(cls)) { bodyBlocks.push({ type: 'closer', which: 'pillars' }); continue }
      if (/Schedule a Consultation Today/i.test(stx) || /(^|\s)cta(\s|$)/.test(cls)) { bodyBlocks.push({ type: 'closer', which: 'schedule' }); continue }
      if (/What (Our|People)[^.]{0,30}Say|client testimonials|hear from our clients/i.test(stx) || /(^|\s)(rvw|tst|testim|review)/.test(cls)) { bodyBlocks.push({ type: 'closer', which: 'testimonials' }); continue }
      if (sec.tagName === 'FORM' || /^(Form_)?Banner/.test(sec.id) || /(^|\s)(bnr|banner|aws|awards|stf|staff)/.test(cls)) continue
      for (const e of Array.from(sec.querySelectorAll('h2,h3,h4,p,ul,ol')) as HTMLElement[]) {
        if (e.closest('[aria-expanded], .qst, footer, nav, header')) continue
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
    let faqHeading = ''
    for (const e of Array.from(document.querySelectorAll('h2,h3,h4,strong')) as HTMLElement[]) { const tx = (e.textContent || '').replace(/\s+/g, ' ').trim(); if (/Virtual Services FAQ|Frequently Asked|^FAQ$/i.test(tx) && tx.length < 60) { faqHeading = tx; break } }
    return { bannerTitle, contentH1, bodyBlocks, introImage, items, faqHeading }
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
