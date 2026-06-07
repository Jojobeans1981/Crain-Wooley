/**
 * Legacy (migrated) marketing/blog pages from the old Scorpion site, captured by
 * the crawl of estateplanningdfw.law. Served at their ORIGINAL paths by the
 * catch-all route so SEO is preserved on cutover (see SEO Migration/).
 *
 * legacy-pages.json is generated from content_export.json. Keys are the URL path
 * with no trailing slash (e.g. "/estate-planning/trusts").
 */
import data from './legacy-pages.json'

export interface LegacyPage {
  title: string
  description: string
  h1: string
  h2s: string[]
  h3s: string[]
  type: string
  words: number
  body: string
  /** Optional hosted video/audio source (media-center pages). Embedded, never
   * committed; the file lives on the Scorpion /media host and must migrate at
   * cutover for the embed to keep working on the live domain. */
  video?: string
}

const PAGES = data as Record<string, LegacyPage>

export function getLegacyPage(path: string): LegacyPage | undefined {
  return PAGES[path]
}

export function allLegacyPaths(): string[] {
  return Object.keys(PAGES)
}

export { PAGES as LEGACY_PAGES }
