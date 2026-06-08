import Link from 'next/link'
import Image from 'next/image'
import type { DatedBlogPost } from '@/lib/legacy/blog-index'
import blogImages from '@/lib/legacy/blog-images.json'

const IMAGES = blogImages as Record<string, string>

export function BlogCardGrid({ posts }: { posts: DatedBlogPost[] }) {
  return (
    <ul className="blog-grid">
      {posts.map((p) => {
        const img = IMAGES[p.path]
        return (
          <li key={p.path} className="blog-card">
            <Link href={p.path} className="blog-card-link">
              <span className="blog-card-thumb">
                {img ? <Image src={`/legacy/blog/${img}`} alt="" fill sizes="(max-width: 920px) 100vw, 380px" style={{ objectFit: 'cover' }} /> : null}
              </span>
              <span className="blog-card-cap">
                <span className="blog-card-date">{p.date}</span>
                <span className="blog-card-title">{p.title}</span>
              </span>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
