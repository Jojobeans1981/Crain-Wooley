import data from './reviews.json'

/**
 * Single source of truth for client testimonials, scraped from the live
 * estateplanningdfw.law/reviews page (Scorpion reviews system, ~200 entries,
 * de-duplicated). Used by BOTH the homepage carousel and the /reviews page.
 */
export type Review = { title: string; quote: string; name: string; featured?: boolean }

export const REVIEWS: Review[] = data as Review[]

/** Curated subset for the reviews carousel — pinned to the exact 8 the original's
 * #ReviewsS8 band shows, IN ORDER (Donna V. first), so the carousel's slide 1
 * matches the original deterministically (pixel-parity for the testimonials band).
 * Matched by quote-headline against reviews.json; falls back to flagged/first-8. */
const FEATURED_ORDER = [
  'Thank you and God Bless', 'Very much appreciated', 'Smooth and easy', 'Professional and knowledgeable',
  'Excellent, Highly recommend', 'So good to finally have a plan', '5 Stars', 'Overall experience was seamless',
]
const pinned = FEATURED_ORDER.map((h) => REVIEWS.find((r) => (r.title + ' ' + r.quote).toLowerCase().includes(h.toLowerCase()))).filter((r): r is Review => !!r)
const flagged = REVIEWS.filter((r) => r.featured)
export const FEATURED_REVIEWS: Review[] = pinned.length >= 6 ? pinned : flagged.length ? flagged : REVIEWS.slice(0, 8)

export const REVIEW_COUNT = REVIEWS.length
