# Font-load audit (precondition gate before content-matching)

Method: load each page headless, `await document.fonts.ready`, then read the
resolved `font-family` of the key elements + `document.fonts.check()` for each
expected family. Run on both the clone (localhost) and the live original.

## Result: STYLE PARITY VERIFIED — same fonts resolve on both sides

Trio reference page: `/about-us/pricing/flat-rate-services/`

| | h1 / banner heading | body paragraph | Cormorant | Montserrat | arno-pro | Inter |
| --- | --- | --- | --- | --- | --- | --- |
| **clone** | Cormorant Garamond | Montserrat | ✓ | ✓ | ✗ | ✓ |
| **original** | Cormorant Garamond | Montserrat | ✓ | ✓ | ✓ | ✓ |

- The original loads its Typekit `arno-pro` kit headless, but its banner/headings
  actually **resolve to Cormorant Garamond**, and body resolves to **Montserrat** —
  exactly what the clone uses. (`arno-pro` is loaded but not applied to these
  elements.)
- So the headings and body render in the **same families on both sides**. The fonts
  are NOT the source of the remaining diff.

## Consequence

Since style parity holds, any residual >1% in a text band is sub-pixel rendering /
exact sizing / line-wrapping between the two stacks, not a font mismatch. Per the
owner-agreed posture, the **two-tier gate** applies once a band is structurally
aligned and a text residual persists:

- **<1%** for structure/chrome bands (banner chrome, badges, layout, closers'
  non-text regions),
- **≤3–5%** per text-heavy band (body prose, FAQ answers, value-card copy),
- full-page diff reported **informationally**.

Masks remain reserved for genuinely divergent widgets only (see `masks.md`), not for
text bands.
