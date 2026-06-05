import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { yearMonths, postsByYearMonth, cap } from '@/lib/legacy/blog-index'
import { BlogPostRows } from '@/components/legacy/BlogList'

type Params = { year: string; month: string }

export function generateStaticParams() {
  return yearMonths().map(({ year, month }) => ({ year, month }))
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { year, month } = await params
  if (!postsByYearMonth(year, month).length) return {}
  return {
    title: `${cap(month)} ${year} Estate Planning Articles | Crain & Wooley`,
    description: `Crain & Wooley estate planning blog posts from ${cap(month)} ${year}.`,
    alternates: { canonical: `/blogs/${year}/${month}` },
  }
}

export default async function BlogMonthPage({ params }: { params: Promise<Params> }) {
  const { year, month } = await params
  const posts = postsByYearMonth(year, month)
  if (!posts.length) notFound()
  return (
    <div className="learn-article cw-container">
      <p className="learn-breadcrumb">
        <a href="/blogs">Blog</a> → <a href={`/blogs/${year}`}>{year}</a> → {cap(month)}
      </p>
      <p className="learn-eyebrow">Archive</p>
      <h1 className="learn-h1-article">{cap(month)} {year}</h1>
      <BlogPostRows posts={posts} />
    </div>
  )
}
