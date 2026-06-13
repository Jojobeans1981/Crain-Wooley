import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { getLegacyPage, allLegacyPaths } from '@/lib/legacy'
import { pageMetadata } from '@/lib/seo'
import LegacyArticle from '@/components/legacy/LegacyArticle'
import FamilyBPage from '@/components/legacy/FamilyBPage'
import BlogPostPage from '@/components/legacy/BlogPostPage'
import { getFamilyBPage } from '@/lib/legacy/family-b'

type Params = { slug: string[] }

const toPath = (slug: string[]) => '/' + slug.join('/')

/**
 * Self-healing bridge for high-value legacy URLs not yet captured by the crawl.
 * These pages WILL become real 200s once they're in legacy-pages.json — at which
 * point getLegacyPage() returns them and this map is never consulted for them.
 * Until then, a TEMPORARY (307) redirect to the live /learn equivalent beats a
 * 404 (and is safe because the staging site is noindex). Remove entries here only
 * if you decide a path should permanently consolidate rather than be recreated.
 */
const FALLBACK_REDIRECTS: Record<string, string> = {
  '/estate-planning': '/learn',
  '/estate-planning/trusts': '/learn/trusts',
  '/estate-planning/trusts/trust-administration': '/learn/trusts',
  '/estate-planning/trusts/trust-litigation': '/learn/trusts',
  '/estate-planning/revocable-living-trusts': '/learn/trusts',
  '/estate-planning/irrevocable-trusts': '/learn/trusts',
  '/estate-planning/charitable-trusts': '/learn/trusts',
  '/estate-planning/supplemental-needs-trust': '/learn/special-needs',
  '/estate-planning/conservatorship': '/learn/special-needs',
  '/estate-planning/inheritance-law': '/learn/family-situations',
  '/estate-planning/wills': '/learn/wills',
  '/estate-planning/wills/living-wills': '/learn/powers-of-attorney',
  '/probate': '/learn/probate',
  '/probate/probate-administration': '/learn/probate',
  '/probate/probate-litigation': '/learn/probate',
  '/probate/probate-for-out-of-state-executors': '/learn/probate',
  '/business-law': '/learn/business-succession',
  '/business-law/business-succession-planning': '/learn/business-succession',
}

export function generateStaticParams() {
  return allLegacyPaths()
    // /staff-profiles is owned by the dedicated app/(marketing)/staff-profiles
    // route (the real Meet-the-Team page with headshots); individual bio
    // sub-pages (/staff-profiles/<name>) still resolve here.
    .filter((p) => p !== '/staff-profiles' && p !== '/resources/free-estate-planning-guide' && p !== '/contact-us')
    .map((p) => ({ slug: p.replace(/^\//, '').split('/') }))
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params
  const page = getLegacyPage(toPath(slug))
  if (!page) return {}
  // OG/Twitter derive from each page's already-captured title/description.
  return pageMetadata({ title: page.title, description: page.description, path: toPath(slug), type: 'article' })
}

export default async function LegacyCatchAll({ params }: { params: Promise<Params> }) {
  const { slug } = await params
  const path = toPath(slug)
  // Structured family-B pages render the corrected interior template — but only
  // when the extraction actually captured content (intro or accordions). Sparse
  // entries fall back to LegacyArticle (full body + the shared gold-banner/no-
  // chrome fixes) so a page is never left empty.
  const fb = getFamilyBPage(path)
  if (fb && (fb.bodyBlocks.length > 0 || fb.accordionGroups.length > 0)) return <FamilyBPage page={fb} />
  const page = getLegacyPage(path)
  // Blog posts (Family E) render the dedicated blog POST template (2-col body +
  // Related Posts + prev/next + CTA), not the generic interior article.
  if (page && page.type === 'blog_post') return <BlogPostPage page={page} path={path} />
  if (page) return <LegacyArticle page={page} path={path} />

  // Not captured yet — bridge high-value paths to their live guide (temporary).
  const fallback = FALLBACK_REDIRECTS[path]
  if (fallback) redirect(fallback)

  notFound()
}
