# Cutover Parity Checklist (Phase 4)

Interaction + content parity vs the original, verified against the codebase and the captures.
Visual/structural parity is tracked separately in `visual-parity-assessment.md`.

| Item | Status | Notes |
| --- | --- | --- |
| **Mobile nav** | ✅ | `SiteChrome` nav flyouts with `aria-expanded`; JS open state matches the caret. |
| **Dropdown menus** | ✅ | `.cw-flyout` submenus (`role="menu"`/`menuitem`), hover + tap/focus open. |
| **Lead forms render + submit** | ✅ (env-gated) | `GuideForm`, `WebinarForm` → `POST /api/marketing-lead` (Resend). Needs `LEAD_NOTIFICATION_EMAIL`/`SEED_ADMIN_EMAIL` + `RESEND_*` on Vercel — see NEXT_STEPS. |
| **Badge carousel arrows** | ✅ | Phase 2: `BadgeWall` client component, prev/next chevrons over a snap-scroll strip (replaced the marquee). |
| **Testimonial carousel arrows** | ✅ | `Testimonials`: prev/next + dots + ArrowLeft/ArrowRight keyboard, one review at a time. |
| **Featured reviews** | ✅ mechanism / ⚠ list | Now driven by a `featured` flag in `reviews.json` (not `slice`). 8 marked as a default; client's blessed list is open item #3. |
| **Outlook booking links** | ✅ | Location cards link to `outlook.office.com/book/...` (Mansfield, Ft Worth, etc.). |
| **Blog template** | ✅ | Individual posts render via `LegacyArticle` (gold banner). 189/190 sitemap posts are real 200s; the 2026-06-09 post + taxonomy are content gaps (open item #1). |
| **404 page styled** | ✅ | Phase 4: added `app/not-found.tsx`, on-brand (cream, Cormorant H1, slate/gold CTAs) — was the unstyled Next default. |
| **Favicon** | ❌ gap | No `app/favicon.ico` / `app/icon.*`. Needs the client's brand favicon asset — flagged in NEXT_STEPS. |
| **OG / Twitter metadata** | ✅ | Root `openGraph` + `twitter` in `app/layout.tsx`; per-page overrides via `lib/seo.ts`. |
| **Per-page metadata parity** | ✅ | Legacy pages carry scraped `title`/`description`; `lib/seo.ts` builds canonical/OG per route. |
| **Noindex on staging** | ✅ | `NEXT_PUBLIC_SITE_INDEXABLE` gates indexing; staging stays noindex until live-domain cutover. |

## Intentional deltas (do NOT "fix" — confirmed by design)

- Quiz card sidebar (our addition) — kept.
- Scorpion chat dock (Connect/Text/Call/Email) — removed.
- AudioEye accessibility widget — removed (our own WCAG controls instead, e.g. hero pause).
- Scorpion footer credit — removed.
- Blog post recency drift — original publishes new posts continually.
