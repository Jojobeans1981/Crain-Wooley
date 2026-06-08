import Link from 'next/link'
import Image from 'next/image'
import { type BlogPost, cap } from '@/lib/legacy/blog-index'
import blogImages from '@/lib/legacy/blog-images.json'

const IMAGES = blogImages as Record<string, string>

/** Renders a list of blog posts as date + title rows (warm-editorial system). */
export function BlogPostRows({ posts }: { posts: BlogPost[] }) {
  return (
    <div className="learn-readlist">
      {posts.map((p) => {
        const img = IMAGES[p.path]
        return (
          <Link key={p.path} href={p.path} className={`blog-row${img ? ' blog-row-media' : ''}`}>
            {img && (
              <span className="blog-row-thumb" aria-hidden="true">
                <Image src={`/legacy/blog/${img}`} alt="" fill sizes="104px" style={{ objectFit: 'cover' }} />
              </span>
            )}
            <span className="blog-row-date">{cap(p.month)} {p.year}</span>
            <span className="blog-row-title">{p.title}</span>
          </Link>
        )
      })}
    </div>
  )
}
