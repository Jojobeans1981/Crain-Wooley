import Link from 'next/link'
import { pageMetadata } from '@/lib/seo'
import { REVIEWS, REVIEW_COUNT } from '@/lib/reviews'
import { ReviewsGrid } from '@/components/site/ReviewsGrid'

/**
 * Client reviews — a real, data-driven page (replaces the old text-filler legacy
 * entry, which has been removed from legacy-pages.json). Renders all ~200
 * scraped testimonials in a paginated accessible-gold grid, sharing the
 * lib/reviews source of truth with the homepage carousel.
 *
 * No page-level review/rating JSON-LD: the source reviews carry no rating value,
 * and the live /reviews asserts no rating schema — so claiming an AggregateRating
 * would be fabricated. The global LegalService + address schema (app/layout.tsx)
 * still applies to this page, matching live.
 */
export const metadata = pageMetadata({
  title: 'Client Reviews & Testimonials | Crain & Wooley',
  description: `Read ${REVIEW_COUNT}+ client reviews for Crain & Wooley estate planning attorneys serving the Dallas-Fort Worth area.`,
  path: '/reviews',
})

export default function ReviewsPage() {
  return (
    <div className="cw-article-bg">
      <header className="legacy-banner">
        <div className="cw-container legacy-banner-inner">
          <nav aria-label="Breadcrumb" className="legacy-crumbs">
            <ol>
              <li><Link href="/">Home</Link></li>
              <li><span aria-current="page">Reviews</span></li>
            </ol>
          </nav>
          <h1 className="legacy-banner-title">Client Reviews</h1>
        </div>
      </header>

      <section className="cw-reviews-page" aria-label="Client testimonials">
        <div className="cw-container">
          <p className="cw-reviews-page-intro">
            <span aria-hidden="true">★★★★★</span> Rated 5 stars across {REVIEW_COUNT}+ client reviews
          </p>
          <ReviewsGrid reviews={REVIEWS} />
        </div>
      </section>
    </div>
  )
}
