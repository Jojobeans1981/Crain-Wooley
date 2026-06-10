import pages from './pages.json'

/**
 * Structured family-B interior pages (gold banner + two-column intro + accordion
 * groups + shared closers), produced by scripts/visual-diff/extract-family-b.ts
 * into one combined, path-keyed file. When a path has a structured entry the
 * catch-all renders FamilyBPage; otherwise it falls back to the flat LegacyArticle.
 * The rollout just re-runs the extractor — no per-page imports.
 */
export type AccordionGroup = { heading?: string; instruction?: string; items: { title: string; body: string }[] }
export type FamilyBData = {
  path: string
  bannerTitle: string
  contentH1: string
  introBody: string[]
  introImage: string | null
  accordionGroups: AccordionGroup[]
  closers: string[] // 'pillars' | 'testimonials' | 'schedule', in render order
}

const PAGES = pages as Record<string, FamilyBData>

export function getFamilyBPage(path: string): FamilyBData | undefined {
  return PAGES[path.replace(/\/+$/, '')]
}

export function familyBPaths(): string[] {
  return Object.keys(PAGES)
}
