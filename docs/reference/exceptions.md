# Sub-pixel exception registry (owner-signed)

A structure band qualifies for an exception ONLY when its GEOMETRY verifies
identical by computed truth (positions, sizes, weights, colors all matched, overlay
crops aligned) and the residual diff is pure antialiasing on rendered text. This
does NOT bend the `<1%` gate — the gate still reports the real %; the exception is a
separate, owner-signed classification so the scorecard tracks the band honestly.

Status flow: **PENDING** (geometry verified, awaiting owner crop review) →
**SIGNED** (owner reviewed the crops and accepted). Machine registry:
`scripts/visual-diff/exceptions.json` (band-gate stamps `EXCEPTION-PENDING/SIGNED`
into `band-scorecard.json` + the console scorecard).

## Entries

| Page | VP | Band | Residual | Status | Geometry evidence (computed truth) | Crops |
| --- | --- | --- | --- | --- | --- | --- |
| /about-us/pricing/flat-rate-services/ | desktop | banner | 4.61% | PENDING | heading Cormorant 400 / 60.9px / lh 67 / **ls normal** (matched); gold `ln-flr` rule 686×2px under heading; search = white pill + 55px gold circle (`border-radius:50%`, #9B8059). Band height 307/308. All matched; residual is the large white-heading AA on the navy watermark band. | `pixel-baselines/band/unit0/banner-{sidebyside,orig,clone}.png` |
| /staff-profiles/justin-t-crain/ | desktop | banner | 4.35% | PENDING | Same form-banner geometry as flat-rate (verified identical). | `pixel-baselines/band/unit0/banner-sidebyside.png` |

**NOT exception-eligible** (residual is structural/content, not sub-pixel — these stay
FAIL until rebuilt): banner @ tablet/mobile (12–16%), banner @ allen-desktop (8%),
and all of intro/values/faq/testimonials/footer/sidebar at their current %.
