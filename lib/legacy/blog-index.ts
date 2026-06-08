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

import legacyPages from './legacy-pages.json'

const MONTHS_FULL = ['January','February','March','April','May','June','July','August','September','October','November','December']
const pageBody = (path: string): string => ((legacyPages as Record<string, { body?: string }>)[path]?.body) ?? ''

export interface DatedBlogPost extends BlogPost { date: string; ts: number }

function postDate(p: BlogPost): { date: string; ts: number } {
  const m = pageBody(p.path).slice(0, 500).match(/(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2}),\s+(20\d\d)/)
  if (m) {
    const mi = MONTHS_FULL.indexOf(m[1])
    return { date: `${m[1]} ${Number(m[2])}, ${m[3]}`, ts: Date.UTC(Number(m[3]), mi, Number(m[2])) }
  }
  return { date: `${cap(p.month)} ${p.year}`, ts: Date.UTC(Number(p.year), p.monthIdx, 1) }
}

let _sorted: DatedBlogPost[] | null = null
export function allPostsSorted(): DatedBlogPost[] {
  if (!_sorted) _sorted = POSTS.map((p) => ({ ...p, ...postDate(p) })).sort((a, b) => b.ts - a.ts)
  return _sorted
}
