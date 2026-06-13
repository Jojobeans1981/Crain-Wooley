import Link from 'next/link'
import { allCategories } from '@/lib/legacy/blog-index'

/**
 * Blog category sidebar (shared by the /blogs index + /blogs/categories/<slug>).
 * Lists every canonical category with its post count, plus a link to the date archive.
 * Slugs are preserved verbatim (live + sitemap-indexed); active category is highlighted.
 */
export function BlogCategorySidebar({ activeSlug }: { activeSlug?: string }) {
  const cats = allCategories()
  return (
    <aside className="blog-cat-sidebar" aria-label="Blog categories">
      <h2 className="blog-cat-sidebar-head">Categories</h2>
      <ul className="blog-cat-list">
        <li><Link href="/blogs" className={!activeSlug ? 'is-active' : undefined}>All Posts</Link></li>
        {cats.map((c) => (
          <li key={c.slug}>
            <Link href={`/blogs/categories/${c.slug}`} className={c.slug === activeSlug ? 'is-active' : undefined} aria-current={c.slug === activeSlug ? 'page' : undefined}>
              <span>{c.name}</span>
              <span className="blog-cat-count">{c.count}</span>
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  )
}
