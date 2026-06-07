import type { Metadata } from 'next'

/**
 * Shared social/SEO metadata. metadataBase (set in app/layout.tsx) resolves the
 * relative image/url to the canonical https://www.estateplanningdfw.law host, so
 * og:image and og:url come out absolute. The image is the live site's
 * Social-Share.jpg (1200x630), re-hosted at /public/social-share.jpg.
 */
export const SOCIAL_IMAGE = '/social-share.jpg'
export const SITE_NAME = 'Crain & Wooley'

export function pageMetadata(opts: {
  title: string
  description: string
  path: string
  type?: 'website' | 'article'
}): Metadata {
  const { title, description, path, type = 'article' } = opts
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type,
      siteName: SITE_NAME,
      url: path,
      title,
      description,
      images: [{ url: SOCIAL_IMAGE, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [SOCIAL_IMAGE],
    },
  }
}
