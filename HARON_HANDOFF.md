# Crain & Wooley Cutover Handoff — For Haron

**Status:** Code is ready. Marketing site + Firm Front product complete. Ready for Vercel env setup + video migration.

---

## TL;DR — 3 Blocking Actions

| # | Action | Owner | Timeline | Blocker? |
|---|--------|-------|----------|----------|
| 1 | Set Vercel env vars: `LEAD_NOTIFICATION_EMAIL`, `RESEND_*` (Prod + Preview) | Joseph | ASAP | ✅ YES — forms return 500 without this |
| 2 | Download 12 videos from `estateplanningdfw.law/media/`, upload to Vercel Blob, update URLs | Joseph | Before DNS cutover | ✅ YES — will 404 at cutover |
| 3 | Get firm to confirm: lead email, webinar times, privacy policy, go-live plan | Justin Crain | This week | — |

**Once #1 + #2 are done: redeploy staging → final spot-check → DNS cutover → live.**

---

## What's Built (Preview at https://crain-wooley-intake.vercel.app)

### Track A: Marketing Site ✅
- Homepage (hero, testimonials, reviews carousel)
- Blog (189 posts, searchable, paginated)
- Reviews page (204+ testimonials)
- Interior pages (practice areas, about, locations) via catch-all
- Guide download form → emails firm
- Webinar registration form → captures leads
- Full SEO parity (canonicals, schema, meta)
- Mobile verified (0 overflow at 390/768 px)

### Track B: Firm Front Product ✅
- Consultation funnel (4-step intake → Stripe payment → scheduling)
- Learning center (6 personas, searchable)
- 3 interactive quizzes (trust, probate, estate plan)
- Client portal (NEW: document access, request forms, upload)
- Admin dashboard (lead pipeline, template editor, sequence control)
- Clio integration scaffolded (needs production credentials)
- Ghost Assistant (SMS/email nurture) scaffolded (needs wiring)

---

## Key Documentation

**For implementation, read:**
- `CUTOVER_ENV_CHECKLIST.md` — All Vercel env vars + full 5-step runbook
- `NEXT_STEPS.md` — Summary of blocking tasks + owners

**In repo root:**
- `CLAUDE.md` — Original intake architecture (for reference)

---

## Vercel Environment Variables (BLOCKING)

### Marketing Forms (MUST HAVE BEFORE CUTOVER)
```
LEAD_NOTIFICATION_EMAIL = [firm inbox, e.g., intake@crainwooley.com]
RESEND_API_KEY          = [already set, confirm valid]
RESEND_FROM_EMAIL       = [already set, confirm sender verified in Resend]
```

Set on: **Production + Preview**

**Redeploy after setting**, then test:
- Guide form: should send email to `LEAD_NOTIFICATION_EMAIL`
- Webinar form: should capture fields

### Video Migration (MUST HAVE BEFORE DNS CUTOVER)
12 MP4s currently at `estateplanningdfw.law/media/*.mp4` → need Vercel Blob URLs
- `CWBOTH30.mp4` (homepage hero video) — gets `NEXT_PUBLIC_GUIDE_VIDEO_URL`
- 11 others → update `lib/legacy/legacy-pages.json` URLs

**Action:**
1. Request Vercel Blob access (if not already available)
2. Download all 12 from live Scorpion site (before DNS)
3. Upload to Blob
4. Set `NEXT_PUBLIC_GUIDE_VIDEO_URL` + update `legacy-pages.json`
5. Commit + redeploy

### Product Funnel (IF GOING LIVE WITH TRACK B)
If launching real bookings/payments on day 1:
```
NEXT_PUBLIC_DEMO_MODE = false
STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, STRIPE_PUBLISHABLE_KEY = LIVE keys
NEXT_PUBLIC_CAL_LINK = [your Cal.com link, e.g., crainwooley/consultation]
CLIO_CLIENT_ID, CLIO_CLIENT_SECRET = [production OAuth creds]
TWILIO_* = [confirm account + phone correct]
```

**Recommendation:** Go live with Track A (marketing site) first. Launch Track B (real payments) in a 2nd deployment after DNS is live. Reduces risk.

---

## Cutover Runbook (Step-by-Step)

### Pre-flight (Before DNS)
- [ ] Set env vars on Vercel (Prod + Preview): `LEAD_NOTIFICATION_EMAIL`, `RESEND_*`
- [ ] Redeploy to staging
- [ ] Test guide + webinar forms (should email firm)
- [ ] Download + migrate 12 videos to Blob
- [ ] Update `legacy-pages.json` + commit + redeploy
- [ ] Run mobile audit if layout changed: `node scripts/mobile-audit.mjs`

### Go-live (DNS Cutover)
- [ ] Final spot-check on staging (homepage, blog, reviews, forms)
- [ ] Set `NEXT_PUBLIC_SITE_INDEXABLE=true` in **Production only** (switches robots.txt to Allow)
- [ ] Redeploy to production
- [ ] **DNS Cutover (last step):**
  - Add `estateplanningdfw.law` (apex + www) to Vercel
  - Set as production domain
  - Update registrar nameservers to Vercel
- [ ] Verify live domain:
  - Pages render ✓
  - Forms work ✓
  - `robots.txt` allows indexing ✓
  - `/sitemap.xml` resolves ✓
  - Canonicals self-referential ✓

### Post-cutover (48 hours)
- [ ] Monitor Vercel logs for errors
- [ ] Confirm form deliverability (guide + webinar emails arriving)
- [ ] Submit sitemap to Google Search Console
- [ ] Confirm Scorpion is disconnected (firm owns domain)

---

## Firm Decisions Needed (Before Cutover)

Contact Justin Crain to confirm:

1. **Lead email destination** — Where should guide/webinar leads go?
   - Test inbox (for pre-cutover testing)?
   - Real firm inbox (for go-live)?

2. **Webinar registration details** — What times/dates should appear on form?
   - Currently: 12pm, 6:30pm
   - Need: real session dates

3. **Privacy policy** — Does existing policy need legal review before real PII flows through intake?

4. **Product go-live** — Launch consultation funnel (Track B) with marketing site, or later?
   - Same day (requires live Stripe/Cal/Clio creds today)
   - Later (can keep demo mode on for now)

5. **Interior-page breadcrumb** — Remove (recommended, matches live site) or keep?

---

## Git Status

**Last commit:** `6b558a4` (2 docs added)
**Previous:** `30fb6c8` (28 files: portal + onboarding)

✅ Working tree clean, origin current.

---

## Questions?

- **Vercel access / Blob setup:** Joseph
- **Domain / DNS config:** Joseph or domain registrar
- **Firm decisions:** Justin Crain
- **Technical details:** Reach out to the dev team

---

**TL;DR:** Code is done. Set env vars → migrate videos → test → cutover. Two docs in repo have full instructions.
