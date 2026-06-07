import Link from 'next/link'
import { pageMetadata } from '@/lib/seo'
import { REVIEWS, REVIEW_COUNT } from '@/lib/reviews'
import { ReviewsGrid } from '@/components/site/ReviewsGrid'

/**
 * Client reviews — a real, data-driven page (replaces the old text-filler legacy
 * entry, which has been removed from legacy-pages.json). Renders all ~200
 * scraped testimonials in a paginated accessible-gold grid, sharing the
 * lib/reviews source of truth with the homepage carousel. Review/AggregateRating
 * JSON-LD mirrors the live site's review schema.
 */
export const metadata = pageMetadata({
  title: 'Client Reviews & Testimonials | Crain & Wooley',
  description: `Read ${REVIEW_COUNT}+ client reviews for Crain & Wooley estate planning attorneys serving the Dallas-Fort Worth area.`,
  path: '/reviews',
})

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'LegalService',
  name: 'Crain & Wooley',
  url: 'https://www.estateplanningdfw.law/reviews',
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '5',
    bestRating: '5',
    reviewCount: String(REVIEW_COUNT),
  },
  review: REVIEWS.slice(0, 12).map((r) => ({
    '@type': 'Review',
    reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' },
    author: { '@type': 'Person', name: r.name.replace(/^[—-]\s*/, '') || 'Crain & Wooley Client' },
    name: r.title,
    reviewBody: r.quote,
  })),
}

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

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </div>
  )
}
