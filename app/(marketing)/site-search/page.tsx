import type { Metadata } from 'next'
import { SiteSearch } from '@/components/search/SiteSearch'

/**
 * Site / Learning-Center search (closes the /site-search 404). Fully client-side
 * over public/search-index.json (Fuse.js) — no backend, no API keys. The search
 * results page itself stays out of the index.
 */
export const metadata: Metadata = {
  title: 'Search | Crain & Wooley',
  description: 'Search guides, blog posts, and pages across the Crain & Wooley site.',
  robots: { index: false, follow: true },
  alternates: { canonical: '/site-search' },
}

export default async function SiteSearchPage({ searchParams }: { searchParams: Promise<{ q?: string; persona?: string }> }) {
  const { q, persona } = await searchParams
  return <SiteSearch initialQuery={q ?? ''} initialPersona={persona ?? ''} />
}
