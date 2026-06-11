# Caching policy (staging vs production)

The single switch is **`NEXT_PUBLIC_SITE_INDEXABLE`** (the same flag that gates
search indexing in `app/layout.tsx` + `app/robots.ts`):

| Env value | Environment | Caching |
| --- | --- | --- |
| unset / `false` | **Staging** (Vercel URL) | **Always-fresh** |
| `true` | **Production** (live domain) | **Standard aggressive** (Next/Vercel defaults) |

## Why
After a deploy, the App Router **client Router Cache** + browser **bfcache** keep
serving the previously-rendered page until a hard refresh — so the owner/client
review stale content on staging. The HTML's `Cache-Control: max-age=0,
must-revalidate` alone doesn't prevent this.

## What staging does (`next.config.ts`, `STAGING_FRESH = true`)
1. `headers()` sends `Cache-Control: no-store, must-revalidate` on every
   document/RSC route **except** fingerprinted assets
   (`/((?!_next/static|_next/image|favicon.ico).*)`) — assets keep their
   immutable 1-year cache (filenames are content-hashed, so new deploys ship new
   names). The browser/CDN always fetch the current deploy's HTML.
2. `experimental.staleTimes: { dynamic: 0, static: 0 }` stops the client Router
   Cache from reusing stale RSC payloads across client-side navigations.

## Production (`NEXT_PUBLIC_SITE_INDEXABLE=true`)
`headers()` returns `[]` and `staleTimes` is omitted — Next/Vercel's standard
prerender + CDN caching applies, which is what we want for the live domain at
cutover.

## Flipping it
Set `NEXT_PUBLIC_SITE_INDEXABLE=true` in the production (live-domain) Vercel
environment only. Leave it unset on the staging project. No code change needed.
