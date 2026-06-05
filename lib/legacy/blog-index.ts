/**
 * Blog index used by the /blogs listing + date-archive routes. Posts themselves
 * are served as legacy pages by the catch-all; these routes just list them so the
 * old /blogs, /blogs/{year}, and /blogs/{year}/{month} listing URLs resolve (200)
 * instead of 404-ing at cutover. Category URLs are 301'd to /blogs in next.config.
 */
import posts from './blog-index.json'

export interface BlogPost {
  path: string
  title: string
  year: string
  month: string
  monthIdx: number
}

const POSTS = posts as BlogPost[]

export const MONTHS = [
  'january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december',
]

export const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

export function allPosts(): BlogPost[] {
  return POSTS
}
export function years(): string[] {
  return [...new Set(POSTS.map((p) => p.year))]
}
export function postsByYear(year: string): BlogPost[] {
  return POSTS.filter((p) => p.year === year)
}
export function postsByYearMonth(year: string, month: string): BlogPost[] {
  return POSTS.filter((p) => p.year === year && p.month === month)
}
export function yearMonths(): { year: string; month: string }[] {
  const seen = new Set<string>()
  const out: { year: string; month: string }[] = []
  for (const p of POSTS) {
    const k = `${p.year}/${p.month}`
    if (!seen.has(k)) { seen.add(k); out.push({ year: p.year, month: p.month }) }
  }
  return out
}
