import type { MetadataRoute } from 'next'

/**
 * SEO guard. While the app is staged on the Vercel URL, NEXT_PUBLIC_SITE_INDEXABLE
 * is unset → the whole site is disallowed (keeps the staging domain out of Google,
 * preventing duplicate content with the live estateplanningdfw.law site).
 * Set NEXT_PUBLIC_SITE_INDEXABLE=true only in the production (live-domain) env.
 */
const SITE = 'https://www.estateplanningdfw.law'
const INDEXABLE = process.env.NEXT_PUBLIC_SITE_INDEXABLE === 'true'

export default function robots(): MetadataRoute.Robots {
  if (!INDEXABLE) {
    return { rules: [{ userAgent: '*', disallow: '/' }] }
  }
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Never index the app/admin/intake-internal surfaces.
        disallow: ['/dashboard', '/leads', '/sequences', '/ghost-assistant', '/login', '/unauthorized', '/api/', '/payment', '/tracker'],
      },
    ],
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE,
  }
}
