# Crain & Wooley — interior parity rebuild · HANDOFF

## ⚠️ DEPLOY TOPOLOGY (read before touching any Vercel project)

- **`Jojobeans1981/Crain-Wooley`** (this repo, `~/Crain-Wooley`) = THE APP (marketing +
  intake). Canonical staging deploys via **Joseph's Vercel** (`joseph-panettas-projects`
  team). Review URL for this team: **`crain-wooley-parity-review`** (see
  `docs/reference/parity-review-deploy.md`) — marketing-only, no intake env, staging-fresh.
- **`wemovenewyork/crain-wooley-intake`** = an OLDER fork that ALSO serves the **live
  intake form** at `crain-wooley-intake.vercel.app` / `…-rose.vercel.app` (the design
  reference). **NEVER repoint its Git integration to this repo and NEVER push this repo
  over it.** Reviewing it for interior-parity work is the recurring confusion.
- **Build gotcha (fixed 2026-06-12):** `next build` has no `ignoreBuildErrors`; a
  FaqBand type error (FamilyBPage.tsx) was failing EVERY build → all deploys stale
  (`a8abe5c`). Also there's no postinstall hook, so `scripts/build.mjs` now runs
  `prisma generate` before `next build` (`29d01d2`). Keep both green.

## Session 5 (2026-06-12) — fix-list 1a–1e + verification tables (committed per unit)

Proof-trio improvements (all committed): **values card** box DOM-pinned pixel-exact
(593×808, 20.0→16.67%; residual = head-col eyebrow font-wrap floor, `4aadb66`);
**intro** subhead reorder (H5 25.68px hoisted heading→lede) + flush-top (the clone's
72px band padding pushed every element +72 — the whole 20%) → 20.3→6.50% (`f17c179`);
**testimonials** grid → two 593 cols + 110 gap, photo border removed (593×519 fills,
was 581×508 misregistered) + unoptimized raw PNG, leaf fonts → 17.6→13.84% (`1a11420`);
**banner tablet/mobile** heading scaling + search sizing + mobile pill width, ALL
scoped <900px so the EXCEPTION-PENDING desktop is byte-identical → 8.6-15.8%→4.1-6.5%
(`4f4010b`); **allen sidebar** location feed split into 3 navy boxes (Plano/Mansfield/
Ft Worth) + <900 stacking verified (`b2dc7d7`).

Verification tables (`docs/reference/verification-tables.md`) gate the exceptions.
**Banner family** (8 cells: desktop+tablet+mobile × the search pages, geometry verified)
is EXCEPTION-PENDING; crops in `~/Desktop/banner-exception-review/<page>/<vp>/`.
Scorecard: **11 PASS · 8 EXC-PENDING · 44 FAIL**. The 44 FAILs are honestly reported
(NOT excepted): tablet/mobile <900 stacking for values/faq/testimonials/intro
(unbuilt), the footer-settle capture artifact (allen/justin 14.8%), and the allen
sidebar ui-repeater/empty-column divergence — all flagged for owner adjudication in
`exceptions.md`. STOPPED here for owner sign-off before scaling to the 149.

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

## Session 4 (2026-06-11) — rebuild queue c/d/e + verify-table gating

- **(c) testimonials photo-height** 21->17.3% (desktop): photo is 593x519 VERTICALLY
  CENTERED (y107), not stretched/top-aligned (1460f5a).
- **(d) footer column-height** 13.3->6.3% (desktop): orig navy row 568px driven by
  the Locations column; bumped office spacing + address lh so it reaches ~568, band
  955 vs 960 (c5e0e7b).
- **(b verify-table)** value-card title -> Montserrat fw500 16.5px (was Cormorant
  fw700 21.6; verified leaf STRONG.fnt_t-6); faq question CONFIRMED Cormorant fw700
  ~20px (orig leaf STRONG.fnt_t-4) — clone already right, the exact-lh pin
  over-compacted 20 bars so reverted. values 20.5->19.8, faq held 25.5 (81914a7).
  GATING WORKED: the verify-table caught a real bug AND blocked a wrong change.
  Build it leaf-precise (`el.children.length<=1`) — broad selectors match containers
  and lie about font-family (the "Inter vs Montserrat" scare was a container match;
  body text IS Montserrat via `.cw-page{--font-sans:var(--font-marketing-sans)}`).
- **(e) tablet/mobile stacking — testimonials** 63->26% / 64->33%: original DROPS the
  photo <900px (text-only) + narrows the text to a 538px CENTERED column; clone was
  full-width with a stacked photo (e9347c3). The photo is a lazy BACKGROUND-image at
  desktop, display:none <900 — <img> probes read "no photo", confirm via crops.

TABLET/MOBILE done (unit e, worst-first): **testimonials** 63->26/64->33 (e9347c3),
**footer** tablet 31.6->11.7 (3a836f7: original STACKS columns <1000px into a 538px
centered single column — raised the 3-col breakpoint 768->1000), **intro** tablet
32.4->3.9 PASS / mobile 21.5->7.5 (f56c4d3: drops photo + 538-centered <900). The
recurring <900 pattern: the original DROPS side imagery and collapses to a single
NARROW CENTERED column (~538 @768 / ~340 @390) — replicate, don't pad.

STILL MURKY (no clean single-pattern fix — needs per-element work):
- **values** tablet 35 / mobile 22 / desktop 19.8: the left heading-column sits ~84px
  too LOW (orig eyebrow leaf y353 vs clone y437) — the grid `align-items:center`
  centers the short head-column against the tall white card, but the original lands
  it higher (neither start@106 nor center@437). Needs the original's left-column
  vertical rhythm matched (card height + alignment), not a 1-liner.
- **faq** tablet 36 / mobile 35 / desktop 25.6: 20-bar height accumulation — bars
  ~3px/bar off compounds over 20. Pinning the exact question lh over-compacted them
  (band 2096 vs orig 2160). Needs the bar height matched to the original h83
  (padding, not lh) so 20 bars sum to 2160.

HARNESS footer-settle (still TODO): the original #FooterZone boundingBox is 854px on
allen/justin vs 960 on flat-rate (same global footer) — it captures SHORT there (the
legal strip / footer-bg settles late). band-gate's bandShot should wait for the band
HEIGHT to stabilize (poll boundingBox until steady) before screenshotting. Until
then allen/justin desktop footer (~14.8%) is harness noise; flat-rate (6.4%) is true.

Banner stays EXCEPTION-PENDING until owner crop review.

FOOTER CAPTURE ARTIFACT (investigate): the GLOBAL footer is identical on every page,
but the ORIGINAL footer captures at different heights — 960px on flat-rate vs 854px
on allen/justin (the footer-bg/legal-strip loads short on some pages). The clone is a
correct fixed 955 (matches the real 960), so flat-rate footer reads 6.4% but
allen/justin read ~14.8% purely from the 854 short-capture. Fix the harness footer
settle (wait for footer-bg + legal strip) before trusting per-page footer numbers;
the flat-rate footer is the reliable one.

## Session 3 (2026-06-11) — structural rebuild queue (committed per unit)

DONE + committed:
- **banner** -> de-chromed + geometry matched: gold ln-flr rule, ls:normal, search
  pill+circle. Desktop ~4.4-4.6% = **EXCEPTION-PENDING** (geometry verified, residual
  is white-heading AA). Registry: `scripts/visual-diff/exceptions.json` +
  `docs/reference/exceptions.md`; band-gate stamps EXCEPTION-PENDING/SIGNED into the
  scorecard. AWAITING owner crop sign-off -> flip status to SIGNED (commit 5632ced).
- **footer** 25.5->13.25%: removed the invented `.cw-footer-top` tagline+Schedule bar
  (verified NOT in the original), matched the navy band's 106px padding + 140px logo
  (b67a529).
- **testimonials** 25->21%: arrows-not-dots, gold "See all Reviews", photo widened
  1:1.25->1:1.1 (592px = orig 593) (0ce3064, b67a529).
- **cards** 24->1.74% (masked): navy boxes + `*:cards` feed mask (0ce3064).
- **intro (a)** 27->20.5%: two-column rebuild (`cw-fb-content--introsplit`: left col
  + photo abs top-right 519px), restored the lede paragraph (was missing from
  pages.json), intro plan-accordion bars -> light boxes (orig `bg-bx lk-bg`)
  (d783836).

STILL OPEN (the remaining queue), worst-first:
- **TABLET/MOBILE stacking (unit e — biggest, UNBUILT)**: testimonials 63-64%, intro
  42-50%, footer 33-36% @ tablet, faq/values 22-36%. The original changes LAYOUT MODE
  (stacks columns) <900px — replicate the stacking per band, NOT padding (owner note).
- **footer** last ~90px (d): clone 870 vs orig 960 — real column-height, not the bar.
- **testimonials** photo-HEIGHT (c): clone photo stretches 562 vs orig 519 (fixed
  height/aspect); + quote block.
- **intro** instruction-order (residual): orig has "Expand Each Section" as a subhead
  UNDER the heading (y167) ABOVE the lede (y242); clone renders it after the lede —
  cross-band reorder.
- **values 20% / faq 25% (b)**: structurally faithful (eyebrow/heading/button/card on
  values; full-width gold bars on faq). Residual is fine-grained text-rendering at a
  floor like banner — likely EXCEPTION territory once the last geometry is confirmed,
  NOT more CSS. (faq section-heading weight unverifiable — orig heading not found by
  h1/h2/h3/strong; needs a better selector before touching it.)

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

## <900px STACKING RULE (default for the 149 batch — verified design-system behavior)

Below 900px the original collapses every multi-column band to a SINGLE NARROW CENTERED
column and DROPS side imagery:
- **Drop** the side photo/feature image (testimonials, intro) — it's display:none'd
  (often a lazy background-image at desktop, so `<img>` probes read "no photo" —
  confirm via a crop, not an img query).
- **Collapse** to one column, **centered**, ~**538px @768** / ~**340px @390** (cap the
  content/grid at `max-width: 538px; margin-inline: auto`).
- **Footer** specifically: the 3-up column grid is desktop-only — it stacks <1000px
  into the same 538-centered single column (raise the grid breakpoint to >=1000).
This is the DEFAULT; for each of the 149, the check is per-band BASELINE VERIFICATION
(does this band actually drop imagery / re-width at <900 on the original?), not
re-discovery. Confirmed on testimonials (e9347c3), footer (3a836f7), intro (f56c4d3).

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
