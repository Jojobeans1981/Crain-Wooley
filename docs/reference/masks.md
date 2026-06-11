# Mask registry (auditable exceptions)

Every masked region in the pixel gate is logged here. Masks are scoped to exactly
the region where the LIVE original diverges nondeterministically from a headless
capture (JS-data-bound `ui-repeater` widgets, lazy media that never resolves).
They are NOT silent carve-outs: the gate report prints total masked-area % per page
alongside the diff %, and every entry below names its rendered-truth source.

Mask rects live in `scripts/visual-diff/proof-masks.json`, keyed by
`<slug>-<viewport>` (per-viewport) or `<slug>` (all viewports). Coords are
`{x,y,w,h}` in device pixels of the full-page screenshot.

## Entries

| Page | Region | Selector / id | Reason | Rendered-truth source |
| --- | --- | --- | --- | --- |
| _all interior_ | schedule location-card grid (the 3 cards) | `.cw-locations` / `#CTAsS1` — mask `*:schedule` = `{x:0,y:.34,w:1,h:.66}` (band-local fractions) | The card photos resolve NONDETERMINISTICALLY by viewport (navy/photo at desktop, gold placeholder at tablet/mobile) even force-loaded — the divergent lazy-image widget. The band heading + subhead + gold flair (top 34%) stay UNMASKED in the `<1%` tier. Mask area is large because the cards are most of the band; it is the whole widget, not a content carve-out. | owner live verification 2026-06-11 |
| _all interior_ | badge carousel viewport (logo strip only) | `.cw-badges-interior` / `#AwardsS*` — mask `*:badge` = `{x:.05,y:.16,w:.9,h:.66}` (band-local fractions) | Divergent re-hosted credential set: clone hosts 15 firm badges, the original carousel shows ~6 different images (`new.png`, `Top-3-Estate-Planning-2022.png`, …). The band SHELL (height, bg, prev/next arrows) stays UNMASKED in the `<1%` structure tier so the mask can't hide structural drift. | owner live verification 2026-06-11 |

<!--
Template for an entry:
| /about-us/pricing/flat-rate-services/ | white card section | #CTAsS7Feed | ui-repeater cards populate nondeterministically in the live pixel capture (present in saved baseline: Flat-Rate Pricing*, Optional Lifetime Guarantee, Knowledgeable Service) | saved baseline + owner live verification 2026-06-11 |
-->
