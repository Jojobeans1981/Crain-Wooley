# Parity-review deploy (`crain-wooley-parity-review`)

A **review-only** Vercel deployment of `Jojobeans1981/Crain-Wooley` (this repo), stood
up so the owner can review the interior-parity work without waiting on Joseph's Vercel.

## What it is / isn't
- **It is** the marketing / interior-parity site at the current `main` — flat-rate
  accordions, the rebuilt two-column intro, the per-page footer padding, etc.
- **Marketing pages only.** No intake env vars are set (Supabase / Stripe / Twilio /
  Clio / QStash). The intake routes (`/get-started`, `/api/*`, admin, portal) will
  error at runtime — **acceptable for a review URL**. The build itself needs no env
  (`prisma generate` reads only the schema; pages prerender statically).
- **Staging-fresh:** `NEXT_PUBLIC_SITE_INDEXABLE` is left unset → `next.config.ts`
  sends `Cache-Control: no-store` (see `caching.md`) so reviewers always see the
  latest deploy, and the site stays `noindex`.

## DO NOT confuse with `crain-wooley-intake`
`crain-wooley-intake.vercel.app` / `…-rose.vercel.app` deploy from a **different repo**
(`wemovenewyork/crain-wooley-intake`) — an OLDER fork that also serves the **live
intake form**. It is NOT this app's staging. **Never** repoint its Git integration to
this repo and **never** push this repo's history over it.

## Topology
| Repo | Role | Deploy |
| --- | --- | --- |
| `Jojobeans1981/Crain-Wooley` (this) | the app (marketing + intake) | Joseph's Vercel (canonical staging) + `crain-wooley-parity-review` (this team, review) |
| `wemovenewyork/crain-wooley-intake` | older fork + live intake form + `…-rose` design reference | `crain-wooley-intake.vercel.app` — leave untouched |

## Build note
`scripts/build.mjs` now runs `prisma generate` before `next build` — there is no
postinstall hook, so a fresh install otherwise builds with an ungenerated client and
fails. This also unblocks Joseph's Vercel (its builds were failing on the FaqBand
type error, fixed in `a8abe5c`).
