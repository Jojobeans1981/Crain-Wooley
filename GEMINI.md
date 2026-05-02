# Crain & Wooley Automated Intake Engine

## Project Context
Building a "System-Driven Intake Engine" for a law firm.
Replacing manual, people-driven intake with an automated flow:
**Qualification -> Payment ($300 Retainer) -> Scheduling -> Onboarding**

## Tech Stack
- **Framework:** Next.js 15 (App Router, TypeScript)
- **Database:** Prisma with PostgreSQL
- **Styling:** Tailwind CSS (Custom "Crain & Wooley" theme: Black, Gold, Muted accents)
- **Integrations:**
    - **Clio:** CRM & Matter Management (Single Source of Truth)
    - **Stripe:** Consultation fee collection ($300)
    - **Cal.com:** Automated scheduling
    - **Ghost Assistant:** SMS (Twilio) & Email (Resend) nurture sequences

## Design Conventions
- **Theme:** Dark mode by default (`bg-cw-black`).
- **Typography:** Display fonts for headers, monospace for status/meta info.
- **Colors:**
    - `cw-black`: `#0A0A0A`
    - `cw-gold`: `#D4AF37`
    - `cw-gold-dim`: `#9C802A`
    - `cw-white`: `#F5F5F5`
    - `cw-muted`: `#737373`
    - `cw-border`: `#262626`
- **UI Components:** Use custom `cw-` classes defined in `globals.css`.

## Core Workflows
1. **Intake Gate (`/qualify`):** Leads submit info. Logic determines if they are "Qualified".
2. **Payment Bridge (`/payment`):** Qualified leads pay $300 via Stripe.
3. **Scheduling (`/schedule`):** Paid leads book a slot via Cal.com.
4. **Onboarding (`/api/onboarding`):** "Hired" status triggers Clio contact/matter/task creation.
5. **Ghost Assistant:** Automated follow-ups for qualified-but-unpaid leads.

## SEO Strategy
- Maintain firm authority with 301 redirects (if applicable).
- Technical SEO: LocalBusiness & LegalService schema.
- Performance: Keep LCP < 2.5s.
