import data from './reviews.json'

/**
 * Single source of truth for client testimonials, scraped from the live
 * estateplanningdfw.law/reviews page (Scorpion reviews system, ~200 entries,
 * de-duplicated). Used by BOTH the homepage carousel and the /reviews page.
 */
export type Review = { title: string; quote: string; name: string; featured?: boolean }

export const REVIEWS: Review[] = data as Review[]

/** Curated subset for the homepage carousel (it cycles one at a time). Driven by
 * a `featured` flag in reviews.json (the original features a curated 8), not array
 * order. Falls back to the first 8 if nothing is flagged. The client's blessed
 * list is an open item — see docs/reference/NEXT_STEPS.md. */
const flagged = REVIEWS.filter((r) => r.featured)
export const FEATURED_REVIEWS: Review[] = flagged.length ? flagged : REVIEWS.slice(0, 8)

export const REVIEW_COUNT = REVIEWS.length
