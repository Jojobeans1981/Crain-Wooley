import type { Metadata } from 'next'
import Link from 'next/link'
import { allPostsSorted } from '@/lib/legacy/blog-index'
import { BlogCardGrid } from '@/components/legacy/BlogCardGrid'
import { BlogCategorySidebar } from '@/components/legacy/BlogCategorySidebar'

export const metadata: Metadata = {
  title: 'Estate Planning Blog | Crain & Wooley',
  description: 'Articles on wills, trusts, probate, Medicaid, and protecting your family across Texas, from the Dallas–Fort Worth estate planning attorneys at Crain & Wooley.',
  alternates: { canonical: '/blogs' },
}

const PER_PAGE = 9

export default async function BlogIndexPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page } = await searchParams
  const all = allPostsSorted()
  const total = Math.max(1, Math.ceil(all.length / PER_PAGE))
  const cur = Math.min(total, Math.max(1, parseInt(page ?? '1', 10) || 1))
  const slice = all.slice((cur - 1) * PER_PAGE, cur * PER_PAGE)
  const url = (n: number) => (n <= 1 ? '/blogs' : `/blogs?page=${n}`)
  return (
    <>
      <section className="blog-hero" aria-label="Blog">
        <div className="cw-container blog-hero-inner">
          <h1 className="blog-hero-title">Blogs</h1>
          <span className="blog-hero-rule" aria-hidden="true" />
          <form className="blog-hero-search" action="/site-search" method="get" role="search">
            <input type="search" name="q" aria-label="Search the blog" placeholder="Search" className="blog-hero-search-input" />
            <button type="submit" className="blog-hero-search-btn" aria-label="Search">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            </button>
          </form>
        </div>
      </section>

      <div className="cw-container blog-listing">
        <div className="blog-listing--sidebar">
          <div>
            <h2 className="blog-listing-head">Most Recent Posts</h2>
            <BlogCardGrid posts={slice} />
            <nav className="blog-pagination" aria-label="Blog pages">
              {cur > 1 ? <Link href={url(cur - 1)} className="blog-page-arrow" aria-label="Previous page">‹</Link> : <span className="blog-page-arrow is-disabled" aria-hidden="true">‹</span>}
              <span className="blog-page-count">{cur} / {total}</span>
              {cur < total ? <Link href={url(cur + 1)} className="blog-page-arrow" aria-label="Next page">›</Link> : <span className="blog-page-arrow is-disabled" aria-hidden="true">›</span>}
            </nav>
          </div>
          <BlogCategorySidebar />
        </div>
      </div>
    </>
  )
}
