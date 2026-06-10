/*
 * Phase 0 capture rig.
 *
 * Captures, for a configurable route list, from one or both origins:
 *   - full-page screenshots at 3 viewports (mobile/tablet/desktop)
 *   - computed-style JSON per viewport for the STYLE_TARGETS probes
 *   - raw HTML snapshot (for route-parity + structure checks)
 *
 * Output: docs/reference/capture/{route-slug}/{viewport}/{original|clone}.{png,html}
 *         docs/reference/capture/{route-slug}/{viewport}/{original|clone}.styles.json
 *
 * On an original-side run it also aggregates the homepage + section probes into
 * docs/reference/original-tokens.json (the canonical token file Phase 2 trusts).
 *
 * Usage:
 *   npx tsx scripts/visual-diff/capture.ts original   # baseline (Phase 0)
 *   npx tsx scripts/visual-diff/capture.ts clone       # local build (Phase 2+)
 *   npx tsx scripts/visual-diff/capture.ts both
 *   ... [--only=/path/,/other/]   restrict to specific routes
 */
import { chromium, type Browser, type Page } from 'playwright'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import {
  ROUTES,
  VIEWPORTS,
  ORIGINS,
  STYLE_TARGETS,
  STYLE_PROPS,
  slugFor,
  CAPTURE_ROOT,
  ORIGINAL_TOKENS_FILE,
  type RouteDef,
} from './routes.config'

type Side = 'original' | 'clone'

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'

// Freeze animation/transition so screenshots are deterministic across runs.
const STABILIZE_CSS = `*,*::before,*::after{animation-duration:0s!important;animation-delay:0s!important;transition-duration:0s!important;transition-delay:0s!important;caret-color:transparent!important}html{scroll-behavior:auto!important}`

function parseArgs() {
  const argv = process.argv.slice(2)
  const sideArg = (argv.find((a) => !a.startsWith('--')) || 'both') as Side | 'both'
  const onlyArg = argv.find((a) => a.startsWith('--only='))
  const only = onlyArg ? onlyArg.replace('--only=', '').split(',').map((s) => s.trim()).filter(Boolean) : null
  const sides: Side[] = sideArg === 'both' ? ['original', 'clone'] : [sideArg]
  const routes = only ? ROUTES.filter((r) => only.includes(r.path)) : ROUTES
  return { sides, routes }
}

async function autoScroll(page: Page) {
  // Trigger lazy-loaded images/sections before the full-page shot.
  await page.evaluate(async () => {
    await new Promise<void>((resolve) => {
      let y = 0
      const step = 600
      const timer = setInterval(() => {
        const max = document.body.scrollHeight
        window.scrollTo(0, y)
        y += step
        if (y >= max) {
          clearInterval(timer)
          window.scrollTo(0, 0)
          resolve()
        }
      }, 40)
    })
  })
  await page.waitForTimeout(250)
}

async function probeStyles(page: Page) {
  return page.evaluate(
    ({ targets, props }) => {
      const out: Record<string, Record<string, string> | null> = {}
      for (const t of targets) {
        let el: Element | null = null
        for (const sel of t.selectors) {
          const candidates = Array.from(document.querySelectorAll(sel))
          el =
            candidates.find((c) => {
              const r = (c as HTMLElement).getBoundingClientRect()
              const s = getComputedStyle(c)
              return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none'
            }) || null
          if (el) break
        }
        if (!el) {
          out[t.key] = null
          continue
        }
        const cs = getComputedStyle(el)
        const rec: Record<string, string> = {}
        // Browsers expose computed styles via camelCase indexed access, so no
        // kebab conversion (and no nested named helper that esbuild would wrap
        // in an undefined __name) is needed.
        for (const p of props) rec[p] = ((cs as unknown as Record<string, string>)[p] ?? '') as string
        rec['__selector'] = t.selectors.find((sel) => el!.matches(sel)) || t.selectors[0]
        rec['__text'] = (el.textContent || '').trim().slice(0, 60)
        out[t.key] = rec
      }
      return out
    },
    { targets: STYLE_TARGETS, props: STYLE_PROPS as unknown as string[] },
  )
}

async function captureRoute(browser: Browser, side: Side, route: RouteDef) {
  const base = ORIGINS[side]
  const url = base.replace(/\/$/, '') + route.path
  const slug = slugFor(route.path)
  const styleByViewport: Record<string, unknown> = {}

  for (const vp of VIEWPORTS) {
    const dir = join(CAPTURE_ROOT, slug, vp.name)
    mkdirSync(dir, { recursive: true })
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 1,
      userAgent: UA,
      reducedMotion: 'reduce',
    })
    const page = await context.newPage()
    try {
      // networkidle never settles on `next dev` (HMR socket); 'load' + settle is
      // robust for both the original and a production clone build.
      await page.goto(url, { waitUntil: 'load', timeout: 60_000 })
      await page.addStyleTag({ content: STABILIZE_CSS })
      await page.waitForTimeout(side === 'original' ? 1200 : 500)
      await autoScroll(page)
      await page.evaluate(() => document.fonts?.ready)

      const png = join(dir, `${side}.png`)
      await page.screenshot({ path: png, fullPage: true })

      const html = await page.content()
      writeFileSync(join(dir, `${side}.html`), html, 'utf8')

      const styles = await probeStyles(page)
      styleByViewport[vp.name] = styles
      writeFileSync(join(dir, `${side}.styles.json`), JSON.stringify(styles, null, 2), 'utf8')

      console.log(`  [${side}] ${route.path} @ ${vp.name} -> ${png}`)
    } catch (err) {
      console.error(`  [${side}] FAILED ${route.path} @ ${vp.name}: ${(err as Error).message}`)
      writeFileSync(join(dir, `${side}.error.txt`), String(err), 'utf8')
    } finally {
      await context.close()
    }
  }
  return { slug, route, styleByViewport }
}

async function main() {
  const { sides, routes } = parseArgs()
  console.log(`Capture: sides=${sides.join(',')} routes=${routes.length}`)
  const browser = await chromium.launch()
  const homeStyles: Record<string, unknown> = {}
  try {
    for (const side of sides) {
      for (const route of routes) {
        const res = await captureRoute(browser, side, route)
        if (side === 'original' && route.path === '/') homeStyles.home = res.styleByViewport
      }
    }
  } finally {
    await browser.close()
  }

  // Aggregate the canonical token file from the original homepage probes.
  if (sides.includes('original') && routes.some((r) => r.path === '/')) {
    mkdirSync('docs/reference', { recursive: true })
    const tokens = {
      source: ORIGINS.original,
      capturedFrom: 'homepage computed styles, per breakpoint',
      note: 'Generated by scripts/visual-diff/capture.ts. Source of truth for Phase 2/3 token corrections.',
      viewports: VIEWPORTS,
      home: homeStyles.home ?? null,
    }
    writeFileSync(ORIGINAL_TOKENS_FILE, JSON.stringify(tokens, null, 2), 'utf8')
    console.log(`Wrote ${ORIGINAL_TOKENS_FILE}`)
  }
  console.log('Capture complete.')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
