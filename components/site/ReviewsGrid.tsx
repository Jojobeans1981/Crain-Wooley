'use client'

import { useState } from 'react'
import type { Review } from '@/lib/reviews'

const PER_PAGE = 24

/**
 * Paginated, accessible-gold grid of all client reviews (data: lib/reviews).
 * Client-side pagination keeps the DOM light for ~200 reviews; the full set is
 * still in the page's JSON-LD for SEO.
 */
export function ReviewsGrid({ reviews }: { reviews: Review[] }) {
  const [page, setPage] = useState(0)
  const pages = Math.ceil(reviews.length / PER_PAGE)
  const start = page * PER_PAGE
  const shown = reviews.slice(start, start + PER_PAGE)

  const go = (n: number) => {
    setPage(Math.min(Math.max(n, 0), pages - 1))
    if (typeof window !== 'undefined') window.scrollTo({ top: 0 })
  }

  return (
    <div>
      <ul className="cw-reviews-page-grid">
        {shown.map((r, i) => (
          <li key={start + i} className="cw-review-card">
            <div className="cw-review-stars" aria-label="5 star rating">★★★★★</div>
            <h2 className="cw-review-card-title">{r.title}</h2>
            <blockquote className="cw-review-card-quote">{r.quote}</blockquote>
            <p className="cw-review-card-name">{r.name}</p>
          </li>
        ))}
      </ul>

      {pages > 1 && (
        <nav className="cw-reviews-pager" aria-label="Reviews pagination">
          <button type="button" className="cw-reviews-arrow" disabled={page === 0} onClick={() => go(page - 1)} aria-label="Previous page">‹</button>
          <span className="cw-reviews-pageinfo" aria-live="polite">Page {page + 1} of {pages}</span>
          <button type="button" className="cw-reviews-arrow" disabled={page === pages - 1} onClick={() => go(page + 1)} aria-label="Next page">›</button>
        </nav>
      )}
    </div>
  )
}
