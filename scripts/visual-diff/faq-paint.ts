/*
 * FAQ painted-gold-bar detector + poll. Structure-agnostic: the clone paints its gold
 * via .cw-faqbar { background:#9B8059 }; the original paints the SAME gold
 * (rgb(155,128,89)) as a background-color on its Scorpion ui-repeater rows, applied only
 * after the slider JS hydrates — so fast captures screenshot a blank (navy) band. Rather
 * than match either DOM shape, we count the GOLD BARS IN THE RENDERED PIXELS: scan rows,
 * mark a row "gold" when most of its width is the gold tone, and count contiguous gold
 * runs. That is the literal "has it painted 20 bars" check the gate needs.
 */
import type { Page } from 'playwright'
import { PNG } from 'pngjs'

const GOLD = { r: 155, g: 128, b: 89 }
const TOL = 26 // #9B8059 ± tolerance (covers AA + the orig's near-identical tone)

function isGold(r: number, g: number, b: number): boolean {
  return Math.abs(r - GOLD.r) < TOL && Math.abs(g - GOLD.g) < TOL && Math.abs(b - GOLD.b) < TOL
}

/**
 * Count contiguous horizontal gold bands in a band screenshot (each run = one bar).
 * Samples the full band width: a collapsed gold bar fills most of its width (the
 * left-aligned white question text + right chevron cover <40%), so a gold-bar row reads
 * well above the 0.4 threshold, while inter-bar gaps (navy) and any white answer-panel
 * read ~0. NOTE: the CALLER must de-stick the site header before screenshotting (the
 * clone's sticky header otherwise floats over mid-band bars and reads as a gap) — the
 * band-gate prep already does this.
 */
export function countGoldBars(buf: Buffer): number {
  const png = PNG.sync.read(buf)
  const { width, height, data } = png
  let bars = 0
  let inBar = false
  let runRows = 0
  for (let y = 0; y < height; y++) {
    let gold = 0, n = 0
    for (let x = 0; x < width; x += 4) {
      const i = (width * y + x) << 2
      if (isGold(data[i], data[i + 1], data[i + 2])) gold++
      n++
    }
    const rowIsGold = gold / n > 0.4
    if (rowIsGold) {
      runRows++
      if (!inBar && runRows >= 6) { bars++; inBar = true } // ≥6px tall → a real bar, not AA
    } else {
      inBar = false
      runRows = 0
    }
  }
  return bars
}

/**
 * Force-reveal + force-load lazy assets, then poll a band's screenshot until it has
 * painted `expected` gold bars (or maxMs elapses). Returns the final painted count.
 * Dispatches scroll/resize/load so IntersectionObserver-driven lazy hydration fires.
 */
export async function pollFaqBars(
  pg: Page,
  bandSel: string,
  expected = 20,
  maxMs = 12_000,
): Promise<number> {
  const loc = pg.locator(bandSel).first()
  const deadline = Date.now() + maxMs
  let last = 0
  // nudge any IntersectionObserver / repeater hydration
  await pg.evaluate(() => {
    document.querySelectorAll('img[data-src], source[data-src]').forEach((e) => {
      const s = e.getAttribute('data-src'); if (s) { e.setAttribute('src', s); if (e.tagName === 'SOURCE') e.setAttribute('srcset', s) }
    })
    window.dispatchEvent(new Event('scroll')); window.dispatchEvent(new Event('resize'))
  }).catch(() => {})
  // a settle loop driven by the painted count, NOT a fixed timer
  // (Date.now is unavailable inside workflow scripts but this is a plain tsx script)
  for (let i = 0; Date.now() < deadline; i++) {
    await loc.scrollIntoViewIfNeeded().catch(() => {})
    let buf: Buffer
    try { buf = (await loc.screenshot()) as Buffer } catch { await pg.waitForTimeout(400); continue }
    last = countGoldBars(buf)
    if (last >= expected) return last
    await pg.waitForTimeout(400)
  }
  return last
}
