import data from './reviews.json'

/**
 * Single source of truth for client testimonials, scraped from the live
 * estateplanningdfw.law/reviews page (Scorpion reviews system, ~200 entries,
 * de-duplicated). Used by BOTH the homepage carousel and the /reviews page.
 */
export type Review = { title: string; quote: string; name: string }

export const REVIEWS: Review[] = data as Review[]

/** Curated subset for the homepage carousel (it cycles one at a time). */
export const FEATURED_REVIEWS: Review[] = REVIEWS.slice(0, 16)

export const REVIEW_COUNT = REVIEWS.length
