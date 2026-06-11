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

4. **3rd-party Scorpion "Connect" webchat widget contaminates band crops
   (instrument-bug class #6 — overlay contamination).** The live original mounts
   `#scorpion_connect` (a shadow-DOM host, z-index 2147483647) NONDETERMINISTICALLY;
   its green `.connect-page` panel ("How can we help? / Text with Us / Call Me /
   Email Us") floats over the banner/badge/testimonials/etc and the force-reveal
   CSS un-hides it. Because it's intermittent, it inflated random bands on random
   runs. The clone has no such widget. It lives in a shadow root, so an
   `addStyleTag` into the main document CANNOT reach `.connect-page` — you must hide
   the LIGHT-DOM host `#scorpion_connect`. Fix (in all three capture scripts'
   prep/shot): `#scorpion_connect,.connect-page,[class*="cta-tile"],[class*="ctas-tiles"]{display:none!important}`.
   Impact when removed (flat-rate desktop): banner 27.5%→7.0%, badge 5.2%→0.5%
   (now PASS), testimonials 41%→25-37%, schedule 6.8%→2.0%. UNIT 0 (2026-06-11)
   re-baselined the WHOLE scorecard after this fix; all numbers prior to it were
   suspect. Cached pixel-proof originals captured before the fix were deleted so
   they re-capture clean. ALWAYS eyeball the two band crops (now emitted by
   `unit0-crop-verify.ts` as `-sidebyside.png`) before accepting a high number.

## Session progress — Type-B desktop tuning (2026-06-11, post-UNIT-0)

After UNIT 0 re-baselined, desktop Type-B passes landed (all uncommitted):
- **banner** 7.0→4.65% (flat-rate), 15.9→8.0 (allen), 6.6→4.2 (justin): added the
  gold `ln-flr` rule under the heading (686x2px, `.legacy-banner-title::after`),
  raised heading (padding-top→57px, line-height 1.1), dropped search ~59px to hold
  height, and matched the search PILL + 55px gold CIRCLE button (legacy-mirror, so
  baseline shape over the intake app's square-input rule). Residual ~4% = sub-pixel
  white-heading AA (likely a floor) + search width.
- **values** 32.6→20.4 (flat-rate), 26.0→12.7 (allen): "Contact Us" → gold-fill
  white-text square button (was white fill); white value-card padding 84→112 / gap
  56→80 to recover the ~110px height deficit.
- **faq** 40.6→25.5: gold bars widened to the full content container (`acc max-width
  900→none`; original bars are w1296), questions fw600→700 / 1.15→1.26rem.
- **cards** 29.1→24.3: the 3 cards → NAVY boxes (#304451) + white serif titles +
  light body (were transparent/dark); panel grey removed; section heading forced
  mixed-case (out of the global UPPERCASE h2). Residual is HEIGHT (clone ~822 vs
  orig ~1088) — the original `#CTAsS7` is a JS `ui-repeater` (CTAsS7Feed) whose live
  DOM diverges; this is the planned `*:cards` MASK target (feed region), not a
  height-chase. Still OPEN.

DONE since: **cards CTAsS7 feed mask** (24.3->1.74% desktop; `*:cards`={y:.35,h:.65},
masks.md logged, committed 0ce3064) — band shell scored, JS-feed region masked.
**Testimonials** controls -> ARROWS only (dots + pause removed) + "See all Reviews"
gold-fill button (committed 0ce3064). Desktop testimonials still ~25% — the photo
proportions + quote-text block (content/position) drive it, not the controls.

STILL OPEN (next session), in directive order:
- **footer** (11.5% desktop / 30% tablet / 14% mobile, SHARED -> 9 cells): footer
  IS navy (`#FooterV1.ftr dk-bg` #304451 — verified; the `footer`/#FooterZone
  wrapper is transparent and fooled the crop into looking light). Real diffs: the
  clone's full-width `.cw-footer-top` tagline+"Schedule a Consultation" bar is NOT
  in the original (its tagline is a small inline h30 by the logo/phone, no button
  row); AND the original #FooterZone is TALLER (959 vs clone 867). Tablet 30% =
  column stacking differs <768px.
- **intro+body** text band (27% desktop, clone +85px TALLER): tighten lede/photo
  block + body spacing.
- **TABLET/MOBILE** (biggest): testimonials 62-64%, intro 42-50%, faq/values 22-36%
  — the original changes LAYOUT MODE (stacks columns) <900px; replicate the
  stacking, don't chase height with padding (owner note).
- **testimonials desktop residual** (~25%): photo column width + quote-text block.
- **sub-pixel-floor exceptions** (new protocol): banner is the candidate but at
  ~4.65% it still has minor geometry residual (search width/heading) — verify
  geometry identical first, THEN log as OWNER-APPROVED EXCEPTION with crops +
  evidence; don't bend the <1% gate.

CAUTION (hard-won this session): side-by-side COMPOSITE crops misled me 4x (cards
navy/light, faq, values, footer). ALWAYS confirm a band's bg/structure via
COMPUTED styles (dk-bg/lt-bg class + getComputedStyle) before changing CSS — the
crop is for spotting WHERE, computed truth for WHAT. Fast tool:
`scripts/visual-diff/_band1.ts <origSel> <cloneSel> <name>` (quote selectors;
zsh globs `[id^=..]`). unit0-crop-verify.ts emits all 7 flat-rate band crops.

2. **Turbopack stale-CSS gotcha.** The Next dev (Turbopack) file watcher silently
   MISSES script/heredoc writes to `app/globals.css` and serves STALE styles — the
   pixel gate then reports byte-identical numbers across edits (that's the tell).
   Note: even Edit-tool writes are UNRELIABLE here (some reload, some don't);
   `rm -rf .next` + restart + warm with a fresh log (don't reuse a log whose old
   "Ready in" line makes an `until grep` a no-op) is the only reliable path.
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
