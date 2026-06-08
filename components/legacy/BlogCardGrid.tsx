import Link from 'next/link'
import Image from 'next/image'
import type { DatedBlogPost } from '@/lib/legacy/blog-index'
import blogImages from '@/lib/legacy/blog-images.json'

const IMAGES = blogImages as Record<string, string>

// A handful of posts (the newest ones) weren't in the image crawl; on live their
// card uses a stock photo we don't re-host. Fall back to one of the clean
// (panel-cropped) estate-planning photos — deterministic per path so a given
// post always shows the same image — so no card is ever blank.
const FALLBACKS = [
  'crain-wooley-ad.36-.jpg', 'crain-wooley-ad.30-.jpg', 'crain-wooley-ad.32-.jpg',
  'crain-wooley-ad.33-.jpg', 'crain-wooley-ad.34-.jpg', 'crain-wooley-ad.35-.jpg',
  'crain-wooley-ad.5-.jpg', 'crain-wooley-ad.10-.jpg',
]
const hash = (s: string) => { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h }

export function BlogCardGrid({ posts }: { posts: DatedBlogPost[] }) {
  return (
    <ul className="blog-grid">
      {posts.map((p) => {
        const img = IMAGES[p.path] ?? FALLBACKS[hash(p.path) % FALLBACKS.length]
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
