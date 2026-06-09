# Crain & Wooley Cutover — Vercel Environment Variables

## Pre-cutover: Set these on Vercel (Production + Preview)

### 🚨 MARKETING FORMS (BLOCKING)

These gates the guide + webinar lead forms. Without these, forms return a 500 error on cutover.

| Variable | Current | Action | Vercel Env |
|----------|---------|--------|-----------|
| `LEAD_NOTIFICATION_EMAIL` | (empty — falls back to `SEED_ADMIN_EMAIL`) | Set to firm's inbox (or test inbox first) | Production + Preview |
| `RESEND_API_KEY` | Check `.env.local` or ask Haron | Confirm set + API key valid | Production + Preview |
| `RESEND_FROM_EMAIL` | `intake@crainwooley.com` (from `.env.example`) | **Verify sender is verified in Resend dashboard** | Production + Preview |

**Action:** Set these, then redeploy. Test guide form → should send email to `LEAD_NOTIFICATION_EMAIL`.

---

### 📹 VIDEO & PDF MIGRATION (BLOCKING)

12 MP4s currently point to `estateplanningdfw.law/media/*.mp4` (will 404 at cutover).

| File | Current | Action |
|------|---------|--------|
| `CWBOTH30.mp4` | Scorpion domain | Download from live, upload to Vercel Blob, get Blob URL → set `NEXT_PUBLIC_GUIDE_VIDEO_URL` |
| `Business-Continuity-Planning-I.mp4` | Scorpion domain | Download + upload to Blob |
| `Business-Continuity-Planning-II.mp4` | Scorpion domain | Download + upload to Blob |
| `Celebs-without-a-plan.mp4` | Scorpion domain | Download + upload to Blob |
| `Divorce-Proofing.mp4` | Scorpion domain | Download + upload to Blob |
| `DIY-Legal-Templates.mp4` | Scorpion domain | Download + upload to Blob |
| `08.01.2020-Radio-Show-Intro-to-Trusts-I.mp4` | Scorpion domain | Download + upload to Blob |
| `Intro-to-Trusts-II.mp4` | Scorpion domain | Download + upload to Blob |
| `07.11.2020-Radio-Show-Intro-to-Wills-I.mp4` | Scorpion domain | Download + upload to Blob |
| `07.18.2020-Radio-Show-Intro-to-Wills-II.mp4` | Scorpion domain | Download + upload to Blob |
| `Trusts-Probate.mp4` | Scorpion domain | Download + upload to Blob |
| `07-25-2020-Radio-Show-Life-Changes-and-Estate-Plan.mp4` | Scorpion domain | Download + upload to Blob |
| `free-estate-planning-guide.pdf` | `public/guides/` (7.9 MB, committed) | Optional: keep as-is OR move to Blob for git hygiene |

**Action:** 
1. Download all 12 MP4s before DNS cutover (while `estateplanningdfw.law` is still live)
2. Upload to Vercel Blob (ask Joseph for access / token)
3. Update `lib/legacy/legacy-pages.json` — replace video URLs with Blob URLs
4. Set `NEXT_PUBLIC_GUIDE_VIDEO_URL` = the CWBOTH30 Blob URL
5. Commit + push the updated `legacy-pages.json`

---

### 🎯 MARKETING FORMS ENV (PRODUCTION ONLY)

| Variable | Current | Action | Scope |
|----------|---------|--------|-------|
| `NEXT_PUBLIC_SITE_INDEXABLE` | Not set | Set `true` in Production ONLY at final go-live (switches `robots.txt` Disallow→Allow) | Production only |

**⚠️ DO NOT set on Preview** — keep Preview noindex until cutover.

---

### 🛒 PRODUCT FUNNEL (TRACK B) — IF LAUNCHING WITH MARKETING SITE

If going live with real bookings/payments on day 1:

| Variable | Current | Action | Notes |
|----------|---------|--------|-------|
| `NEXT_PUBLIC_DEMO_MODE` | `false` (check `.env.example`) | Confirm `false` before cutover | If `true`, payment/booking are demo only |
| `STRIPE_SECRET_KEY` | Check `.env.local` | Use **LIVE** Stripe keys (not test keys) | Production |
| `STRIPE_WEBHOOK_SECRET` | Check `.env.local` | Use **LIVE** webhook secret | Production |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Check `.env.local` | Use **LIVE** publishable key | Production |
| `NEXT_PUBLIC_CAL_LINK` | `crainwooley/consultation` (from `.env.example`) | Confirm the Cal.com link exists + is live | Production |
| `CLIO_CLIENT_ID` | (empty) | Set to **production Clio OAuth credentials** | Production |
| `CLIO_CLIENT_SECRET` | (empty) | Set to **production Clio OAuth credentials** | Production |
| `CLIO_ACCESS_TOKEN` | (empty) | Will be auto-filled on first OAuth flow | Generated at runtime |
| `TWILIO_ACCOUNT_SID` | Check `.env.local` | Confirm account + phone number correct | Production |
| `TWILIO_AUTH_TOKEN` | Check `.env.local` | Use live token | Production |
| `TWILIO_FROM_NUMBER` | Check `.env.local` | Confirm the SMS number is correct | Production |

**⚠️ RECOMMENDATION:** Launch Track A (marketing site) first. Once DNS is live + forms work, then enable Track B (real payments) in a 2nd deployment. This reduces go-live risk.

---

### 🔐 INFRASTRUCTURE (UNCHANGED BY CUTOVER)

These are already set; **do not modify:**

| Variable | Purpose | Status |
|----------|---------|--------|
| `DATABASE_URL` | Prisma connection (SQLite local / Postgres prod) | ✅ Unchanged |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | ✅ Unchanged |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key (public) | ✅ Unchanged |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role (private, server-only) | ✅ Unchanged |
| `CRON_SECRET` | Ghost Assistant cron token (Upstash QStash) | ✅ Unchanged |
| `SEED_ADMIN_EMAIL` | Fallback admin email | ✅ Unchanged |
| `NEXT_PUBLIC_APP_URL` / `NEXT_PUBLIC_BASE_URL` | App base URL | Update to production domain at cutover |

---

## Cutover Runbook

### Step 1: Pre-flight (any order, before DNS)
- [ ] Commit & push all code changes (✅ DONE — commit `30fb6c8`)
- [ ] Set `LEAD_NOTIFICATION_EMAIL` + `RESEND_*` on Vercel (Production + Preview)
- [ ] Redeploy to Vercel
- [ ] Test guide form submission → confirm email arrives at `LEAD_NOTIFICATION_EMAIL`
- [ ] Test webinar form submission → confirm fields come through

### Step 2: Video/PDF Migration
- [ ] Download all 12 MP4s from `estateplanningdfw.law/media/` (before DNS cutover!)
- [ ] Upload to Vercel Blob (request access if needed)
- [ ] Update `lib/legacy/legacy-pages.json` with Blob URLs
- [ ] Set `NEXT_PUBLIC_GUIDE_VIDEO_URL` = CWBOTH30 Blob URL on Vercel
- [ ] Commit + push updated `legacy-pages.json`
- [ ] Redeploy to Vercel

### Step 3: Mobile Re-check (if layout changed)
- [ ] Run `node scripts/mobile-audit.mjs` against production build
- [ ] Verify 0 overflow at 390 px and 768 px

### Step 4: Go-live Sequence (in order)
- [ ] Final spot-check on staging:
  - [ ] Homepage renders
  - [ ] Blog posts load
  - [ ] /blogs index + pagination works
  - [ ] /reviews shows all 200+ reviews
  - [ ] An interior page (e.g., /about, /practice-area/...) renders
  - [ ] Guide form works
  - [ ] Webinar form works
- [ ] Set `NEXT_PUBLIC_SITE_INDEXABLE=true` in **Production only** + redeploy
  - Switches `app/robots.ts`: `Disallow: /` → `Allow: /`
  - Exposes sitemap at `/sitemap.xml`
- [ ] **DNS Cutover** (last step):
  - Add `estateplanningdfw.law` (apex + www) to Vercel project
  - Set as production domain in Vercel
  - Update domain registrar to point to Vercel nameservers
- [ ] Verify on live domain:
  - [ ] Homepage loads
  - [ ] Forms submit for real
  - [ ] `robots.txt` allows indexing
  - [ ] `/sitemap.xml` resolves
  - [ ] Canonicals are self-referential (point to `estateplanningdfw.law`)
  - [ ] Top legacy URLs (e.g., `/about`, `/practice-areas/wills`) 301 correctly

### Step 5: Post-cutover (first 48 hours)
- [ ] Confirm Scorpion is disconnected (firm owns domain; no Scorpion-managed ads/listings remain)
- [ ] Monitor Vercel runtime logs for errors
- [ ] Monitor form/booking deliverability
- [ ] Submit sitemap to Google Search Console
- [ ] Spot-check redirects for top legacy URLs in GSC

---

## Open Decisions (Route to Firm)

Before cutover, confirm with Crain & Wooley:

1. **Lead email destination** — where should guide/webinar leads go?
   - Firm inbox? (set `LEAD_NOTIFICATION_EMAIL`)
   - Test inbox? (temporary during pre-cutover testing)

2. **Webinar registration details** — what session times should appear on the form?
   - Current options: 12pm, 6:30pm
   - Confirm dates + times, update form copy if needed

3. **Privacy policy** — does the existing privacy policy need counsel review before real PII flows?
   - If not: confirm no changes needed
   - If yes: when will legal review complete?

4. **Product go-live** — launching Track B (consultation funnel) with marketing site, or after?
   - If same day: confirm Stripe + Cal.com + Clio are production-ready
   - If later: keep `NEXT_PUBLIC_DEMO_MODE=true` for now

5. **Interior-page breadcrumb** — remove it (recommended), or keep it?
   - Current: breadcrumb present on interior pages
   - Spec note: live site has no breadcrumb
   - Recommendation: remove in a separate PR post-cutover (non-blocking)

---

## Vercel Deployment Checklist

```
☐ Production environment variables set (LEAD_NOTIFICATION_EMAIL, RESEND_*, etc.)
☐ Preview environment variables set (same as Production for testing)
☐ Video + PDF files migrated to Vercel Blob
☐ NEXT_PUBLIC_GUIDE_VIDEO_URL set to CWBOTH30 Blob URL
☐ git push origin main (all changes committed and pushed)
☐ Staging build deployed and tested
☐ Production domain added to Vercel (estateplanningdfw.law)
☐ Production domain set as default in Vercel project settings
☐ DNS records updated at registrar to point to Vercel
☐ NEXT_PUBLIC_SITE_INDEXABLE=true set in Production (not Preview)
☐ Final production build deployed
☐ Live domain verified (pages render, forms work, robots.txt allows indexing)
☐ Sitemap submitted to Google Search Console
☐ Scorpion platform confirmed disconnected
```

---

## Questions?

Contact Haron Wilson (FutureEng) for Vercel access + Blob setup.
Contact Joseph Panetta for deployment + domain configuration.
