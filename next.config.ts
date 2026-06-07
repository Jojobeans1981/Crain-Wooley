import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Force all routes dynamic -- no static generation
  // Required since API routes use lazy DB/Stripe clients
  serverExternalPackages: ['@prisma/client', '@prisma/adapter-pg', 'pg'],

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

      // NOTE: the ~480 legacy marketing/blog URLs must be RECREATED at their
      // existing paths on this app before DNS cutover (route_manifest.csv is the
      // checklist) — they are not redirects, they must return 200.
    ]
  },
}

export default nextConfig
