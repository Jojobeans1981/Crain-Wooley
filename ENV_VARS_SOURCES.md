# Vercel Environment Variables — Where They Come From

## 🎯 TL;DR

| Var | Source | Status | Action |
|-----|--------|--------|--------|
| `LEAD_NOTIFICATION_EMAIL` | You decide (firm inbox) | ❌ Empty | Set it: `intake@crainwooley.com` or similar |
| `RESEND_API_KEY` | Resend dashboard | ✅ Already set (check) | Verify it's valid + same as local |
| `RESEND_FROM_EMAIL` | Resend dashboard | ✅ Already set | Verify sender is verified in Resend |
| `PORTAL_LINK_SECRET` | Generate new | ❌ New | Generate random 32+ char string |
| `NEXT_PUBLIC_GUIDE_VIDEO_URL` | Vercel Blob (after migration) | ❌ TBD | Set after uploading CWBOTH30.mp4 to Blob |
| All others | Already in Vercel | ✅ Unchanged | Don't touch |

---

## 📍 ENV VAR SOURCES (Detailed)

### 1️⃣ `LEAD_NOTIFICATION_EMAIL` 
**Where it comes from:** 🎯 You decide (firm's choice)

This is the email address where guide/webinar lead submissions go.

**Options:**
- `intake@crainwooley.com` ← main firm inbox
- `haron@futureeng.com` ← ops team
- `test+cw@example.com` ← test inbox (for pre-cutover testing)

**Action:** 
1. Ask Justin Crain or Haron: "Where should leads from the website go?"
2. Set in Vercel (Production + Preview): `LEAD_NOTIFICATION_EMAIL = [their answer]`

**Current state:** Empty (falls back to `SEED_ADMIN_EMAIL`)

---

### 2️⃣ `RESEND_API_KEY` & `RESEND_FROM_EMAIL`
**Where they come from:** 📧 Resend account (existing)

Resend is the email provider. You (or Haron) already have an account set up.

**How to verify:**
1. Go to https://resend.com/dashboard
2. Find your API key (looks like `re_xxxxxxxxxxxxx`)
3. Verify the "From" email is verified (should be `intake@crainwooley.com` or similar)

**Action:**
1. Confirm these are already set in Vercel (they likely are from the original setup)
2. If not, copy them from local `.env.local` to Vercel:
   ```
   RESEND_API_KEY = [from Resend dashboard]
   RESEND_FROM_EMAIL = [verified sender, e.g., intake@crainwooley.com]
   ```

**Current state:** Likely already set (check Vercel > Settings > Environment Variables)

---

### 3️⃣ `PORTAL_LINK_SECRET` 
**Where it comes from:** 🔐 You generate it (new)

This is a random secret key that signs the secure portal links. It's NEW and doesn't exist yet.

**How to generate:**
```bash
# Option 1: Use Node.js (paste in terminal)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Option 2: Use PowerShell
[Convert]::ToBase64String([byte[]]$(Get-Random -Count 32))

# Option 3: Use online generator
# https://1password.com/password-generator/
# Generate 32+ character random string, no special chars needed
```

**Example outputs:**
```
a7f3e9c1b2d8f4a6c9e1b3d5f7a9c2e4
```

**Action:**
1. Generate a random 32+ character string (above)
2. Set in Vercel (Production + Preview): `PORTAL_LINK_SECRET = [generated string]`

**Current state:** Doesn't exist (new for portal feature)

---

### 4️⃣ `NEXT_PUBLIC_GUIDE_VIDEO_URL`
**Where it comes from:** 🎬 Vercel Blob (after you migrate videos)

This is the URL to the CWBOTH30.mp4 video after uploading to Vercel Blob.

**How to get it:**
1. You (Joseph) upload 12 videos to Vercel Blob
2. Vercel gives you a Blob URL for each, like:
   ```
   https://cwboth30-xxxxxxxxxxxxx.blob.vercel-storage.com/CWBOTH30.mp4
   ```
3. Copy the URL for CWBOTH30.mp4
4. Set in Vercel: `NEXT_PUBLIC_GUIDE_VIDEO_URL = [the Blob URL]`

**Action:**
- After video migration, update this var
- Then commit `lib/legacy/legacy-pages.json` with updated video URLs

**Current state:** Not set (videos still point to Scorpion domain)

---

### 5️⃣ `NEXT_PUBLIC_SITE_INDEXABLE`
**Where it comes from:** 🎯 You decide (set at DNS cutover)

This controls whether search engines can index the site.

**Values:**
- Not set (or `false`) → `robots.txt` says `Disallow: /` (staging)
- `true` → `robots.txt` says `Allow: /` (production, at cutover)

**Action:**
- Set ONLY in Production environment
- Set ONLY at DNS cutover time (not before)
- `NEXT_PUBLIC_SITE_INDEXABLE = true`

**Current state:** Not set (staging is noindex, which is correct)

---

### 6️⃣ All Other Env Vars
**Where they come from:** ✅ Already exist in Vercel

These are set from the original deployment:

```
DATABASE_URL              → Supabase/Postgres connection
NEXT_PUBLIC_SUPABASE_URL  → Supabase project URL
SUPABASE_SERVICE_ROLE_KEY → Supabase auth
STRIPE_SECRET_KEY         → Stripe account (test keys currently)
STRIPE_WEBHOOK_SECRET     → Stripe webhooks
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY → Stripe frontend
CRON_SECRET               → Upstash QStash (for Ghost Assistant)
SEED_ADMIN_EMAIL          → Fallback admin email
RESEND_FROM_EMAIL         → Resend sender
```

**Action:** Don't touch these. They're correct.

---

## 🔄 Where to Set Them (Vercel)

**Path:**
```
Vercel Dashboard
  → Select "Crain-Wooley" project
  → Settings
  → Environment Variables
  → Add / Edit
```

**Set on both:**
- ✅ Production environment
- ✅ Preview environment

(Or check "Automatically expose System Environment Variables" for easier setup)

---

## ✅ Checklist: Where to Get Each Var

- [ ] **LEAD_NOTIFICATION_EMAIL** → Ask Haron / Justin: "Where should leads go?"
- [ ] **RESEND_API_KEY** → Resend dashboard (https://resend.com/dashboard)
- [ ] **RESEND_FROM_EMAIL** → Same Resend dashboard (verified sender)
- [ ] **PORTAL_LINK_SECRET** → Generate random string (node command above)
- [ ] **NEXT_PUBLIC_GUIDE_VIDEO_URL** → Set after Blob migration
- [ ] All others → Already in Vercel (don't change)

---

## 🚨 Common Mistakes

❌ **Don't:**
- Use different values in Production vs Preview
- Set `NEXT_PUBLIC_SITE_INDEXABLE=true` before DNS cutover
- Forget to verify `RESEND_FROM_EMAIL` in Resend (unverified senders don't send)
- Use the same secret for multiple apps

✅ **Do:**
- Keep `PORTAL_LINK_SECRET` secure (it's secret)
- Ask Haron if you're not sure about a value
- Test forms on staging after setting env vars
- Document which vars you set and when

---

## 📞 If You're Stuck

- **"Where's my Resend API key?"** → https://resend.com/dashboard (top right, API Keys)
- **"Where's my Stripe key?"** → https://dashboard.stripe.com (Developers > API Keys)
- **"Where's my Supabase connection?"** → Already in Vercel (don't change)
- **"What should LEAD_NOTIFICATION_EMAIL be?"** → Ask Haron / Justin

---

## Summary Table

| Var | Type | Source | Action | When |
|-----|------|--------|--------|------|
| `LEAD_NOTIFICATION_EMAIL` | Email | Decision | Set to firm inbox | Today |
| `RESEND_API_KEY` | Secret | Resend | Verify already set | Today |
| `RESEND_FROM_EMAIL` | Email | Resend | Verify already set | Today |
| `PORTAL_LINK_SECRET` | Secret | Generate | Generate + set | Today |
| `NEXT_PUBLIC_GUIDE_VIDEO_URL` | URL | Blob | Set after migration | This week |
| `NEXT_PUBLIC_SITE_INDEXABLE` | Boolean | Decision | Set at DNS cutover | Cutover day |
| All others | Various | Vercel | Don't touch | Never |
