import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { allCategories, categoryBySlug, postsByCategory } from '@/lib/legacy/blog-index'
import { BlogCardGrid } from '@/components/legacy/BlogCardGrid'
import { BlogCategorySidebar } from '@/components/legacy/BlogCategorySidebar'

// All 36 source category routes were live + sitemap-indexed; preserve every slug
// verbatim (the typo'd disability-plannng is 301'd to disability-planning in
// next.config, so only the 35 canonical slugs are generated here).
export function generateStaticParams() {
  return allCategories().map((c) => ({ slug: c.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const cat = categoryBySlug(slug)
  if (!cat) return {}
  return {
    title: `${cat.name} | Crain & Wooley Blog`,
    description: `Articles on ${cat.name} from the Dallas–Fort Worth estate planning attorneys at Crain & Wooley.`,
    alternates: { canonical: `/blogs/categories/${cat.slug}` },
  }
}

export default async function BlogCategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const cat = categoryBySlug(slug)
  if (!cat) notFound()
  const posts = postsByCategory(slug)
  return (
    <>
      <section className="blog-hero" aria-label="Blog category">
        <div className="cw-container blog-hero-inner">
          <h1 className="blog-hero-title">{cat.name}</h1>
          <span className="blog-hero-rule" aria-hidden="true" />
        </div>
      </section>
      <div className="cw-container blog-listing">
        <div className="blog-listing--sidebar">
          <div>
            <h2 className="blog-listing-head">{posts.length} {posts.length === 1 ? 'Post' : 'Posts'}</h2>
            <BlogCardGrid posts={posts} />
            <p style={{ marginTop: 40 }}><Link href="/blogs" className="cw-btn-ghost">← All Posts</Link></p>
          </div>
          <BlogCategorySidebar activeSlug={cat.slug} />
        </div>
      </div>
    </>
  )
}
