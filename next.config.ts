import type { NextConfig } from 'next'

// ── Environment-based caching ──────────────────────────────────────────────
// Staging (the Vercel URL, NEXT_PUBLIC_SITE_INDEXABLE unset/false) must be
// ALWAYS-FRESH so the owner + client never see stale content after a deploy —
// the App Router client Router Cache + bfcache otherwise require a hard refresh.
// Production (live domain, NEXT_PUBLIC_SITE_INDEXABLE=true) keeps Next/Vercel's
// standard aggressive caching for cutover. Tied to the same flag that gates
// indexability, so staging-vs-prod is a single switch. See docs/reference/caching.md.
const STAGING_FRESH = process.env.NEXT_PUBLIC_SITE_INDEXABLE !== 'true'

const nextConfig: NextConfig = {
  // Force all routes dynamic -- no static generation
  // Required since API routes use lazy DB/Stripe clients
  serverExternalPackages: ['@prisma/client', '@prisma/adapter-pg', 'pg'],

  // On staging, minimise client Router Cache reuse of stale RSC across navs
  // (static must be >=30 per Next; far fresher than the 300s default). The
  // no-store HTML header below is the primary always-fresh mechanism.
  ...(STAGING_FRESH ? { experimental: { staleTimes: { dynamic: 0, static: 30 } } } : {}),

  async headers() {
    if (!STAGING_FRESH) return [] // production: Next/Vercel defaults (aggressive)
    return [
      {
        // Every document/RSC route EXCEPT fingerprinted assets (which stay
        // immutable). no-store => browser/CDN always fetch the current deploy.
        source: '/((?!_next/static|_next/image|favicon.ico).*)',
        headers: [{ key: 'Cache-Control', value: 'no-store, must-revalidate' }],
      },
    ]
  },

  async redirects() {
    return [
      // ── SEO migration · confirmed 301s from the Scorpion 301 map ──
      // Canonical production host is https://www.estateplanningdfw.law.
      // http→https and non-www→www are enforced in Vercel domain settings.
      // Trailing-slash is left at the Next default ON PURPOSE so the existing
      // webhook handlers (stripe/qstash/twilio/cal) are not affected — old
      // trailing-slash URLs 308-redirect to their canonical form, which Google
      // honors as permanent (see Cutover Runbook). Do NOT set trailingSlash:true
      // without first updating those webhook URLs.
      { source: '/mansfield-fw/probate', destination: '/mansfield/probate', permanent: true },
      { source: '/about-us/our-team', destination: '/staff-profiles', permanent: true },

      // Blog category/tag pages were low-value listing URLs — 301 them to the
      // blog index (per the 301 map: "301 if dropped"). Individual posts and the
      // year/month date archives are served as real pages.
      { source: '/blogs/categories/:slug*', destination: '/blogs', permanent: true },

      // Live site 301s the singular /blog to the /blogs index — match it.
      { source: '/blog', destination: '/blogs', permanent: true },

      // Sitemap-diff backfill: live URLs with no new-build equivalent → best
      // target (parent section), so they 308 instead of hitting the catch-all
      // 404. /blogs/categories/* is already covered by the wildcard above.
      { source: '/events-calendar/event-details', destination: '/events', permanent: true },
      { source: '/events-calendar', destination: '/events', permanent: true },
      { source: '/fort-worth/minor-trusts', destination: '/learn/trusts', permanent: true },

      // NOTE: the ~480 legacy marketing/blog URLs must be RECREATED at their
      // existing paths on this app before DNS cutover (route_manifest.csv is the
      // checklist) — they are not redirects, they must return 200.
    ]
  },
}

export default nextConfig
