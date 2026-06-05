import type { Metadata } from 'next'
import { allPosts } from '@/lib/legacy/blog-index'
import { BlogByYear } from '@/components/legacy/BlogList'

export const metadata: Metadata = {
  title: 'Estate Planning Blog | Crain & Wooley',
  description:
    'Articles on wills, trusts, probate, Medicaid, and protecting your family across Texas, from the Dallas–Fort Worth estate planning attorneys at Crain & Wooley.',
  alternates: { canonical: '/blogs' },
}

export default function BlogIndexPage() {
  const posts = allPosts()
  return (
    <div className="learn-article cw-container">
      <p className="learn-eyebrow">From the Blog</p>
      <h1 className="learn-h1-article">Estate Planning Blog</h1>
      <p className="learn-lede">
        Plain-language articles on wills, trusts, probate, and protecting the people you love — {posts.length} and counting.
      </p>
      <BlogByYear posts={posts} />
    </div>
  )
}
