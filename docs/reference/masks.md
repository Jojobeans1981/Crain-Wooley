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
| /about-us/pricing/flat-rate-services/ | flat-rate value-card FEED (the 3 cards) | `.cw-cardsec-grid` / `#CTAsS7Feed` — mask `*:cards` = `{x:0,y:.35,w:1,h:.65}` (band-local fractions) | `#CTAsS7` is a Scorpion JS `ui-repeater` (`CTAsS7Feed`): the card content is populated client-side and is ABSENT from the captured HTML, so its live DOM (card count, heights, the ~424px vs ~379px feed-top offset) diverges nondeterministically from the static clone. The band SHELL — light `lt-bg` band + the centered mixed-case Cormorant heading "Flat Rate Estate Planning Services" + lead paragraph (top 35%) — stays UNMASKED in the `<1%` structure tier; only the feed region below is masked. Clone reproduces the cards as navy `#304451` boxes (white serif titles) matching the original's `lk-bg` cards. Owner pre-approved under the Option-1 ui-repeater decision. | owner approval 2026-06-11 (Option-1 ui-repeater precedent) + before/after band crops `pixel-baselines/band/unit0/cards-*.png` |
| /allen/ | geo sidebar CTA ui-repeater feed (Download guide + Plano/Mansfield/Ft Worth location boxes) | `.cw-fb-sidebar` / `.sd-zn` — mask `allen:sidebar` = `{x:0,y:.4,w:1,h:.6}` (band-local fractions). PAIRED with the band-gate box-region CLIP (`origClipBoxes='.sd-nv, .sd-cta'`) that trims the orig `.sd-zn`'s empty article-column span (boxes ~1858px vs column ~5934px) BEFORE diffing. | The `.sd-cta s1/s2` boxes are Scorpion `ui-repeater` JS-feeds (the Download CTA + the 3 location boxes) — populated client-side, divergent from the static clone (and the orig renders them with an empty 4000px column below). The STATIC `.sd-nv` staff-profiles box + every box HEADING + the navy box SHELLS (top 40%) stay UNMASKED in the `<1%` tier — they score the residual honestly (post-clip+mask the sidebar reads 33.7%→6.84% desktop; the 6.84% is the static staff box's real height/spacing divergence, NOT hidden). Only the JS-feed region below is masked. | owner decision 2026-06-12 (b: box-region compare + mask JS-feed only) + post-clip crops `/tmp/sd-postclip.png` |

<!--
Template for an entry:
| /about-us/pricing/flat-rate-services/ | white card section | #CTAsS7Feed | ui-repeater cards populate nondeterministically in the live pixel capture (present in saved baseline: Flat-Rate Pricing*, Optional Lifetime Guarantee, Knowledgeable Service) | saved baseline + owner live verification 2026-06-11 |
-->
