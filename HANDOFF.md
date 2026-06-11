# Crain & Wooley — interior parity rebuild · HANDOFF

Working repo: **`~/Crain-Wooley`** (NOT `/tmp/Crain-Wooley`, which is a corrupt copy).
Proof trio: `/about-us/pricing/flat-rate-services/` (B), `/allen/` (D geo),
`/staff-profiles/justin-t-crain/` (C staff). Gate: `scripts/visual-diff/pixel-proof.ts`
(`CLONE_ORIGIN=http://localhost:3210`), text Gate-1: `gate-family-b.ts`.

## Hard-won lessons (read before declaring anything "unreachable")

1. **Diagnose capture integrity + top-down cascade alignment before calling a target
   unreachable.** Three separate "ceilings" in this rebuild were instrument/cascade
   bugs, not real walls:
   - "Bands render empty/gold" → the original is reveal-gated (`data-onvisible="anm"`,
     opacity:0) AND uses LAZY `data-src` background images. Headless capture fired
     neither, so the baseline was non-deterministic. Fix: `pixel-proof.ts shot()`
     injects force-reveal CSS + pins `data-src->src` on BOTH sides.
   - "Diff plateaus at ~40% on content pixel-noise" → it was the TOP of the cascade
     (intro photo + badge band) being misaligned; fixing it top-down dropped the whole
     page 10–20 points. A vertical offset early cascades through everything below.
   - The full-page top-aligned diff means height parity per band matters as much as
     content. Align top→bottom (banner → badge → intro → body → closers).

3. **Harness can UNDER-count (false greens), not just over-count (false reds).**
   The per-band gate (`band-gate.ts`) first used fullPage screenshot + crop-at-rect.
   Playwright's fullPage screenshot RELAYOUTS (viewport→full height), so rects
   measured at the normal viewport didn't match the fullPage coords (Scorpion's vh
   layout shifts more than the clone) → crops grabbed the wrong region → diffs were
   UNDER-counted (bands looked passing when they weren't, e.g. schedule/badge).
   Also the band MAP mis-pointed testimonials at `#ImageGroupS1` (which wraps
   reviews+schedule) instead of `#ReviewsS8`. Fixes: screenshot the band ELEMENT
   directly (`locator.screenshot()`), settle all images before capture, and map
   each band to its true element. ALWAYS sanity-check a "passing" band by eyeballing
   its two crops — a false green is as dangerous as a false red.

2. **Turbopack stale-CSS gotcha.** The Next dev (Turbopack) file watcher silently
   MISSES script/heredoc writes to `app/globals.css` and serves STALE styles — the
   pixel gate then reports byte-identical numbers across edits (that's the tell).
   Always `rm -rf .next` + restart dev before measuring after a CSS edit, or verify a
   computed style first (`getComputedStyle`).

## Model

Interior pages render a source-order `bands[]` model (`lib/legacy/family-b`):
intro / prose / accordion / cards / closer, emitted by `extract-family-b.ts` in DOM
order, rendered by `FamilyBPage.tsx` (flow bands in the content column; bleed bands —
expanded-FAQ/cards/closers — full width). Dark bands are NAVY watermark (#304451 +
`/interior/closer-band-bg.jpg`); the FAQ is a collapsed gold question-bar accordion;
`#CTAsS7` is a light value-card panel. Closer colors/alternation were a lazy-fallback
artifact — all dark bands are navy when images are forced.

## Gate posture — TWO-TIER (ACTIVE; style parity verified, `docs/reference/font-audit.md`)

Pinned definition (do not let this drift):

- **STRUCTURE / CHROME bands** — banner, badge strip, sidebars, closers, location
  cards, FAQ bars (collapsed state), staff cards: **<1% per band**.
- **TEXT-CONTENT bands** — flowing prose / body regions: **≤5% per band** (aim ≤3%
  where cheap).
- **FULL-PAGE**: reported **informationally** alongside per-band numbers + masked-area %.
- A band failing its tier is STILL A FAILURE. The tiers narrow tolerance per band
  type; they do NOT create a third "close enough" bucket.

Why two-tier is justified: the font audit shows both clone and original resolve
h1→Cormorant Garamond and body→Montserrat identically headless — fonts are not the
diff source, so a text-band residual is sub-pixel stack rendering. Masks are
reserved for genuinely divergent JS-data widgets only (`docs/reference/masks.md`),
never for text bands; the gate prints masked-area % per page.
