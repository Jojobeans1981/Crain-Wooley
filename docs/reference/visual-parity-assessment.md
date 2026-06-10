# Visual Parity Assessment (Phase 3)

> Generated from `docs/reference/diff-report.json` (rig: `scripts/visual-diff`). Run
> `npx tsx scripts/visual-diff/diff.ts` to regenerate; full image report at `diff-report/index.html`
> (images are gitignored — regenerate with `capture.ts clone` + `diff.ts`).

## What the rig proved

**Token parity is exact.** Phase 2's corrections match the original's computed styles to the
sub-pixel at every breakpoint (validated against the capture):

| Probe (desktop) | Original | Clone | Match |
| --- | --- | --- | --- |
| H1 | Cormorant Garamond 400, 60.91px, lh 67, #343434 | identical | ✅ |
| H2 | Montserrat 500 UPPERCASE, 25.68px, lh 30.8, ls 0.05em, #343434 | identical | ✅ |
| body p | Montserrat 400, 16.46px, lh 1.8, #343434 | identical | ✅ |
| hero caption | Cormorant 400, 69px, lh 1.1 | clone 71px (clamp cap) | ≈ |

## What the rig also proved — the blocker for <1% pixel diff

**Full-page pixel diff does not reach the <1% tolerance on any template, and cannot without
per-template structural rebuilds.** Two compounding causes:

1. **Vertical-offset sensitivity.** pixelmatch compares pixel `(x,y)` to `(x,y)`. Any height
   difference high on the page shifts every section below it, so the whole page reads as
   "different" even when each section is visually faithful. This is inherent to full-page diff.

2. **Structural divergence on interior templates.** The interior marketing pages render from the
   legacy content scrape (`LegacyArticle`) as simplified articles. They are 40–60% the height of
   the original's full Scorpion templates (multi-section layouts with sidebars, CTA bands, related
   content). Measured full-page heights (desktop):

   | Route | Original | Clone | Δ |
   | --- | --- | --- | --- |
   | `/` (homepage, hand-built) | 9109px | 8031px | -1078 (closest) |
   | `/estate-planning/` | 9558px | 5865px | -3693 |
   | `/about-us/` | 7525px | 4978px | -2547 |
   | `/plano/` (geo) | 10936px | 9330px | -1606 |
   | `/contact-us/` | 2024px | 3866px | +1842 |

   These are not spacing/weight deltas that polish can close — the pages are structurally
   different documents. Reaching <1% requires rebuilding each interior template to mirror the
   original's section structure and content.

## Disposition

- **Homepage + shared chrome (header/footer):** structurally close. The header already matches
  (logo proportions, phones inside the header — the spec's "separate band" concern is already
  resolved), and typography is exact. Remaining homepage delta is ~1078px of section/spacing
  length, plus the (masked) hero video frame.
- **Interior templates (practice areas, about, geo, contact, staff, media, blogs):** require
  structural template parity work. This is the same effort family as the content-migration open
  items (the legacy scrape gave us content + SEO 200s, not pixel-faithful layouts). Tracked in
  `NEXT_STEPS.md`.

## Recommendation

Ship the validated token parity + the SEO/route parity (geo 100%) now. Treat per-template
structural parity as a scoped follow-on, template by template, using this same rig as the
acceptance gate (it already gives worst-first ordering and per-breakpoint computed-style truth).
