import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { years, postsByYear } from '@/lib/legacy/blog-index'
import { BlogPostRows } from '@/components/legacy/BlogList'

type Params = { year: string }

export function generateStaticParams() {
  return years().map((year) => ({ year }))
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { year } = await params
  if (!postsByYear(year).length) return {}
  return {
    title: `${year} Estate Planning Articles | Crain & Wooley`,
    description: `Crain & Wooley estate planning blog posts from ${year} — wills, trusts, probate, and elder law in the Dallas–Fort Worth area.`,
    alternates: { canonical: `/blogs/${year}` },
  }
}

export default async function BlogYearPage({ params }: { params: Promise<Params> }) {
  const { year } = await params
  const posts = postsByYear(year)
  if (!posts.length) notFound()
  return (
    <div className="learn-article cw-container">
      <p className="learn-breadcrumb"><a href="/blogs">Blog</a> → {year}</p>
      <p className="learn-eyebrow">Archive</p>
      <h1 className="learn-h1-article">{year} Articles</h1>
      <BlogPostRows posts={posts} />
    </div>
  )
}
