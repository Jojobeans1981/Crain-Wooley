/*
 * Phase 0 diff rig.
 *
 * Pixelmatch overlay of original-vs-clone per route per viewport. Reads the PNGs
 * written by capture.ts, paints out masked regions (masks.json) on BOTH sides,
 * compares on the common width to the min common height, and writes:
 *   - docs/reference/diff-report.json      machine-readable per-page diff %
 *   - diff-report/index.html               side-by-side + overlay QA artifact
 *   - diff-report/{slug}/{viewport}.diff.png   overlay images
 *
 * A page "passes" at < TOLERANCE (1%) changed pixels with masks applied.
 *
 * Usage: npx tsx scripts/visual-diff/diff.ts
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, copyFileSync } from 'node:fs'
import { join } from 'node:path'
import { PNG } from 'pngjs'
import pixelmatch from 'pixelmatch'
import {
  ROUTES,
  VIEWPORTS,
  slugFor,
  CAPTURE_ROOT,
  DIFF_REPORT_JSON,
  DIFF_REPORT_HTML_DIR,
  MASKS_FILE,
} from './routes.config'

const TOLERANCE = 0.01 // 1%

type Rect = { x: number; y: number; w: number; h: number; viewports?: string[]; note?: string }
type MasksFile = { global?: Rect[]; routes?: Record<string, Rect[]> }

function loadMasks(): MasksFile {
  try {
    return JSON.parse(readFileSync(MASKS_FILE, 'utf8'))
  } catch {
    return {}
  }
}

function masksFor(masks: MasksFile, path: string, viewport: string): Rect[] {
  const all = [...(masks.global || []), ...((masks.routes || {})[path] || [])]
  return all.filter((r) => !r.viewports || r.viewports.includes(viewport))
}

// Paint a solid color over masked rects so they never count as diff.
function applyMasks(png: PNG, rects: Rect[]) {
  for (const r of rects) {
    for (let y = r.y; y < r.y + r.h && y < png.height; y++) {
      for (let x = r.x; x < r.x + r.w && x < png.width; x++) {
        if (x < 0 || y < 0) continue
        const idx = (png.width * y + x) << 2
        png.data[idx] = 0
        png.data[idx + 1] = 0
        png.data[idx + 2] = 0
        png.data[idx + 3] = 255
      }
    }
  }
}

// Crop/pad a PNG to target dimensions (top-left anchored) so both sides match.
function fit(src: PNG, w: number, h: number): PNG {
  const out = new PNG({ width: w, height: h })
  out.data.fill(255)
  for (let y = 0; y < Math.min(h, src.height); y++) {
    for (let x = 0; x < Math.min(w, src.width); x++) {
      const si = (src.width * y + x) << 2
      const di = (w * y + x) << 2
      out.data[di] = src.data[si]
      out.data[di + 1] = src.data[si + 1]
      out.data[di + 2] = src.data[si + 2]
      out.data[di + 3] = src.data[si + 3]
    }
  }
  return out
}

type PageResult = {
  path: string
  template: string
  viewport: string
  diffPct: number | null
  pass: boolean | null
  width: number
  height: number
  overlay: string | null
  note?: string
}

function main() {
  const masks = loadMasks()
  mkdirSync(DIFF_REPORT_HTML_DIR, { recursive: true })
  const results: PageResult[] = []

  for (const route of ROUTES) {
    const slug = slugFor(route.path)
    for (const vp of VIEWPORTS) {
      const dir = join(CAPTURE_ROOT, slug, vp.name)
      const origPath = join(dir, 'original.png')
      const clonePath = join(dir, 'clone.png')
      const base: PageResult = {
        path: route.path,
        template: route.template,
        viewport: vp.name,
        diffPct: null,
        pass: null,
        width: 0,
        height: 0,
        overlay: null,
      }
      if (!existsSync(origPath) || !existsSync(clonePath)) {
        base.note = !existsSync(origPath)
          ? 'missing original capture'
          : 'missing clone capture (run: capture.ts clone)'
        results.push(base)
        continue
      }
      const orig = PNG.sync.read(readFileSync(origPath))
      const clone = PNG.sync.read(readFileSync(clonePath))
      const w = Math.min(orig.width, clone.width)
      const h = Math.min(orig.height, clone.height)
      const a = fit(orig, w, h)
      const b = fit(clone, w, h)
      const rects = masksFor(masks, route.path, vp.name)
      applyMasks(a, rects)
      applyMasks(b, rects)

      const diff = new PNG({ width: w, height: h })
      const changed = pixelmatch(a.data, b.data, diff.data, w, h, { threshold: 0.1 })
      const pct = changed / (w * h)

      const outDir = join(DIFF_REPORT_HTML_DIR, slug)
      mkdirSync(outDir, { recursive: true })
      const overlay = join(slug, `${vp.name}.diff.png`)
      writeFileSync(join(DIFF_REPORT_HTML_DIR, overlay), PNG.sync.write(diff))
      // Copy the source shots next to the overlay for the side-by-side report.
      copyFileSync(origPath, join(outDir, `${vp.name}.original.png`))
      copyFileSync(clonePath, join(outDir, `${vp.name}.clone.png`))

      results.push({
        ...base,
        diffPct: pct,
        pass: pct < TOLERANCE,
        width: w,
        height: h,
        overlay,
        note: rects.length ? `${rects.length} mask(s) applied` : undefined,
      })
      console.log(`  ${route.path} @ ${vp.name}: ${(pct * 100).toFixed(2)}% ${pct < TOLERANCE ? 'PASS' : 'FAIL'}`)
    }
  }

  mkdirSync('docs/reference', { recursive: true })
  writeFileSync(
    DIFF_REPORT_JSON,
    JSON.stringify({ tolerance: TOLERANCE, generatedRoutes: ROUTES.length, results }, null, 2),
    'utf8',
  )
  writeFileSync(join(DIFF_REPORT_HTML_DIR, 'index.html'), renderHtml(results), 'utf8')
  const scored = results.filter((r) => r.diffPct != null)
  const failing = scored.filter((r) => !r.pass).length
  console.log(`\nDiff report: ${scored.length} compared, ${failing} failing (>=1%). -> ${DIFF_REPORT_HTML_DIR}/index.html`)
}

function renderHtml(results: PageResult[]): string {
  const rows = [...results].sort((a, b) => (b.diffPct ?? -1) - (a.diffPct ?? -1))
  const cards = rows
    .map((r) => {
      if (r.diffPct == null) {
        return `<div class="card pending"><h3>${r.path} <small>${r.viewport}</small></h3><p>${r.note || 'not compared'}</p></div>`
      }
      const slug = slugFor(r.path)
      const pct = (r.diffPct * 100).toFixed(2)
      const cls = r.pass ? 'pass' : 'fail'
      return `<div class="card ${cls}">
      <h3>${r.path} <small>${r.viewport} · ${r.template}</small> <span class="pct">${pct}%</span></h3>
      ${r.note ? `<p class="note">${r.note}</p>` : ''}
      <div class="trip">
        <figure><figcaption>original</figcaption><img loading="lazy" src="${slug}/${r.viewport}.original.png"></figure>
        <figure><figcaption>clone</figcaption><img loading="lazy" src="${slug}/${r.viewport}.clone.png"></figure>
        <figure><figcaption>diff</figcaption><img loading="lazy" src="${r.overlay}"></figure>
      </div></div>`
    })
    .join('\n')
  const compared = results.filter((r) => r.diffPct != null)
  const failing = compared.filter((r) => !r.pass).length
  return `<!doctype html><html><head><meta charset="utf-8"><title>Crain & Wooley · visual diff</title>
<style>
body{font:14px/1.5 -apple-system,Segoe UI,Roboto,sans-serif;margin:0;background:#f5f3ef;color:#222}
header{padding:20px 28px;background:#304451;color:#fff;position:sticky;top:0;z-index:2}
header h1{margin:0 0 4px;font-size:18px}
header p{margin:0;opacity:.85}
main{padding:24px;max-width:1280px;margin:0 auto}
.card{background:#fff;border-radius:10px;padding:16px 18px;margin:0 0 18px;box-shadow:0 1px 4px rgba(0,0,0,.08)}
.card h3{margin:0 0 10px;font-size:15px;display:flex;align-items:center;gap:10px}
.card small{font-weight:400;color:#777}
.pct{margin-left:auto;font-variant-numeric:tabular-nums;font-weight:700}
.pass{border-left:5px solid #2e7d32}.pass .pct{color:#2e7d32}
.fail{border-left:5px solid #c62828}.fail .pct{color:#c62828}
.pending{border-left:5px solid #b0a070;opacity:.8}
.note{color:#8a7142;margin:0 0 8px;font-size:12px}
.trip{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px}
.trip figure{margin:0}
.trip figcaption{font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:#999;margin-bottom:4px}
.trip img{width:100%;border:1px solid #e3ded6;border-radius:6px;background:#fff;vertical-align:top}
</style></head><body>
<header><h1>Crain &amp; Wooley — visual parity report</h1>
<p>${compared.length} comparisons · ${failing} over 1% tolerance · sorted worst-first · masked regions excluded</p></header>
<main>${cards || '<p>No comparisons yet. Run capture.ts for both sides, then diff.ts.</p>'}</main></body></html>`
}

main()
