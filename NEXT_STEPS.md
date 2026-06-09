# Crain & Wooley — Next Steps for Cutover

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
