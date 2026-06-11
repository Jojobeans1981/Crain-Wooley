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

## Gate posture (owner-agreed two-tier, if style parity verified)

<1% for structure/chrome bands; ≤3–5% per text band where implementation-stack font
rendering differs; full-page reported informationally. Masks are auditable
(`docs/reference/masks.md`) and the gate prints masked-area % per page.
