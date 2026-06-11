# Family-B / D parity punch list

Status:
- **Family B (103):** body 100/103 ≥99% (mean 99.7%), metadata 103/103.
- **Family D (36 geo):** body 36/36 ≥99% (mean 99.7%), metadata 36/36 — COMPLETE.
  Geo pixel-check (deployed /allen/): top 37.6% / full 36.8% — same approved
  interior-redesign signature as B (identical FamilyBPage template), structurally
  correct (banner→intro→body→pillars→schedule). The original geo pages also carry
  a left practice-area sidebar nav the clone omits (see Observation below).

Open items below are tracked for follow-up; none block the content migration.

## P2 — Read-more collapsed-toggle rendering
**Pages:** `/media-center/firm-videos/estate-planning-webinar`,
`/resources/white-papers/don-t-want-to-leave-your-assets-a-mess-for-your-...`
**Original:** long body is collapsed behind a "Continue Reading / Read Less"
toggle (a JS expander on a `cnt s11` content section; no `aria-controls`).
**Clone today:** the full panel content IS captured (no content gap) but renders
inline, so the page is taller than the original — a visible layout diff.
**Fix:** render the read-more interaction in FamilyBPage — collapsed by default
with a "Continue Reading +" affordance (the homepage "CONTINUE READING +" is the
canonical control). Extractor should mark which trailing body blocks belong to
the collapsed panel so the renderer can wrap them.
**Why it's not blocking:** content is complete; this is interaction/layout parity.

## P2 — probate-quiz-survey: missing quiz embed
**Page:** `/resources/probate-quiz-survey` (gate 98.9%)
**Finding:** the original embeds an interactive quiz via an `<iframe>`; the
"Loading…" text the gate flagged is that iframe's fallback. The clone does NOT
reproduce the iframe, so the page is missing a widget the original displays.
**Fix:** decide per client — migrate the quiz iframe embed, or replace with the
clone's own quiz (the app already ships `/learn/quizzes/*`). Then re-gate.
**Follow-up:** audit other family-B `resource` pages for `<iframe>` embeds
(white-papers, surveys) so none silently drop an interactive widget.

## Observation (not a defect) — interior redesign vs original
Post-deploy pixel spot-check (live original vs deployed clone, desktop):
| Page | top-region diff | full-page diff | orig→clone height |
| --- | --- | --- | --- |
| asset-protection | 37.7% | 32.8% | 12256→8790px |
| supplemental-needs-trust | 37.3% | 26.1% | 15702→11406px |
| flat-rate-services | 33.7% | 65.1% | 8684→10561px |

High by design, NOT a regression: the clone interior is the **approved redesign**
— gold banner (delta #1) vs the original's dark banner + left practice-area
sidebar nav, award-badge chrome removed (delta #3), and the original's
pillars/testimonials/schedule closer bands replaced with the firm's shared
components. Body content parity is proven by the text gate, not pixels. The
deployed clone renders correctly: banner → two-column intro → body → cw-values
(pillars) → cw-locations (schedule), in source order; accordion pages render
their groups + instruction + closers.

If the client wants the original's **left practice-area sidebar nav** on interior
pages (cross-links to sibling estate-planning pages), that is a separate scoped
change — flag for product decision.
