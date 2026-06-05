/**
 * Section / sibling navigation for legacy interior pages.
 *
 * Read-only derivation over the existing legacy path tree (LEGACY_PAGES). Given a
 * current path it returns the top-level SECTION nav — the section landing plus
 * every descendant, with depth-3 pages nested under their depth-2 parent — which
 * mirrors the live Scorpion interior sidebar (e.g. /estate-planning/trusts shows
 * the whole Estate Planning section; a depth-3 page shows the same list with its
 * depth-2 ancestor and itself both marked active).
 *
 * Labels are humanized from the path segment: the captured `title`/`h1` are long
 * SEO strings ("Dallas-Fort Worth Asset Protection Lawyers | …"), not the short
 * CMS nav labels the live sidebar uses, and the short labels were not captured.
 *
 * Returns null (article keeps its single-column layout) when:
 *   - the section has fewer than 2 sibling pages, or
 *   - the path is one of the dated /blogs/YYYY/… posts.
 */
import { LEGACY_PAGES } from './index'

export interface SectionNavItem {
  path: string
  label: string
  active: boolean      // exact current page
  ancestor: boolean    // current page is a descendant of this item
  children: SectionNavItem[]
}

export interface SectionNav {
  /** Section heading label (humanized top-level segment). */
  label: string
  /** Section landing page path, or null if no landing page exists in the data. */
  landingPath: string | null
  landingActive: boolean
  items: SectionNavItem[]
}

const DATED_BLOG = /^\/blogs\/\d{4}\//
const SMALL_WORDS = new Set(['of', 'and', 'the', 'for', 'to', 'a', 'in', 'on', 'or'])

/** "supplemental-needs-trust" → "Supplemental Needs Trust", "power-of-attorney" → "Power of Attorney". */
function humanize(segment: string): string {
  return segment
    .split('-')
    .map((w, i) => (i > 0 && SMALL_WORDS.has(w) ? w : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(' ')
}

const noSlash = (p: string) => p.replace(/\/+$/, '')
const lastSeg = (p: string) => p.split('/').filter(Boolean).pop() ?? p

/** Direct children of `parent` present in the data (one segment deeper, sorted). */
function directChildren(keys: string[], parent: string): string[] {
  const prefix = parent + '/'
  return keys
    .filter((k) => {
      if (!k.startsWith(prefix)) return false
      const rest = k.slice(prefix.length)
      return rest.length > 0 && !rest.includes('/')
    })
    .sort()
}

export function getSectionNav(currentPath: string): SectionNav | null {
  if (!currentPath || currentPath === '/') return null
  const cur = noSlash(currentPath)
  if (DATED_BLOG.test(cur)) return null // dated blog posts keep the article-only layout

  const segments = cur.replace(/^\//, '').split('/')
  const section = '/' + segments[0]
  const keys = Object.keys(LEGACY_PAGES)

  const depth2 = directChildren(keys, section)
  if (depth2.length < 2) return null // a lone (or no) sibling → no sidebar

  const items: SectionNavItem[] = depth2.map((d2) => {
    const children: SectionNavItem[] = directChildren(keys, d2).map((d3) => ({
      path: d3,
      label: humanize(lastSeg(d3)),
      active: noSlash(d3) === cur,
      ancestor: false,
      children: [],
    }))
    return {
      path: d2,
      label: humanize(lastSeg(d2)),
      active: noSlash(d2) === cur,
      ancestor: children.some((c) => c.active),
      children,
    }
  })

  return {
    label: humanize(segments[0]),
    landingPath: LEGACY_PAGES[section] ? section : null,
    landingActive: noSlash(section) === cur,
    items,
  }
}
