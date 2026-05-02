# Crain & Wooley — Intake Engine
## Third-Party Accounts & Credentials Setup Report
**Prepared by:** FutureEng (Haron Wilson & Joseph Panetta)
**For:** Justin T. Crain / Internal Team Use
**Date:** May 2, 2026

---

## Overview

The Automated Intake Engine connects to 8 external services. Each requires
an account, configuration, and credentials added to the system before going
live. This report documents exactly what is needed, who should own each
account, estimated cost, and step-by-step setup instructions.

**Total estimated monthly cost at launch: ~$97–$147/mo**
One $300 consultation booking covers 2–3 months of infrastructure.

---

## Account Summary

| Service | Purpose | Owner | Monthly Cost | Status |
|---|---|---|---|---|
| Supabase | Database + Admin Auth | FutureEng | Free → $25/mo | ⏳ Needed |
| Vercel | Hosting + Deployment | FutureEng | Free → $20/mo | ⏳ Needed |
| Stripe | Payment processing | client / Crain & Wooley | 2.9% + 30¢/txn | ⏳ Needed |
| Twilio | SMS nurture sequences | FutureEng | ~$15–30/mo | ⏳ Needed |
| Resend | Email delivery | FutureEng | Free → $20/mo | ⏳ Needed |
| Clio Grow | Scheduling | client (existing) | Existing plan | ⏳ API Access Needed |
| Clio Manage | Matter management | client (existing) | Existing plan | ⏳ API Access Needed |
| Upstash | Background job queue | FutureEng | Free → $10/mo | ⏳ Needed |

---

## 1. Supabase — Database & Admin Authentication

What it does: Hosts the PostgreSQL database (all leads, audit logs,
sequences, admin accounts). Also handles admin login via magic link email.

**Owner:** FutureEng. Transfer to client after handoff if desired.

**Cost:** Free tier covers launch. Upgrade to Pro ($25/mo) when
exceeding 500MB storage or needing daily backups.

**Setup Steps:**

1. Go to https://supabase.com
2. Sign up with GitHub or email
3. Create a new organization: "FutureEng" (or "Crain Wooley")
4. Create a new project:
   - Name: `crain-wooley-intake`
   - Database password: generate strong password — **SAVE THIS SECURELY**
   - Region: US East (N. Virginia)
5. Wait ~2 minutes for provisioning
6. Go to Project Settings → Database
7. Copy into `.env`:
   - Connection string (URI mode) → `DATABASE_URL`
   - Direct connection string → `DIRECT_URL`
8. Go to Project Settings → API
9. Copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon / public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - service_role key → `SUPABASE_SERVICE_ROLE_KEY`
   - ⚠️ **NEVER expose service_role key on the frontend**
10. Go to Authentication → URL Configuration
    - Site URL: `https://intake.crainwooley.com`
    - Add redirect URL: `https://intake.crainwooley.com/auth/callback`
11. Go to Authentication → Email Templates
    - Customize magic link email with Crain & Wooley branding

Seed first admin account after deploy:
```bash
SEED_ADMIN_EMAIL=joe@futureeng.io npx prisma db seed
```

---

## 2. Vercel — Hosting & Deployment

What it does: Hosts the Next.js application. Auto-deploys on every
GitHub push. Manages environment variables securely.

**Owner:** FutureEng during build. Can transfer to client post-handoff.

**Cost:** Free tier works for launch. Pro ($20/mo) needed for custom
domain and team access.

**Setup Steps:**

1. Go to https://vercel.com
2. Sign up / log in with GitHub
3. Click "Add New Project"
4. Import the `crain-wooley-intake` GitHub repository
5. Framework preset auto-detects: Next.js ✓
6. Under "Environment Variables":
   - Add ALL variables from the env list at the bottom of this doc
   - Set for Production, Preview, AND Development environments
7. Click Deploy
8. Once deployed:
   - Go to Project Settings → Domains
   - Add: `intake.crainwooley.com`
   - Vercel provides DNS records to add to client's registrar

**Domain setup — client does this:**

Log into wherever `crainwooley.com` is registered
(GoDaddy, Namecheap, Google Domains, Cloudflare, etc.)

Add a CNAME record:
```
Name:   intake
Value:  crl.vercel-dns.com
```

This creates `intake.crainwooley.com` → the app.
Takes up to 48 hours to propagate.

---

## 3. Stripe — Payment Processing

What it does: Collects the $300 consultation fee upfront.
Sends a webhook when payment confirms, which triggers the
scheduling link and cancels the nurture sequence.

**Owner: client / Crain & Wooley.**
Money goes to the firm's bank account. FutureEng must NOT own this.

**Cost:** No monthly fee. 2.9% + $0.30 per transaction.
On a $300 consult: ~$9 fee → firm receives ~$291.

**client does this:**

1. Go to https://stripe.com → "Start now"
2. Create account with firm email address
3. Complete business verification:
   - Business type: Professional Services / Law Firm
   - EIN (Federal Tax ID)
   - Business bank account for payouts
4. After verification, go to Dashboard
5. Create the consultation product:
   - Products → Add Product
   - Name: "Initial Consultation"
   - Price: $300.00, one-time payment
   - Copy the Price ID (starts with `price_...`) → `STRIPE_CONSULT_PRICE_ID`
6. Get API keys:
   - Developers → API Keys
   - Publishable key → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - Secret key → `STRIPE_SECRET_KEY`
   - ⚠️ **Secret key NEVER goes in frontend code — Vercel env vars only**
7. Enable test mode during development
   - Test card: `4242 4242 4242 4242`, any future date, any CVC
8. Register webhook (do AFTER Vercel deploy):
   - Developers → Webhooks → Add endpoint
   - URL: `https://intake.crainwooley.com/api/webhooks/stripe`
   - Events:
     - `checkout.session.completed`
     - `payment_intent.payment_failed`
   - Copy Signing secret → `STRIPE_WEBHOOK_SECRET`

---

## 4. Twilio — SMS Messaging

What it does: Sends automated SMS nurture messages (Day 1 + Day 4).
Also receives inbound STOP/START keywords for TCPA compliance.

**Owner:** FutureEng. Can transfer after handoff.

**Cost:**
- Phone number: ~$1.15/mo
- Outbound SMS: ~$0.0079 each
- Estimated: 200 leads/mo × 2 SMS = ~$3.16 + $1.15 number = ~$5/mo
- Budget $15–30/mo to be safe

**Setup Steps:**

1. Go to https://twilio.com → Sign up
2. Verify email + phone number
3. Complete account setup:
   - Use case: Notifications / Alerts
   - Description: "Legal intake follow-up for law firm clients"
4. Buy a phone number:
   - Phone Numbers → Buy a Number
   - Country: United States
   - Capabilities: ✓ SMS
   - Choose area code matching firm location
   - Purchase (~$1.15/mo)
5. Copy the number (E.164 format: `+1XXXXXXXXXX`) → `TWILIO_PHONE_NUMBER`
6. Get credentials:
   - Account → API Keys & Tokens
   - Account SID → `TWILIO_ACCOUNT_SID`
   - Auth Token → `TWILIO_AUTH_TOKEN`
7. Configure inbound webhook (after Vercel deploy):
   - Phone Numbers → Manage → Active Numbers → click the number
   - Messaging Configuration:
     - A message comes in → Webhook (HTTP POST)
     - URL: `https://intake.crainwooley.com/api/webhooks/twilio/inbound`
   - Save

**⚠️ 10DLC Registration — Required for US Business SMS:**

US carriers require business senders to register.
Without this, messages get filtered or blocked silently.
**Submit this EARLY — approval takes 1–5 business days.**

In Twilio Console → Messaging → Regulatory Compliance:

Step 1 — Register Brand:
- Business name: Crain & Wooley
- EIN: (client provides)
- Business type: Legal Services
- Website: crainwooley.com

Step 2 — Register Campaign:
- Use case: "Low Volume Mixed" or "Notifications"
- Sample message 1: Day 1 SMS template
- Sample message 2: Day 4 SMS template

Step 3 — Link campaign to phone number

Cost: ~$4/mo campaign fee (billed by Twilio)

---

## 5. Resend — Email Delivery

What it does: Sends all automated emails — intake confirmation,
payment receipt, nurture emails, consultation reminder, onboarding welcome.

**Owner:** FutureEng. Recommend transferring sending domain to client post-launch.

**Cost:** Free tier: 3,000 emails/mo, 100/day — sufficient for launch.
Pro ($20/mo): 50,000 emails/mo when volume grows.

**Setup Steps:**

1. Go to https://resend.com → Sign up
2. Go to Domains → Add Domain
   Enter: `crainwooley.com`
3. Resend provides DNS records — send these to client to add:
   - SPF TXT record
   - DKIM CNAME record
   - DMARC TXT record (see DNS summary below)
   - ⚠️ **Without domain verification, emails land in spam**
4. Verification takes 24–48 hours
5. Once verified:
   - API Keys → Create API Key
   - Name: `crain-wooley-intake-production`
   - Permission: Sending access
   - Copy key → `RESEND_API_KEY`
6. Sending address:
   - `RESEND_FROM_EMAIL = intake@crainwooley.com`
   - (Must match the verified domain)

---

## 6. Clio Grow — Scheduling Integration

What it does: Generates the scheduling links sent to leads after
they pay the $300 fee. Syncs with client's actual calendar availability.

**Owner:** client. He already has Clio — we just need API access.

**⚠️ This is the #1 blocker for the next development milestone.**

**client does this:**

1. Log into https://app.clio.com
2. Go to Settings → Developer Applications
3. Click "Create Application"
   - Name: FutureEng Intake Engine
   - Redirect URI: `https://intake.crainwooley.com/api/clio/callback`
   - Scopes to enable:
     - `contacts:read`
     - `contacts:write`
     - `matters:read`
     - `matters:write`
     - `calendar:read`
     - `tasks:write`
4. Copy and send to FutureEng **SECURELY** (not email):
   - Client ID → `CLIO_CLIENT_ID`
   - Client Secret → `CLIO_CLIENT_SECRET`
   - Use 1Password, Signal, or add directly to Vercel env vars
5. After deployment, client visits:
   `https://intake.crainwooley.com/api/clio/connect`
   Clicks "Authorize" — links his Clio account.
   System stores and auto-refreshes the token going forward.

**Also need from client:**
- Calendar event type name (for scheduling link generation)
- Default practice area names as configured in his Clio account
  (so we can map: Personal Injury → Clio practice area ID, etc.)
- Standard onboarding task list for new matters
  (tasks that should auto-create when a client is marked Hired)

---

## 7. Clio Manage — Matter & Case Management

What it does: Auto-creates client contact records, matters, and
onboarding task lists the moment a lead is marked "Hired" in the
admin dashboard. No manual data entry by staff.

**Owner:** client. Same Clio account — no additional setup beyond §6.

**What we need from client:**
- List of practice areas as named in his Clio account
- Default matter description template (we pre-fill from intake data)
- Standard folder structure for new client matters
  (we replicate this as an auto-generated task checklist)

---

## 8. Upstash QStash — Background Job Queue

What it does: The scheduling engine behind the Ghost Assistant.
Queues delayed SMS and email sends across the 4-day nurture sequence.
Handles retries with exponential backoff automatically.

**Owner:** FutureEng.

**Cost:** Free tier: 500 messages/day — sufficient for launch.
Pay-as-you-go beyond: ~$1 per 10,000 messages.

**Setup Steps:**

1. Go to https://upstash.com → Sign up with GitHub or email
2. Navigate to QStash in the left sidebar
3. Go to API Keys tab
4. Copy:
   - `QSTASH_URL` (https://qstash.upstash.io)
   - Token → `QSTASH_TOKEN`
   - Current Signing Key → `QSTASH_CURRENT_SIGNING_KEY`
   - Next Signing Key → `QSTASH_NEXT_SIGNING_KEY`
5. No additional configuration needed —
   the app handles all scheduling logic internally

---

## DNS Records Summary

All records go into wherever `crainwooley.com` is registered.
client (or his web person) adds these.

```
TYPE    NAME                    VALUE
────────────────────────────────────────────────────────────────────
CNAME   intake                  crl.vercel-dns.com
                                (routes intake.crainwooley.com → app)

TXT     @                       (SPF value from Resend dashboard)
                                (authorizes Resend to send from domain)

CNAME   resend._domainkey       (DKIM value from Resend dashboard)
                                (email authentication)

TXT     _dmarc                  v=DMARC1; p=none;
                                (prevents spoofing — improves deliverability)
```

⚠️ DNS propagation takes 24–48 hours. Plan this before any launch date.

---

## Complete Environment Variable List

Add all of these to Vercel → Project Settings → Environment Variables
AND to your local `.env` file for development.

```env
# ── Supabase ─────────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=
DIRECT_URL=

# ── Stripe ───────────────────────────────────────────
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_CONSULT_PRICE_ID=

# ── Twilio ───────────────────────────────────────────
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

# ── Resend ───────────────────────────────────────────
RESEND_API_KEY=
RESEND_FROM_EMAIL=intake@crainwooley.com

# ── Clio ─────────────────────────────────────────────
CLIO_CLIENT_ID=
CLIO_CLIENT_SECRET=
CLIO_REDIRECT_URI=https://intake.crainwooley.com/api/clio/callback

# ── Upstash QStash ───────────────────────────────────
QSTASH_URL=https://qstash.upstash.io
QSTASH_TOKEN=
QSTASH_CURRENT_SIGNING_KEY=
QSTASH_NEXT_SIGNING_KEY=

# ── Application ──────────────────────────────────────
NEXT_PUBLIC_BASE_URL=https://intake.crainwooley.com
SEED_ADMIN_EMAIL=joe@futureeng.io
```

---

## Action Items by Person

**client (Crain & Wooley)**

- [ ] Create Stripe account + verify business + add bank account
- [ ] Create $300 "Initial Consultation" product in Stripe
- [ ] Send Stripe API keys to FutureEng securely
- [ ] Log into Clio → Settings → Developer Applications → create app
- [ ] Send Clio Client ID + Secret to FutureEng securely
- [ ] Provide DNS access (or forward DNS records to web person)
- [ ] Add DNS records for Vercel + Resend (4 records total)
- [ ] Provide standard onboarding task list for new matters
- [ ] Provide practice area names from Clio account
- [ ] Confirm preferred phone area code for Twilio number
- [ ] Authorize Clio OAuth connection (one click — FutureEng walks him through)

**FutureEng (Haron + Joe)**

- [ ] Create Supabase project + copy credentials to Vercel
- [ ] Create Vercel project + connect GitHub repo + first deploy
- [ ] Create Twilio account + buy phone number + configure inbound webhook
- [ ] Submit 10DLC brand + campaign registration (start this Day 1 — takes up to 5 days)
- [ ] Create Resend account + send DNS records to client
- [ ] Create Upstash account + copy QStash credentials to Vercel
- [ ] Add all env vars to Vercel (production + preview + development)
- [ ] Complete Clio OAuth flow with client present
- [ ] Register Stripe webhook on production URL
- [ ] Run end-to-end test: intake → payment → schedule → hire → Clio
- [ ] Set up client's admin account + walk him through dashboard

---

## Recommended Setup Order

```
Day 1 — FutureEng
  ├── Create Supabase project
  ├── Create Vercel project + connect repo + first staging deploy
  ├── Create Upstash + copy QStash credentials
  ├── Create Resend account + generate DNS records
  └── Submit Twilio 10DLC registration ← start clock on approval wait

Day 1 — client
  ├── Receive DNS records from FutureEng
  └── Add all 4 DNS records to domain registrar

Day 2 — FutureEng
  ├── Twilio phone number purchased + inbound webhook configured
  └── All env vars added to Vercel → full staging deploy

Day 2 — client
  ├── Create Stripe account + complete business verification
  ├── Create $300 consultation product
  └── Create Clio Developer App + send credentials to FutureEng

Day 3 — FutureEng
  ├── Clio credentials added to Vercel
  ├── Complete Clio OAuth with client
  ├── Stripe webhook registered on staging URL
  └── Resend DNS verified (if 48hrs have passed)

Day 4 — FutureEng + client
  └── End-to-end test on staging — full intake → Clio flow

Day 5 — FutureEng
  ├── intake.crainwooley.com DNS propagated → point to production
  ├── Update Stripe + Twilio webhooks to production URL
  └── client admin account created + dashboard walkthrough

Day 6+ — Pending Twilio
  └── 10DLC approved → SMS unblocked → Ghost Assistant fully live
```

---

## Security Notes

- Never share API keys over email or Slack DM
- Use 1Password shared vault, Signal, or add directly to Vercel env vars
- Stripe secret key and Supabase service role key are the most sensitive —
  treat like passwords to a bank account
- All webhook endpoints verify cryptographic signatures — do not disable
- Clio OAuth token is stored in the database and auto-refreshes — never hardcode it

---

*FutureEng — Intake Systems & Revenue Automation*
*Prepared for internal use — Haron Wilson & Joseph Panetta*
