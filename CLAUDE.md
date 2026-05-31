Crain & Wooley — Automated Intake Engine
CLAUDE.md — Project Context for Claude Code

Project Identity
Client: The Law Office of Justin T. Crain d/b/a Crain & Wooley
Partner: FutureEng (Haron Wilson & Joseph Panetta)
Purpose: Replace manual legal intake with a fully automated engine —
qualification, payment, scheduling, nurture, and onboarding.

Tech Stack
LayerTechnologyFrameworkNext.js 15 (App Router)LanguageTypeScript (strict mode)StylingTailwind CSS — vault-dark custom themeDatabaseSupabase (PostgreSQL)ORMPrismaAuthSupabase Auth (admin only — magic link)PaymentsStripeSMSTwilioEmailResendSchedulingClio Grow APICRMClio Manage APIJob QueueUpstash QStashDeploymentVercel

Design System — Warm Editorial (cf)
The app matches the approved intake design (wemovenewyork/crain-wooley-intake ·
option-counsel-final). Tokens live in lib/cf.ts and are mirrored into
tailwind.config.ts (the cw-*, cf.*, and legacy vault-* aliases all resolve to
these values) and app/globals.css. NOTE: the historical vault-dark theme has
been fully retired — the vault-* class names still exist but now map onto the
warm palette below, so old markup keeps working.

Color tokens (cf)
ink:        #2E414F   — primary slate (dark panel bg, primary buttons, headings)
ink-soft:   #3F576B   — button hover, secondary slate
text:       #1a2230   — body text (navy-tinted)
text-mute:  #6b6356   — muted/secondary text, labels
cream:      #faf5ea   — page background
ivory:      #f6f1e7   — card / surface
ivory-warm: #ede5d3   — accent blocks (with brass left edge)
brass:      #9A825E   — accent, kickers, focus rings, active progress
brass-dark: #7A6444   — brass hover
brass-light:#D5C0A2
rule:       rgba(26,34,48,0.14) — borders (elevation is border, not shadow)
rule-soft:  rgba(26,34,48,0.08) — faint dividers / progress track
danger:     #a23a2a   — errors / disqualified
success:    #3A7D5A   — success / qualified

Typography
font-display — arno-pro (Adobe Typekit kit zjv2lcl, loaded in app/layout.tsx),
               Cormorant Garamond bundled via next/font as fallback. Headings + firm name.
font-sans   — Inter (body, UI, labels)
font-mono   — JetBrains Mono (kickers, section counters, data)

Hard Rules

Square corners (border-radius 0) on buttons, inputs, cards. `full` reserved for radio dots.
Inputs are BOXED: white #fff bg, 1px solid rule border, brass focus ring (0 0 0 3px brass@13%).
Primary button: flat ink fill, cream text, uppercase 0.1em (NO gradient, NO pill).
Secondary button: transparent, 1px rule border, ink text.
Elevation via borders, never drop-shadow (shadow-cw-* keys are flattened to none).
Accent blocks: ivory-warm bg with a 2px brass left border.
Intake split-screen scaffold = components/intake/IntakeScaffold + IntakePanel.
  Layout (grid split, panel sticky, desktop-only blocks) is driven by the
  .cw-intake-* CSS classes in globals.css, NOT Tailwind arbitrary utilities —
  Tailwind v4 here does not reliably generate arbitrary responsive utilities.
Shared intake primitives + tokens: lib/cf.ts, components/intake/.

Architecture — What's Built
Public Intake Flow
Landing Page → Multi-Step Form (4 steps) → Stripe Payment Gate → Success / Scheduling

Step 1: Contact Info
Step 2: Matter Details
Step 3: Qualification Logic (auto-disqualify or pass)
Step 4: $300 Stripe payment before scheduling slot is confirmed

Ghost Assistant (Automated Nurture)

4-day SMS/email sequence via Upstash QStash
Day 0 (immediate): Email confirmation
Day 1: SMS follow-up
Day 2: Email — common questions
Day 4: SMS — final follow-up
Sequence auto-cancels when lead pays, schedules, or is marked LOST
Templates editable in admin — supports merge tags: {{firstName}}, {{matterType}}, {{firmName}}, {{schedulingUrl}}

Clio Integration

OAuth token stored in ClioToken model, auto-refreshed
On payment: generate scheduling link via Clio Grow API
On HIRED: create Contact → create Matter → create onboarding task list

Admin Dashboard

Protected by Supabase Auth (magic link only)
Role hierarchy: SUPER_ADMIN > ADMIN > VIEWER
Pages: Overview (KPIs + funnel), Pipeline (lead table), Lead Detail, Ghost Assistant Control Center, Templates Editor


File Structure
src/
├── app/
│   ├── (intake)/               — public facing
│   │   ├── layout.tsx
│   │   ├── page.tsx            — landing / hero
│   │   └── intake/
│   │       ├── page.tsx        — multi-step form shell
│   │       └── success/page.tsx
│   │
│   ├── (admin)/                — protected by middleware
│   │   ├── layout.tsx          — sidebar nav
│   │   ├── login/page.tsx
│   │   ├── unauthorized/page.tsx
│   │   ├── dashboard/page.tsx  — KPIs + funnel chart
│   │   ├── leads/
│   │   │   ├── page.tsx        — pipeline table + lead detail drawer
│   │   │   └── [id]/page.tsx
│   │   └── ghost-assistant/
│   │       ├── page.tsx        — sequence control center
│   │       └── templates/page.tsx
│   │
│   ├── auth/
│   │   └── callback/route.ts   — Supabase OAuth callback
│   │
│   └── api/
│       ├── intake/route.ts          — POST: create/upsert lead, enqueue sequence
│       ├── intake/qualify/route.ts  — POST: run qualification logic
│       ├── checkout/session/route.ts — POST: create Stripe checkout session
│       ├── webhooks/
│       │   ├── stripe/route.ts      — ⚠️ DO NOT TOUCH
│       │   ├── qstash/route.ts      — ⚠️ DO NOT TOUCH
│       │   └── cal/route.ts         — ⚠️ DO NOT TOUCH
│       ├── ghost/
│       │   └── cron/route.ts        — ⚠️ DO NOT TOUCH
│       ├── clio/
│       │   ├── callback/route.ts
│       │   ├── schedule/route.ts
│       │   └── onboard/route.ts
│       ├── nurture/
│       │   ├── start/route.ts
│       │   └── pause/route.ts
│       └── admin/
│           ├── me/route.ts           — GET: current admin role
│           ├── leads/route.ts        — GET: paginated leads
│           ├── leads/[id]/route.ts   — GET/PATCH: lead detail + status
│           ├── metrics/route.ts      — GET: funnel metrics
│           ├── sequences/route.ts    — GET: all sequences with filters
│           ├── sequences/[id]/route.ts
│           ├── sequences/[id]/pause/route.ts
│           ├── sequences/[id]/resume/route.ts
│           ├── sequences/[id]/retry/route.ts
│           ├── sequences/failures/route.ts
│           └── templates/
│               ├── route.ts          — GET: all templates
│               └── [id]/route.ts     — PUT: update template
│
├── components/
│   ├── intake/
│   │   ├── IntakeShell.tsx      — step manager, progress, transitions
│   │   ├── Step1Contact.tsx
│   │   ├── Step2Matter.tsx
│   │   ├── Step3Qualify.tsx
│   │   ├── Step4Payment.tsx
│   │   └── SuccessConfirmation.tsx
│   │
│   ├── admin/
│   │   ├── Sidebar.tsx
│   │   ├── MetricCard.tsx
│   │   ├── FunnelChart.tsx
│   │   ├── LeadTable.tsx
│   │   ├── LeadDrawer.tsx
│   │   ├── StatusBadge.tsx
│   │   ├── SequenceList.tsx
│   │   ├── SequenceDetail.tsx
│   │   ├── FailureTable.tsx
│   │   └── GhostAssistantTimeline.tsx
│   │
│   └── ui/
│       ├── VaultInput.tsx
│       ├── VaultButton.tsx
│       ├── VaultSelect.tsx
│       ├── VaultTextarea.tsx
│       ├── StepDots.tsx
│       ├── PanelGrid.tsx
│       ├── StatusDot.tsx
│       ├── ChannelBadge.tsx
│       └── ConfirmDialog.tsx
│
├── hooks/
│   └── useAdminRole.ts          — SWR hook → /api/admin/me
│
├── lib/
│   ├── db/prisma.ts             — Prisma singleton (SQLite local / Postgres prod)
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── middleware.ts
│   ├── auth/
│   │   └── requireRole.ts       — role guard for API routes
│   ├── stripe.ts
│   ├── twilio.ts
│   ├── resend.ts
│   ├── clio.ts                  — OAuth refresh + API wrapper
│   ├── qstash.ts
│   ├── audit.ts                 — safe auditEvent() helper
│   ├── qualification.ts         — lead scoring / disqualify logic
│   ├── nurture.ts               — message builder + merge tag replacer
│   └── sequences.ts             — QStash scheduling primitives
│
├── types/index.ts
└── middleware.ts                — protects /dashboard/*, /api/admin/*

Prisma Models (current schema summary)
Lead            — core intake record, tracks status through full lifecycle
LeadEvent       — deprecated in favor of AuditEvent (keep for backward compat)
AuditEvent      — all system events with type + metadata JSON
Sequence        — a nurture run for a lead (attempts, lastError, lockedAt, updatedAt)
NurtureMessage  — individual message within a sequence (day, channel, status, externalId)
NurtureTemplate — editable message templates (day, channel, subject, body, active)
ClioToken       — singleton OAuth token for Clio API
AdminUser       — authorized admin accounts with role
Lead Status Flow
PENDING → QUALIFIED → PAYMENT_INITIATED → PAID → SCHEDULED → HIRED
       ↘ DISQUALIFIED                                       ↘ LOST
Sequence / NurtureMessage Status
QUEUED → SENT → DELIVERED
       ↘ FAILED (retryable)
       ↘ SKIPPED (lead paid/hired/paused)
       ↘ CANCELLED

Auth & Roles
RolePermissionsVIEWERAll GET routes under /api/admin/*ADMIN+ pause, resume, retry, update templates, patch lead statusSUPER_ADMIN+ bulk retry, delete operations, role management, export

requireRole(minRole) imported from src/lib/auth/requireRole.ts
Wrap every admin API route handler with this before any logic
useAdminRole() hook gates UI controls client-side (server still enforces)


What's Complete

 Multi-step intake form (4 steps)
 Qualification logic with auto-disqualify
 Stripe $300 payment gate
 Ghost Assistant — 4-day QStash nurture sequence
 Durable sequences (attempts, lastError, lockedAt, retry-safe)
 AuditEvent model + auditEvent() helper
 Audit logging on all key events
 Hardened DB client (SQLite local, Postgres prod)
 Admin auth — Supabase magic link + role guard
 Sequence Control Center — filters, list, detail panel, pause/resume/retry
 Templates editor — edit/preview/activate per day+channel
 Failures (dead-letter) view with per-row retry
 /api/admin/me endpoint
 useAdminRole() hook — client-side role gating on admin UI


What's Complete (Continued)

 Exponential backoff on retry scheduling (5m base, 2x multiplier, capped at 24h)
 Idempotency keys on Twilio + Resend sends (externalId tracked in Sequence model)
 Dead-letter threshold: auto-cancel sequence after 3 consecutive FAILED messages
 Dead-letter admin alert: email SUPER_ADMIN when sequence hits threshold
 consecutiveFailures tracking per sequence
 nextRetry scheduling with backoff


What's Next (in order)
2. More polish features (optional refinements)

2. Compliance

Twilio webhook handler for inbound SMS STOP keyword
optedOut boolean + optedOutAt DateTime on Lead model
Block all outbound messages to opted-out leads in QStash handler
SMS message footers: "Reply STOP to opt out"
Audit trail CSV export (GET /api/admin/export/audit?leadId=&from=&to=)

3. Clio Integration (complete)

OAuth callback + token refresh already scaffolded
Wire createContact() + createMatter() + createOnboardingTasks() to HIRED status change
Test end-to-end in Clio sandbox

4. SEO + Performance (Proposal §7)

LegalService + LocalBusiness JSON-LD schema in app/layout.tsx
Lazy-load Clio Grow embed (intersection observer)
Target LCP < 2.5s mobile
XML sitemap generation (next-sitemap)
301 redirect map for any migrated URLs

5. Admin Dashboard Completion

FunnelChart (Recharts) on /dashboard — step drop-off visualization
Weekly intake metrics email to SUPER_ADMIN (Resend + cron)
Lead export CSV (GET /api/admin/export/leads)


Absolute Do Not Touch
These files contain production webhook handlers and cron logic.
Never modify them — new features work around them.
app/api/ghost/cron/route.ts
app/api/webhooks/qstash/route.ts
app/api/webhooks/stripe/route.ts
app/api/webhooks/cal/route.ts

Key Conventions

Every admin API route starts with const auth = await requireRole(request, 'VIEWER') (or higher)
Every mutation logs an AuditEvent before returning 200
All QStash scheduling goes through lib/sequences.ts — never call QStash client directly in route handlers
All outbound SMS/email goes through lib/nurture.ts — never call Twilio/Resend directly in route handlers
Prisma singleton imported from lib/db/prisma.ts — never instantiate PrismaClient directly
No optimistic UI updates that skip the audit log


Environment Variables Required
envNEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=
DIRECT_URL=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_CONSULT_PRICE_ID=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
RESEND_API_KEY=
RESEND_FROM_EMAIL=intake@crainwooley.com
CLIO_CLIENT_ID=
CLIO_CLIENT_SECRET=
CLIO_REDIRECT_URI=
QSTASH_URL=
QSTASH_TOKEN=
QSTASH_CURRENT_SIGNING_KEY=
QSTASH_NEXT_SIGNING_KEY=
NEXT_PUBLIC_BASE_URL=
SEED_ADMIN_EMAIL=

FutureEng — Intake Systems & Revenue Automation
Haron Wilson & Joseph Panetta