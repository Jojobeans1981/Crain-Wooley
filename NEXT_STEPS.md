# Crain & Wooley — Next Steps for Cutover

## 🚦 DEPLOY TOPOLOGY + CUTOVER DECISION (added 2026-06-12)

- **Interior-parity review URL:** `https://crain-wooley-parity-review.vercel.app`
  (this team, deploy of `Jojobeans1981/Crain-Wooley` `main`; marketing-only, no intake
  env, `no-store` staging-fresh, `noindex`). Re-deploy with
  `vercel deploy --prod --scope wemovenewyorknet-8057s-projects` from `~/Crain-Wooley`.
  Details: `docs/reference/parity-review-deploy.md`.
- **Canonical staging:** Joseph's Vercel (`joseph-panettas-projects`) deploy of
  `Jojobeans1981/Crain-Wooley` — confirm it now builds green (FaqBand type error +
  missing `prisma generate` were failing every build; fixed in `a8abe5c` + `29d01d2`).
- **DO NOT touch** `crain-wooley-intake.vercel.app` (`wemovenewyork/crain-wooley-intake`)
  — older fork + the LIVE intake form + the `…-rose` design reference. Never repoint, never push.

### ⬜ CUTOVER DECISION — which Vercel project/account serves `estateplanningdfw.law` at DNS flip
Owner + Joseph: decide whether the live domain is served by **Joseph's Vercel**
(`Jojobeans1981/Crain-Wooley`) or a project in this team, then migrate ALL env vars
(Supabase, Stripe, Twilio, Clio, QStash, Resend, `NEXT_PUBLIC_SITE_INDEXABLE=true`) to
the chosen project. The parity-review URL above carries NONE of these (marketing-only).

## ✅ COMPLETE (as of commit `30fb6c8`)

- **Audit:** Full project audit against spec — see `AUDIT_REPORT.md` (generated below)
- **Code commit:** All 28 files (14 modified + 14 new) committed and pushed to `main`
  - Includes: client portal foundation, onboarding improvements, intake tracker enhancements
- **Env checklist:** Created `CUTOVER_ENV_CHECKLIST.md` with all Vercel env vars and runbook
- **Git:** Clean working tree, origin current

---

## 🎯 IMMEDIATE ACTIONS (This Week)

### 1. Vercel Environment Setup (BLOCKS CUTOVER)
**Owner: Haron / Joseph**

These 3 variables gate the marketing forms (guide + webinar). Without them, forms return 500 errors.

```
LEAD_NOTIFICATION_EMAIL = [firm inbox or test inbox]
RESEND_API_KEY          = [confirm set + valid]
RESEND_FROM_EMAIL       = [confirm sender is verified in Resend]
```

**Action:** 
1. Set on Vercel (Production + Preview)
2. Redeploy to staging
3. Test guide form → email should arrive at `LEAD_NOTIFICATION_EMAIL`

### 2. Video & PDF Migration (BLOCKS CUTOVER)
**Owner: Joseph (Vercel Blob access)**

12 MP4s currently at `estateplanningdfw.law/media/*.mp4` will 404 at DNS cutover.

**Action:**
1. Request Vercel Blob token (if not already available)
2. Download all 12 MP4s from live Scorpion site (before DNS cutover)
3. Upload to Vercel Blob
4. Update `lib/legacy/legacy-pages.json` with Blob URLs
5. Set `NEXT_PUBLIC_GUIDE_VIDEO_URL` = CWBOTH30 Blob URL
6. Commit + push
7. Redeploy

**Status:** Ready to execute once Blob access is available.

### 3. Firm Decisions (BLOCKS CUTOVER)
**Owner: Justin Crain / firm**

Confirm before cutover:

- **Lead email destination** — who gets guide/webinar leads? (test inbox or real?)
- **Webinar sessions** — what times appear on the form?
- **Privacy policy** — counsel review needed before real PII flows?
- **Product go-live** — Track B (consultation funnel) on day 1, or later?
- **Interior-page breadcrumb** — remove (recommended) or keep?

---

## 📋 CUTOVER RUNBOOK

Full step-by-step guide in `CUTOVER_ENV_CHECKLIST.md`:

1. **Pre-flight:** Set env vars, migrate videos, test forms
2. **Go-live:** Final staging check → set `NEXT_PUBLIC_SITE_INDEXABLE=true` → DNS cutover
3. **Post-cutover:** Monitor for 48 hours, submit sitemap to GSC

---

## 🚀 DEPLOYMENT TRACK

### Before DNS (Development)
- [ ] Vercel env vars set (Production + Preview)
- [ ] Video + PDF migrated to Blob
- [ ] Forms tested on staging
- [ ] Mobile audit re-run (if layout changed)

### DNS Cutover (Last step)
- [ ] Add `estateplanningdfw.law` (apex + www) to Vercel
- [ ] Set as production domain
- [ ] Update registrar to Vercel nameservers

### After DNS (Go-live)
- [ ] Verify live domain
- [ ] Submit sitemap to GSC
- [ ] Monitor runtime logs + form delivery

---

## 📊 PROJECT STATUS

| Track | Component | Status | Notes |
|-------|-----------|--------|-------|
| A | Marketing site | ✅ 95% done | Pages, blog, reviews, forms complete. Just needs: env vars, video migration, DNS |
| B | Consultation funnel | ✅ Built (demo) | Ready to go live with Stripe keys + Cal.com link |
| B | Learning center | ✅ Built | 6 personas, searchable topics |
| B | Quizzes | ✅ Built | 3 quizzes (trust, probate, estate plan) |
| B | Client portal | ✅ New | Document storage foundation (just merged) |
| B | Admin dashboard | ✅ Built | Protected by Supabase auth |
| — | Clio integration | ⚠️ Partial | OAuth ready; production creds needed |
| — | Ghost (SMS/email) | ⚠️ Partial | Built but not wired to funnel yet |
| — | E-signatures | ❌ Not started | Out of scope for MVP |

---

## 📝 DOCUMENTATION

- `CUTOVER_ENV_CHECKLIST.md` — Full Vercel env var reference + runbook
- `NEXT_STEPS.md` — This file
- `CLAUDE.md` — Original intake engine architecture (still relevant)
- `AUDIT_REPORT.md` — Full spec vs. codebase audit (generated below)

---

## 💬 Questions?

- **Haron:** Vercel access, Blob token, deployment strategy
- **Joseph:** Domain registration, registrar access, DNS configuration
- **Firm:** Lead destination, webinar details, privacy policy, go-live decisions

---

## 🎯 SUCCESS CRITERIA (Cutover)

- [ ] `estateplanningdfw.law` points to Vercel
- [ ] All pages render without 404s or broken media
- [ ] Guide form sends real emails to firm inbox
- [ ] Webinar form captures leads
- [ ] `robots.txt` allows Google indexing
- [ ] Sitemap resolves at `/sitemap.xml`
- [ ] No Scorpion platform remains (firm owns domain, no residual ads/listings)
- [ ] Vercel runtime logs are clean (no errors, form delivery working)

---

**Ready to proceed. Await Haron's env var setup + Joseph's video migration.**

---

## ✅ FINAL QA LOG (Family F — logged, not fixed; verify before launch)

1. **RevealScript production hydration** — the React dev warning "Encountered a script tag
   while rendering React component" comes from `RevealScript` in the SHARED `SiteChrome`
   (site-wide, not 404-specific). During the homepage pixel pass / final QA, VERIFY the
   force-reveal actually fires in a PRODUCTION build (`next build && next start`), not just
   in dev capture — "reveal works in dev" ≠ confirmed in production hydration. If the
   reveal is only a capture-time helper production doesn't need, confirm that explicitly.
2. **Search index 192 vs 190 posts** — `public/search-index.json` counts 192 blog entries
   vs the canonical 190 posts. Reconcile during final QA (duplicates / drafts / index +
   archive double-count / miscount?).
3. **probate-quiz → native quiz scoring sign-off (CLIENT TRACK, before cutover)** — the
   original's indexed `/probate-quiz` (a Google-Forms embed) now 301s to the native
   `/learn/quizzes/do-you-need-probate`. That native quiz's SCORING LOGIC is gated on
   Justin's quiz-scoring sign-off (open client-track item) — so his sign-off on the
   native quiz scoring now ALSO covers the probate-quiz redirect destination. Don't ship
   the cutover until the native quiz scoring is signed off.

## 🎨 PIXEL-FAITHFUL PASS — Open Items (Phase 0–4 rig)

Flagged for decision, not resolved in code (except where noted). Ordered by impact. The visual-diff
rig lives in `scripts/visual-diff/`; findings in `docs/reference/{visual-parity-assessment,route-parity,cutover-parity}.md`.

### 1. Interior template structural parity (biggest item)
Token parity is exact (Phase 2, validated), but **no template reaches the <1% full-page pixel
tolerance** and none can without structural rebuilds. Interior pages render from the legacy scrape
(`LegacyArticle`) as simplified articles — 40–60% the height of the original's full Scorpion
templates (`/estate-planning/` clone 5865px vs original 9558px). See `visual-parity-assessment.md`.

**Estate-planning proof done.** Asset-free structural additions (credential strip + slate CTA band,
now live on ~30 practice/geo pages) improved fidelity but *raised* the pixel diff — proving that
reaching <1% needs a **complete, section-aligned rebuild with the original's section images**, not
incremental additions. Those images must be migrated (same Vercel Blob path as the 12 hero videos —
**blocked on Joseph's Blob access**). One good practice-area rebuild then covers ~13 practice areas
+ ~66 geo pages.

**Decide:** commit to full image-aligned rebuilds (start when Blob access lands) vs. ship token +
SEO parity now. Homepage + shared chrome are already close.

### 2. Blog content strategy (open item #1)
189/190 sitemap posts resolve as legacy 200s. Gaps: the 2026-06-09 post (not in `blog-index`) and
36 `/blogs/categories/*` taxonomy pages (no route). **Decide:** publish-freeze vs. in-app admin vs.
sync script — each needs an import path + a `/blogs/categories/[cat]` route.

### 3. Chat dock replacement (open item #2)
Scorpion's chat widget is gone by design. **Decide** whether the quiz/intake CTA replaces it or a
chat product is added (lead-capture continuity).

### 4. Featured reviews — blessed list (open item #3)
`reviews.json` now has a `featured` flag (Phase 4); 8 marked as a default, homepage filters on it.
**Get the client's blessed 8** and move the flags.

### 5. Favicon / app icons
No `app/favicon.ico` / `app/icon.*`. Needs the client's brand icon. (404 page styled in Phase 4.)

### 6. Repo size / git-lfs
Phase 0 baseline screenshots are **~129M** in history; clone + diff images (**~530M**) are
gitignored and regenerable. **Recommend git-lfs** for committed image artifacts (or drop the
baseline and regenerate) — Vercel pulls the repo every build.

### How to re-run the rig
```bash
npx tsx scripts/visual-diff/capture.ts original     # baseline (committed)
npm run build && npm run start &                     # serve clone on :3000
npx tsx scripts/visual-diff/capture.ts clone         # capture clone
npx tsx scripts/visual-diff/diff.ts                  # -> diff-report/index.html
npx tsx scripts/visual-diff/route-parity.ts          # -> docs/reference/route-parity.md
```
