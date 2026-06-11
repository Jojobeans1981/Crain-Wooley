# Banner form schema (Form_BannerV1) — baseline finding

**Correction to the "form-banner = lead capture" scope item.** Reading the
baselines, `form#Form_BannerV1` is **not** a lead-capture form — it is the
banner's **site-search box**.

## Fields (from the original markup)
| name | type | purpose |
| --- | --- | --- |
| `_m_` | hidden | Scorpion form token |
| `BannerV1SiteSearch$ITM0$C` | search (text) | site search query |

- `action` = the current page path (`/about-us/` etc.); Scorpion handled search
  server-side.
- The visible control is a single search input in the navy banner. No name /
  email / phone / message fields — i.e. no lead capture.

## Which pages have it
The navy banner image (`sub-banner-about.jpg`) + white serif title + gold rule is
on ~153 interior pages. A subset (the census "form" banners — about-us,
media-center, resources) additionally wrap the banner in this **search** form; the
others (`section#BannerV1`, e.g. asset-protection) render the same banner without
the search box.

## Recommendation (pending owner sign-off)
Because this is search, not leads, there is **no lead endpoint to stub**. Wire the
banner search box to the clone's existing **`/site-search`** route (already built).
If the owner instead wants the banner to capture leads (a product change, not a
migration of the original), that's a separate decision — flag in NEXT_STEPS.md.
