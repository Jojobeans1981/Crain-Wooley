# ui-repeater census (guardrail 1, before the 149 batch)

Scope: all 158 committed baselines (`docs/reference/capture/*/desktop/original.html`).
Goal: bound the JS-data-bound (`ui-repeater` / `anm_seq-lst`) regions where the
deterministic capture can diverge from the live original, BEFORE committing to the
live-truth + narrow-mask approach.

## Result: BOUNDED — proceed (not widespread)

`ui-repeater` markup exists on **158/158** pages, but that's universal Scorpion
chrome + feeds, not a content problem. Classifying the EMPTY (unpopulated in the
saved baseline) repeaters:

| Region | Pages | Class | Handling |
| --- | --- | --- | --- |
| `HeaderS2Social` | 158 | chrome (header social icons) | clone renders its own SiteHeader — not a content divergence |
| `FooterV1Locations` | 158 | chrome (footer offices) | clone renders its own SiteFooter — not a content divergence |
| `ReviewsS8Feed` | 110 | testimonials feed | clone renders `FEATURED_REVIEWS` (shared 8); populates live in the pixel capture |
| `ContentS8Tabs` | 2 (`about-us`, `estate-planning`) | content tabs | live-truth + mask |
| `VideoS1Tabs` | 2 (`home`, `media-center/firm-videos/estate-planning-webinar`) | content tabs | live-truth + mask |
| `ContentS11Tabs` | 1 (`resources/white-papers/don-t-want-to-leave-...`) | content tabs | live-truth + mask |
| `BlogSystemS1Entry` | 1 (`blogs/2026/june/recommended-frequency-...`) | blog entry | live-truth + mask |

**Genuine content-repeater divergence: 6 / 158 pages**, all "Tabs"/"Entry"
widgets — none in the proof trio.

## Trio specifics

- `flat-rate-services` `#CTAsS7Feed` (the white "Flat Rate Estate Planning Services"
  card section) is **populated in the saved baseline** — 3 cards: **Flat-Rate
  Pricing\***, **Optional Lifetime Guarantee**, **Knowledgeable Service** (matches
  the owner's live verification). It is NOT an empty-in-baseline repeater. The
  earlier "empty" was the LIVE pixel capture nondeterministically not populating it
  in time → handled by Option 1 (render from baseline truth + narrow mask over the
  repeater region, both sides). Logged in `masks.md`.
- `allen`, `justin` — no empty content repeaters; their repeaters are the shared
  closers (reviews / schedule cards), which the clone renders.

## Conclusion

The live-vs-capture divergence is a handful of widgets (6 Tabs/Entry pages + the
trio's already-extractable CTAsS7 cards), not pervasive. Safe to proceed with
Option 1. When the 149 batch runs, the 6 Tabs/Entry pages get a logged mask each;
everything else extracts from the baseline.
