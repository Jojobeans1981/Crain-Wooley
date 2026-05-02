# Crain & Wooley — Automated Intake Engine
### FutureEng Development Log
**Partners:** Haron Wilson & Joseph Panetta
**Client:** The Law Office of Justin T. Crain d/b/a Crain & Wooley
**Started:** April 30, 2026
**Last Updated:** May 2, 2026

---

## What We're Building

A full-stack automated legal intake engine that replaces Justin's manual,
staff-heavy intake process with a system-driven pipeline. One $300 consultation
fee pays for 6+ months of hosting. The system runs 24/7 without headcount.

**The four engines:**
1. **Intake Gate** — Logic-driven forms that qualify and route leads automatically
2. **Payment Bridge** — $300 Stripe gate before any calendar slot is secured
3. **Ghost Assistant** — 4-day automated SMS/email nurture for unconverted leads
4. **Onboarding Accelerator** — Auto-creates matter, tasks, and folders in Clio the moment a client is hired

---

## Current Status

| Milestone | Status | Notes |
|---|---|---|
| Project scaffolding + design system | ✅ Complete | vault-dark theme |
| Multi-step intake form (4 steps) | ✅ Complete | |
| Lead qualification logic | ✅ Complete | Auto-disqualify |
| Stripe $300 payment gate | ✅ Complete | Webhook verified |
| Ghost Assistant — QStash nurture sequences | ✅ Complete | 4-day SMS/email |
| Durable jobs (retry-safe, locked, attempts) | ✅ Complete | |
| Audit/event log system | ✅ Complete | All events logged |
| Admin auth — Supabase magic link + roles | ✅ Complete | 3-tier RBAC |
| Sequence Control Center (admin UI) | ✅ Complete | Pause/resume/retry |
| Template editor (admin UI) | ✅ Complete | Live preview |
| Dead-letter failure view + retry | ✅ Complete | |
| Reliability polish | ✅ Complete | Backoff + idempotency + dead-letter |
| Compliance layer | ✅ Complete | TCPA-covered |
| Clio integration (contact → matter → tasks) | 🔄 Up Next | Needs Justin's API creds |
| SEO schema markup + performance | ⏳ Queued | |
| Admin dashboard KPI charts | ⏳ Queued | |
| End-to-end QA + staging deploy | ⏳ Queued | |

---

## Compliance Layer — What Shipped (May 2)

Full TCPA compliance across 6 changes:

**Schema**
- `Lead.optedOut Boolean @default(false)`
- `Lead.optedOutAt DateTime?`
- `@@index([phone])` for fast inbound SMS lookup
- Migration `add_compliance_fields` applied and clean

**Twilio Inbound Webhook** — `app/api/webhooks/twilio/inbound/route.ts`
- Validates Twilio signature on every request
- STOP / UNSUBSCRIBE / CANCEL / END / QUIT → opts out lead, cancels all
  PENDING sequences to SKIPPED, logs `OPTED_OUT` audit event, replies TwiML
- START → re-subscribes lead, logs `OPTED_IN`
- All other inbound → empty `<Response/>`

**Opt-Out Block** — `lib/twilio/sms.ts`
- DB lookup by phone before every outbound send
- If `optedOut === true` → marks sequence SKIPPED, logs
  `MESSAGE_BLOCKED_OPT_OUT`, throws `OPTED_OUT` — Twilio API never called
- Error propagates cleanly to cron catch block

**Message Footers** — `lib/ghost/sequences.ts`
- `appendSmsFooter()` — "Reply STOP to opt out." on every SMS (idempotent)
- `appendEmailFooter()` — unsubscribe URL appended to every email
- Applied in both `buildSequenceJobs` and `buildSequenceJobsFromTemplates`

**Unsubscribe Page** — `app/(intake)/unsubscribe/page.tsx`
- Server component, reads `?token=<leadId>`
- Opts out lead, cancels pending sequences, logs audit event
- Vault-dark styled confirmation — no auth required

**CSV Exports**
- `GET /api/admin/export/audit` — audit trail with joined lead name/email,
  filters by leadId / from / to / type — requires ADMIN role
- `GET /api/admin/export/leads` — full lead export with `optedOut` column,
  logs `LEADS_EXPORTED` audit event — requires ADMIN role
- Export buttons visible on admin dashboard header

---

## Tech Stack

```
Frontend:   Next.js 15 (App Router) + TypeScript + Tailwind CSS
Database:   Supabase (PostgreSQL) — SQLite locally via better-sqlite3
ORM:        Prisma
Auth:       Supabase Auth (admin magic link only)
Payments:   Stripe
SMS:        Twilio (outbound nurture + inbound STOP/START)
Email:      Resend
Scheduling: Clio Grow API
CRM:        Clio Manage API
Job Queue:  Upstash QStash
Deploy:     Vercel
```

---

## Design System — Vault Dark

All UI follows the **vault-dark** theme. Sharp corners, monospace data
labels, serif headings, gold accent on all interactive elements.

| Token | Color | Use |
|---|---|---|
| `vault-void` | `#0B0D11` | Page background |
| `vault-chamber` | `#111318` | Cards / surfaces |
| `vault-wall` | `#1A1D24` | Elevated panels / drawers |
| `vault-border` | `#2A2D35` | All borders |
| `vault-gold` | `#C5933A` | CTAs, active states, focus rings |
| `vault-parchment` | `#E8E2D6` | Primary text |
| `vault-steel` | `#6B7B8E` | Muted / label text |
| `vault-warn` | `#D95D39` | Errors, failed, disqualified, opt-out |
| `vault-safe` | `#3A7D5A` | Success, qualified, sent |

**Fonts:** Cormorant Garamond (display) + IBM Plex Mono (all labels/data/UI)
**Hard rule:** `rounded-none` on every interactive element. No exceptions.

---

## System Architecture

```
Client submits intake form
        │
        ▼
  Step 1–3: Contact + Matter + Qualification
        │
        ├──► Ghost Assistant starts (all leads)
        │         optedOut check on every send
        │         STOP keyword → instant opt-out
        │
   ┌────┴────┐
   │         │
QUALIFIED  DISQUALIFIED
   │
   ▼
Step 4: Stripe $300 Payment Gate
        │
        ▼
  checkout.session.completed (Stripe webhook)
        │
        ├──► Generate Clio scheduling link
        ├──► Cancel Ghost Assistant sequence
        └──► Send payment confirmation email
                │
                ▼
         Lead books consultation (Cal/Clio webhook)
                │
                ▼
         Admin marks HIRED in dashboard
                │
                ▼
         Clio: Contact → Matter → Task List  ← [UP NEXT]
```

---

## Database Models

```
Lead            — core record, full lifecycle + optedOut flag
AuditEvent      — every system event with type + metadata JSON
Sequence        — nurture message (attempts, backoff, externalId, consecutiveFailures)
NurtureTemplate — editable templates per day/channel
ClioToken       — OAuth token singleton (auto-refreshed)
AdminUser       — authorized accounts with role
```

### Lead Status Flow
```
PENDING → QUALIFIED → PAYMENT_INITIATED → PAID → SCHEDULED → HIRED
        ↘ DISQUALIFIED                                      ↘ LOST
```

### Sequence Status
```
PENDING → SENT
        ↘ FAILED    (retryable — exponential backoff)
        ↘ SKIPPED   (opted out / lead paid / sequence paused)
        ↘ CANCELLED (hired / lost / dead-letter threshold hit)
```

### Admin Role Hierarchy
```
SUPER_ADMIN  — full access + bulk ops + exports + role management
ADMIN        — pause/resume/retry, edit templates, update status, export CSV
VIEWER       — read-only access to all data
```

---

## Ghost Assistant — Reliability Summary

| Feature | Implementation |
|---|---|
| Exponential backoff | 5m → 10m → 20m → 40m ... capped at 24h |
| Idempotency | `externalId` on Sequence, checked before every send |
| Dead-letter threshold | Auto-cancel after 3 consecutive failures |
| SUPER_ADMIN alert | Email fired when sequence hits dead-letter |
| Opt-out block | DB lookup in `sendSMS()` — Twilio never called if opted out |
| Admin retry | Resets `consecutiveFailures` to 0 on manual retry |
| Template editing | Live in admin UI — merge tags: {{firstName}}, {{matterType}}, {{schedulingUrl}} |

---

## Key File Map

```
app/
├── (intake)/
│   ├── page.tsx                    — landing / hero
│   ├── intake/page.tsx             — multi-step form
│   └── unsubscribe/page.tsx        — email opt-out confirmation
├── (admin)/
│   ├── dashboard/page.tsx          — KPIs + CSV export buttons
│   ├── leads/page.tsx              — pipeline table + opt-out badge
│   └── ghost-assistant/
│       ├── page.tsx                — sequence control center
│       └── templates/page.tsx      — template editor
└── api/
    ├── intake/                     — form submit + qualify
    ├── checkout/session/           — Stripe session creation
    ├── webhooks/
    │   ├── stripe/                 — ⚠️ DO NOT TOUCH
    │   ├── qstash/                 — ⚠️ DO NOT TOUCH
    │   ├── cal/                    — ⚠️ DO NOT TOUCH
    │   └── twilio/inbound/         — STOP/START opt-out handler
    ├── ghost/cron/                 — ⚠️ DO NOT TOUCH
    ├── clio/                       — OAuth + scheduling + onboard
    └── admin/
        ├── me/                     — current role
        ├── leads/                  — pipeline CRUD
        ├── sequences/              — control center APIs
        ├── templates/              — template CRUD
        └── export/
            ├── audit/              — audit trail CSV
            └── leads/              — leads CSV

lib/
├── db/prisma.ts                    — Prisma singleton
├── auth/requireRole.ts             — API route guard
├── audit.ts                        — auditEvent() helper
├── reliability.ts                  — backoff, idempotency, dead-letter
├── ghost/sequences.ts              — QStash scheduling + footer injection
├── twilio/sms.ts                   — SMS send + opt-out guard
├── resend/email.ts                 — email send
├── clio.ts                         — Clio API + OAuth refresh
└── qualification.ts                — lead scoring logic
```

---

## What's Left (In Order)

### 1. Clio Integration — Blocked on clients credentials
**Needs from client:**
- Clio Developer App → Client ID + Secret
- Practice area IDs from his Clio account
- Standard onboarding task list for new matters
- Calendar event type name for scheduling links

**What we build:**
- `createContact()` → `createMatter()` → `createOnboardingTasks()` chain
- Triggered when admin sets lead status to HIRED
- Full test against Clio sandbox before production

### 2. SEO + Performance (Proposal §7)
- `LegalService` + `LocalBusiness` JSON-LD in `app/layout.tsx`
- Lazy-load Clio Grow embed via intersection observer
- `next-sitemap` XML sitemap generation
- 301 redirect map for migrated URLs
- Target: LCP < 2.5s mobile

### 3. Admin Dashboard — KPI Charts
- Recharts funnel chart showing drop-off per step
- Weekly digest email to SUPER_ADMIN

### 4. End-to-End QA + Staging Deploy
- Full flow: intake → payment → schedule → hired → Clio
- Stripe + Twilio webhooks verified on staging URL
- 10DLC registration approved (submit early — 1–5 business days)
- Env var audit (prod vs staging vs local)
- Admin account setup walkthrough with Justin

---

## Running Locally

```bash
npm install
npx prisma migrate dev
SEED_ADMIN_EMAIL=you@futureeng.io npx prisma db seed
npm run dev
```

| URL | Page |
|---|---|
| `localhost:3000` | Intake landing |
| `localhost:3000/intake` | Multi-step form |
| `localhost:3000/login` | Admin login |
| `localhost:3000/dashboard` | KPI overview |
| `localhost:3000/leads` | Lead pipeline |
| `localhost:3000/ghost-assistant` | Sequence control center |
| `localhost:3000/ghost-assistant/templates` | Template editor |

---

## Absolute Do Not Touch

```
app/api/ghost/cron/route.ts
app/api/webhooks/qstash/route.ts
app/api/webhooks/stripe/route.ts
app/api/webhooks/cal/route.ts
```

QStash/cron changes go through `lib/ghost/sequences.ts` and
`lib/reliability.ts` only. Never call QStash, Twilio, or Resend
clients directly in route handlers.

---

## Proposal Alignment

| Proposal Feature | System Component | Status |
|---|---|---|
| Instant lead response (<60s) | Ghost Assistant Day 0 email | ✅ |
| Self-service scheduling | Clio Grow integration | 🔄 |
| $300 consultation gate | Stripe payment bridge | ✅ |
| Automated onboarding (<60 min) | Clio matter + task creation | 🔄 |
| SMS/email nurture sequences | Ghost Assistant | ✅ |
| TCPA opt-out compliance | Twilio STOP + email unsubscribe | ✅ |
| Audit trail + data exports | CSV export endpoints | ✅ |
| Weekly funnel monitoring | Admin dashboard + digest | ⏳ |
| A/B conversion testing | Phase 2 | 📋 |
| SEO preservation + schema | §7 implementation | ⏳ |
| Search loop content strategy | Phase 2 | 📋 |

---

## Reference Docs

| File | Purpose |
|---|---|
| `CLAUDE.md` | AI context file — full architecture for Claude Code |
| `ACCOUNTS-SETUP.md` | Every third-party account — step-by-step setup |
| `prisma/schema.prisma` | Source of truth for all data models |

---

*FutureEng — Intake Systems & Revenue Automation*
*Haron Wilson & Joseph Panetta — Built for Crain & Wooley*