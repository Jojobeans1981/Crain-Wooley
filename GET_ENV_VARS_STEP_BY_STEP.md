# WHERE TO GET EACH ENV VAR — Step-by-Step

## 1. `LEAD_NOTIFICATION_EMAIL`

**You don't GET this. You DECIDE it.**

**Ask:** Haron or Justin Crain

**Question:** "Where should guide/webinar leads email go?"

**Likely answers:**
- `intake@crainwooley.com` (firm main inbox)
- `haron@futureeng.com` (ops)
- `justin@crainwooley.com` (attorney)

**Once you know:** Write it down, use that value.

---

## 2. `RESEND_API_KEY`

**Where to GET it:**

1. **Go to:** https://resend.com/dashboard
2. **Log in** with the Crain & Wooley account (ask Haron if you don't have access)
3. **Look for:** Left sidebar → "API Keys" or "Settings" → "API Keys"
4. **Copy:** The key that looks like: `re_1234567890abcdef...`

**If you can't find it:**
- Ask Haron: "Can you send me the Resend API key?"
- Or check local `.env.local` file in the Crain-Wooley folder:
  ```
  grep RESEND_API_KEY C:\Users\beame\Desktop\Crain-Wooley\.env.local
  ```

**Once you have it:** Paste into Vercel.

---

## 3. `RESEND_FROM_EMAIL`

**Where to GET it:**

**Same place as #2:**
1. Go to: https://resend.com/dashboard
2. Look for: "Domains" or "Senders"
3. You should see a verified email like: `intake@crainwooley.com`

**Important:** The email MUST be verified (should have a green checkmark ✓)

**If not verified:**
- Click "Verify" in Resend
- Resend sends a verification email
- Click the link in that email
- Come back and confirm it's verified

**Once verified:** Use that email address.

---

## 4. `PORTAL_LINK_SECRET`

**You GENERATE this (no account needed):**

### Option A: Use Node.js (easiest)
1. Open terminal/PowerShell
2. Paste this:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
3. Hit Enter
4. You'll get output like:
   ```
   a7f3e9c1b2d8f4a6c9e1b3d5f7a9c2e4d6f8a0b2c4e6f8a0b2c4e6f8a0b2c
   ```
5. **Copy that** → paste into Vercel

### Option B: Use PowerShell (on Windows)
1. Open PowerShell
2. Paste this:
   ```powershell
   [Convert]::ToBase64String([byte[]]$(Get-Random -Count 32))
   ```
3. Hit Enter
4. Copy the output → paste into Vercel

### Option C: Use online generator (no terminal)
1. Go to: https://1password.com/password-generator/
2. Set length to 32+
3. Generate
4. Copy → paste into Vercel

**Once you have it:** Use that random string as `PORTAL_LINK_SECRET`.

---

## 5. `NEXT_PUBLIC_GUIDE_VIDEO_URL`

**You GET this AFTER uploading videos to Vercel Blob.**

**When:** After you (Joseph) migrate the 12 videos to Vercel Blob

**Where to GET it:**

1. **Upload videos to Vercel Blob:**
   - You need Vercel Blob access (ask Haron for token/access)
   - Follow Vercel docs: https://vercel.com/docs/storage/vercel-blob

2. **After upload, you'll get URLs like:**
   ```
   https://cwboth30-xxxxxxxxxxxxx.blob.vercel-storage.com/CWBOTH30.mp4
   https://business-continuity-i-xxxxx.blob.vercel-storage.com/Business-Continuity-Planning-I.mp4
   ```

3. **Copy the CWBOTH30 URL** → use as `NEXT_PUBLIC_GUIDE_VIDEO_URL`

4. **Update `lib/legacy/legacy-pages.json`** with all 12 Blob URLs

**Once done:** Set in Vercel.

---

## 📍 VERCEL: WHERE TO SET THEM

Once you have the values:

1. **Go to:** https://vercel.com
2. **Log in** with your account (or Crain-Wooley account)
3. **Click:** "Crain-Wooley" project
4. **Go to:** Settings (gear icon, top right)
5. **Click:** "Environment Variables" (left sidebar)
6. **Click:** "Add New" or click the var name to edit
7. **Fill in:**
   - Name: `LEAD_NOTIFICATION_EMAIL`
   - Value: (whatever you decided)
   - Environments: Check **Production** + **Preview** ✓
8. **Click:** "Save"
9. **Repeat for:** `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `PORTAL_LINK_SECRET`

---

## 🎯 SUMMARY: WHERE TO GO

| Var | Website | Account | What to look for |
|-----|---------|---------|------------------|
| `LEAD_NOTIFICATION_EMAIL` | N/A | Ask Haron | Firm inbox address |
| `RESEND_API_KEY` | https://resend.com/dashboard | Resend | Left sidebar → API Keys |
| `RESEND_FROM_EMAIL` | https://resend.com/dashboard | Resend | Domains / Senders → verified email |
| `PORTAL_LINK_SECRET` | Terminal / PowerShell | None | Generate with `node` command |
| `NEXT_PUBLIC_GUIDE_VIDEO_URL` | Vercel Blob | Vercel | After uploading videos |
| All others | Vercel | Already set | Don't touch |

---

## 🚨 IF YOU DON'T HAVE ACCESS

Ask Haron for:
- Resend API key (if you can't log in)
- Resend verified sender email
- Vercel project access (to set env vars)
- Vercel Blob token (to upload videos)

---

## ✅ CHECKLIST

- [ ] **LEAD_NOTIFICATION_EMAIL:** Ask Haron, write it down
- [ ] **RESEND_API_KEY:** Log in to Resend, copy from dashboard
- [ ] **RESEND_FROM_EMAIL:** Same Resend dashboard, verify it's green ✓
- [ ] **PORTAL_LINK_SECRET:** Run `node` command in terminal, copy output
- [ ] **Go to Vercel:** Settings → Environment Variables
- [ ] **Set all 4 on Production + Preview**
- [ ] **Redeploy staging**
- [ ] **Test guide form** (should email)
- [ ] **NEXT_PUBLIC_GUIDE_VIDEO_URL:** After video migration

---

## 🆘 STUCK?

- **Can't log in to Resend?** → Ask Haron for credentials or access
- **Don't have Vercel access?** → Ask Haron to add you as a collaborator
- **Node command doesn't work?** → Use the 1password.com generator instead
- **Not sure which email for LEAD_NOTIFICATION_EMAIL?** → Ask Justin Crain directly

---

## 📞 CONTACTS

| Need | Contact |
|------|---------|
| Resend credentials | Haron Wilson |
| Vercel access | Haron Wilson |
| Vercel Blob token | Haron Wilson |
| Lead email destination | Justin Crain |
| Anything else | Haron Wilson |

---

**That's it. Very literal, very specific. Go get 'em! 🎯**
