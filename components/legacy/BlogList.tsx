import Link from 'next/link'
import { type BlogPost, cap } from '@/lib/legacy/blog-index'

/** Renders a list of blog posts as date + title rows (warm-editorial system). */
export function BlogPostRows({ posts }: { posts: BlogPost[] }) {
  return (
    <div className="learn-readlist">
      {posts.map((p) => (
        <Link key={p.path} href={p.path} className="blog-row">
          <span className="blog-row-date">{cap(p.month)} {p.year}</span>
          <span className="blog-row-title">{p.title}</span>
        </Link>
      ))}
    </div>
  )
}

/** Index view grouped by year, each year heading linking to its archive. */
export function BlogByYear({ posts }: { posts: BlogPost[] }) {
  const byYear = new Map<string, BlogPost[]>()
  for (const p of posts) {
    if (!byYear.has(p.year)) byYear.set(p.year, [])
    byYear.get(p.year)!.push(p)
  }
  return (
    <>
      {[...byYear.entries()].map(([year, list]) => (
        <section key={year} className="blog-year-group">
          <h2 className="legacy-h2">
            <Link href={`/blogs/${year}`}>{year}</Link>{' '}
            <span className="blog-year-count">{list.length}</span>
          </h2>
          <BlogPostRows posts={list} />
        </section>
      ))}
    </>
  )
}
