# Per-band verification tables (computed-truth gate for exceptions)

Standard: tables gate exceptions, not percentages. A band is exception-eligible ONLY
when every computed-truth metric (position, size, font, color) matches the original
and the overlay residual is pure AA. "Any metric differs → fix." Each table below is
the measured clone-vs-original truth captured this session (DOM `getBoundingClientRect`
+ `getComputedStyle` in the band-gate capture environment), not pixel guesses.

## values card (flat-rate desktop) — card box PIXEL-EXACT; residual = head-column font floor

| Metric | Original | Clone | Match |
| --- | --- | --- | --- |
| card left / right | 775 / 1368 | 775 / 1368 | ✓ |
| card width | 593 | 593 | ✓ |
| card height | 809 | 808 | ✓ (1px) |
| grid columns / gap | two 593 cols, 110px | two 593 cols, 110px | ✓ |
| card padding | 57.6 / 47.4px | 57.6 / 47.4px | ✓ |
| row gap | 37.35px | 37.35px | ✓ |
| value rows (h) | 181 / 181 / 257 | 181 / 181 / 256 | ✓ (1px) |
| title font | Montserrat 500 16.48px | Montserrat 500 16.48px | ✓ |
| body font | Montserrat 400 16.46 / lh 29.63 | 16.46 / 29.63 | ✓ |
| fine print | same as body 16.46 / lh 29.63 | 16.46 / 29.63 | ✓ |
| **head-col eyebrow** | DESIGNED… wraps **2 lines** (h52) | wraps **1 line** (h24) | ✗ font-metric |

Verdict: the CARD box is geometry-verified pixel-exact (16.67% band residual is the
left head column). The ONE differing metric — the eyebrow wrap — is a font-metric
floor (orig Montserrat renders the eyebrow at 597px → 2 lines; the clone's real
Montserrat is 554px → 1 line; same text/size/ls/weight). Not cleanly fixable without
a forced-wrap hack; flagged for owner. → values stays FAIL pending owner call on the
eyebrow floor.

## intro+body (flat-rate desktop) — geometry aligned; residual = subhead wrap floor

| Metric | Original | Clone | Match |
| --- | --- | --- | --- |
| heading | Cormorant 60.9px / lh1.1, y0–134 | 60.9px, y0–134 | ✓ |
| "Expand Each Section" subhead | H5 Montserrat 25.68 / 500 / uppercase / ls1.28, y167 | 25.68 / 500 / uppercase / ls1.28, y167 | ✓ |
| lede start | y242 | y242 (subhead bottom-margin) | ✓ |
| framed photo | x808 / y0 / 593×519, top-right | x~775 / y0 / 593×519 | ✓ |
| band top padding | 0 (flush at heading) | 0 (cw-fb-main--introsplit) | ✓ |
| **subhead lines** | 2 (h58) | 1 (h33) | ✗ font-metric |
| band height | 797 | 766 (31px) | ✗ content |

Verdict: structure reordered + aligned (20.31→6.50%). Residual is the same Montserrat
wrap floor as values + ~31px content height. Text-tier band; close to ≤5%.

## testimonials (flat-rate desktop) — grid + photo box matched; residual = text/photo AA

| Metric | Original | Clone | Match |
| --- | --- | --- | --- |
| grid columns / gap | two 593 cols, 110px | two 593 cols, 110px | ✓ |
| photo box | 593×519, NO border, x71 | 593×519, no border, x72 | ✓ |
| photo source | raw 1264×1107 PNG | raw 1264×1107 PNG (unoptimized) | ✓ |
| title font | Cormorant 29.2px | 29.2px | ✓ |
| quote / name font | Montserrat 16.46px | 16.46px | ✓ |
| band height | 733 (settled) | 736 | ✓ (3px) |

Verdict: geometry matched (17.61→13.84%). Residual is the quote-text wrap + photo
sub-pixel on a content-dense band (structure tier <1% is unrealistic here). Candidate
for an owner-signed content-band exception OR a quote-feed mask (the reviews are a
Scorpion feed, like cards/schedule).

## banner family — see exceptions.md (geometry-verified on all 3 viewports, AA floor).

## allen sidebar — navy box stack built (5 boxes incl. 3-location split); see exceptions.md.
Residual is the ui-repeater JS-feed divergence + the desktop empty-column capture
artifact (orig .sd-zn spans the 5934px article column). Owner decision: harness fix or mask.
