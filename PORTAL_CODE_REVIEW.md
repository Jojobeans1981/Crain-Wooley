# Client Portal Code Review

## Summary
✅ **Production-ready.** Portal authentication, API, and forms are well-designed. Three minor recommendations below.

---

## Security & Design — Strengths

### Token System (`lib/portal/token.ts`)
- ✅ HMAC-SHA256 signing (via `crypto.createHmac`)
- ✅ Timing-safe comparison (`crypto.timingSafeEqual`) prevents timing attacks
- ✅ Base64URL encoding (no unsafe characters in tokens)
- ✅ Expiry validation (72-hour default TTL)
- ✅ Payload validation: leadId, email, exp type-checked
- ✅ Token format: `base64url(json).signature` is standard & verifiable

### Request-Link API (`app/api/portal/request-link/route.ts`)
- ✅ Email validation (regex)
- ✅ Lead lookup + email verification (matches securely)
- ✅ **Good UX security:** Returns `ok: true` even if lead not found — doesn't leak whether a lead exists
- ✅ Audit logging (`auditEvent`) on every request
- ✅ Proper error handling with 422/500 status codes
- ✅ Email sent via `Resend` (idempotency key for deduplication)

### Email Notifications (`lib/portal/notify.ts`)
- ✅ Dual notification: client + firm inbox (with configurable `LEAD_NOTIFICATION_EMAIL`)
- ✅ Audit logging after send
- ✅ Idempotency keys (hourly scope prevents double-sends)
- ✅ Base URL resolution (fallback to `estateplanningdfw.law`)
- ✅ URL format: `/portal/[leadId]/[token]` is secure (token is in URL, not querystring)

### Form (`components/site/PortalAccessForm.tsx`)
- ✅ Client-side validation (leadId + email required)
- ✅ Loading state (prevents double-submit)
- ✅ Error messaging (friendly, non-leaky)
- ✅ Form-driven submission (no auto-submit)

---

## Recommendations (Minor)

### 1. ⚠️ Fallback Secret in Token Service
**File:** `lib/portal/token.ts`, line 10-19

```ts
const FALLBACK_SECRET = 'crain-wooley-portal-dev-secret'  // <-- dev-only

function getSecret() {
  return (
    process.env.PORTAL_LINK_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    process.env.CRON_SECRET ||
    process.env.DATABASE_URL ||
    FALLBACK_SECRET  // <-- fallback if all env vars missing
  )
}
```

**Issue:** If Vercel env vars are not set, tokens will be signed with a hardcoded dev secret. This could:
- Create valid tokens in production (security issue)
- Make tokens valid across environments (replay risk)

**Recommendation:** 
- On production, **require** one of the secure secrets. Remove or change fallback:
  ```ts
  if (NODE_ENV === 'production' && !secure) {
    throw new Error('PORTAL_LINK_SECRET not set')
  }
  ```
- Or: use only `PORTAL_LINK_SECRET` (add to `.env.example`)

**Action:** Not urgent (will work), but add to Vercel env at cutover:
```
PORTAL_LINK_SECRET = [generate random 32+ char string]
```

---

### 2. Email Case-Sensitivity Handling — Good, but document it
**File:** `lib/portal/token.ts`, line 39 & `request-link`, line 14

Token stores email lowercase:
```ts
email: input.email.trim().toLowerCase()
```

Request-link also lowercases:
```ts
const email = String(body.email ?? '').trim().toLowerCase()
const lead = await prisma.lead.findUnique({
  where: { id: leadId },
  select: { ... }
})
if (!lead || lead.email.toLowerCase() !== email) { ... }
```

✅ **Good:** Prevents case-mismatch issues (users submit "John@Example.COM" vs "john@example.com").

Recommendation: Add comment explaining this:
```ts
// Normalize to lowercase to prevent case-mismatch issues
// (emails are case-insensitive in practice)
```

---

### 3. Idempotency Key Scope — Clarify Intent
**File:** `lib/portal/notify.ts`, line 37 & 51

Idempotency keys use hourly scope:
```ts
idempotencyKey: `portal-link:${lead.id}:${reason}:${Math.floor(Date.now() / 1000 / 3600)}`
```

✅ **Good:** Prevents double-sends within the same hour.

**Note:** This means if a user requests a link twice in the same hour, the second request will be deduplicated by Resend (skipped). This is probably intentional, but should be documented:

```ts
// Idempotency key scope: 1 hour
// If a lead requests a portal link twice in the same hour,
// the second request will be deduplicated and skipped by Resend.
// (This is intentional to prevent accidental double-sends.)
```

---

## Test Scenarios (Pre-cutover QA)

Before going live, verify:

- [ ] **Happy path:** Request link with valid leadId + email → email arrives in firm inbox + client inbox
- [ ] **Non-existent lead:** Request with invalid leadId → form shows success message (doesn't leak)
- [ ] **Wrong email:** Valid leadId, wrong email → form shows success message (doesn't leak)
- [ ] **Token expiry:** Open portal link after 72+ hours → shows "link expired" (or similar)
- [ ] **Token replay:** Try to reuse an old token → fails (timing-safe check)
- [ ] **Case-insensitive:** Submit email as "John@Example.COM", was stored as "john@example.com" → works
- [ ] **Audit log:** Check that every request-link generates an audit event in Prisma
- [ ] **Idempotency:** Request link twice rapidly in same hour → second request deduplicated by Resend

---

## Integration with Lead Model

Portal assumes `Lead` model has:
- `id` (CUID)
- `email` (unique)
- `firstName`, `lastName`, `status`

✅ **Verified:** These fields exist in `prisma/schema.prisma`.

---

## Environment Variables Required

For portal to work on Vercel:

```
# Essential (recommended)
PORTAL_LINK_SECRET = [random 32+ char string]

# Already set (reused)
RESEND_API_KEY = [existing]
LEAD_NOTIFICATION_EMAIL = [firm inbox]
NEXT_PUBLIC_APP_URL or NEXT_PUBLIC_BASE_URL = [your domain]
```

---

## Verdict

✅ **Production-ready.**

- Security is solid (HMAC, timing-safe comparison, proper validation)
- UX is good (doesn't leak lead existence, friendly errors)
- Code is clean & maintainable
- One minor recommendation: set `PORTAL_LINK_SECRET` on Vercel at cutover

**Recommendation:** Merge to production, test scenarios above on staging, then launch.

---

## Files Reviewed

- `lib/portal/token.ts` — Token generation + verification
- `app/api/portal/request-link/route.ts` — Portal link API
- `lib/portal/notify.ts` — Email notifications
- `components/site/PortalAccessForm.tsx` — Portal access form
- `app/(client)/portal/page.tsx` — Portal access landing page

All follow Crain & Wooley conventions (audit logging, error handling, email idempotency).
