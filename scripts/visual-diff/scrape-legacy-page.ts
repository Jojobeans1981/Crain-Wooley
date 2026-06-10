/*
 * Port a single page from the live original into lib/legacy/legacy-pages.json,
 * the same shape the rest of the legacy crawl uses. The original is the client's
 * own site; this migrates their content to their new site so the URL keeps
 * resolving as a real 200 with correct metadata at cutover.
 *
 * Usage: npx tsx scripts/visual-diff/scrape-legacy-page.ts /fort-worth/minor-trusts/ location
 */
import { chromium } from 'playwright'
import { readFileSync, writeFileSync } from 'node:fs'

const ORIGIN = 'https://www.estateplanningdfw.law'
const FILE = 'lib/legacy/legacy-pages.json'

async function main() {
  const rawPath = process.argv[2]
  const type = process.argv[3] || 'page'
  if (!rawPath) throw new Error('usage: scrape-legacy-page.ts <path> [type]')
  const key = '/' + rawPath.replace(/^\/+|\/+$/g, '')
  const url = ORIGIN + key + '/'

  const browser = await chromium.launch()
  const page = await browser.newPage({ userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/124 Safari/537.36' } as any)
  await page.goto(url, { waitUntil: 'load', timeout: 60_000 })
  const extracted = await page.evaluate(() => {
    // No named helpers here — esbuild wraps named functions/const-arrows in a
    // __name() call that is undefined in the page context.
    const metaDesc = (document.querySelector('meta[name="description"]') as HTMLMetaElement)?.content || ''
    // Isolate the main content: clone body, drop chrome, read innerText.
    const clone = document.body.cloneNode(true) as HTMLElement
    clone.querySelectorAll('header,nav,footer,script,style,noscript,aside,form,iframe,svg,.cw-footer,[role="navigation"],[aria-label="breadcrumb"]').forEach((n) => n.remove())
    const main = (clone.querySelector('main') as HTMLElement) || clone
    const body = (main.innerText || '').replace(/\n{3,}/g, '\n\n').trim()
    const h1el = document.querySelector('main h1') || document.querySelector('h1')
    return {
      title: document.title.trim(),
      description: metaDesc.trim(),
      h1: (h1el?.textContent || '').replace(/\s+/g, ' ').trim(),
      h2s: Array.from(document.querySelectorAll('main h2')).map((h) => (h.textContent || '').replace(/\s+/g, ' ').trim()).filter(Boolean),
      h3s: Array.from(document.querySelectorAll('main h3')).map((h) => (h.textContent || '').replace(/\s+/g, ' ').trim()).filter(Boolean),
      body,
    }
  })
  await browser.close()

  const entry = {
    title: extracted.title,
    description: extracted.description,
    h1: extracted.h1,
    h2s: extracted.h2s,
    h3s: extracted.h3s,
    type,
    words: extracted.body.split(/\s+/).filter(Boolean).length,
    body: extracted.body,
  }

  const data = JSON.parse(readFileSync(FILE, 'utf8')) as Record<string, unknown>
  const existed = key in data
  data[key] = entry
  // Match the file's existing format exactly: single-line minified JSON, no
  // trailing newline, insertion order preserved (new key appended last).
  writeFileSync(FILE, JSON.stringify(data), 'utf8')
  console.log(`${existed ? 'updated' : 'added'} ${key} (type=${type}, ${entry.words} words, ${entry.h2s.length} h2 / ${entry.h3s.length} h3)`)
  console.log(`  title: ${entry.title}`)
  console.log(`  desc : ${entry.description.slice(0, 90)}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
