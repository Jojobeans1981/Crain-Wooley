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
| _(none yet)_ | | | | |

<!--
Template for an entry:
| /about-us/pricing/flat-rate-services/ | white card section | #CTAsS7Feed | ui-repeater cards populate nondeterministically in the live pixel capture (present in saved baseline: Flat-Rate Pricing*, Optional Lifetime Guarantee, Knowledgeable Service) | saved baseline + owner live verification 2026-06-11 |
-->
