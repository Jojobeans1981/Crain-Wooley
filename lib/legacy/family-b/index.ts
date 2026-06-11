import pages from './pages.json'

/**
 * Structured family-B interior pages (gold banner + two-column intro + accordion
 * groups + shared closers), produced by scripts/visual-diff/extract-family-b.ts
 * into one combined, path-keyed file. When a path has a structured entry the
 * catch-all renders FamilyBPage; otherwise it falls back to the flat LegacyArticle.
 * The rollout just re-runs the extractor — no per-page imports.
 */
export type AccordionGroup = { heading?: string; instruction?: string; items: { title: string; body: string }[] }
export type BodyBlock =
  | { type: 'p'; text: string }
  | { type: 'h2'; text: string }
  | { type: 'h3'; text: string }
  | { type: 'ul'; items: string[] }
  // Closer band (pillars/testimonials/schedule) recorded at its document position
  // so the renderer re-inserts the shared full-bleed component in source order.
  | { type: 'closer'; which: string }
export type SidebarBlock = { kind: string; heading: string; links: { text: string; href: string }[] }
// Source-order bands: the renderer reproduces the original's band interleaving
// (intro / prose / accordion / closer in DOM order). `expanded` accordions render
// as a visible Q&A band (the original's navy FAQ), collapsed ones as the accordion.
export type Band =
  | { kind: 'intro'; heading: string; blocks: BodyBlock[]; image: string | null }
  | { kind: 'prose'; blocks: BodyBlock[] }
  | { kind: 'accordion'; heading?: string; instruction?: string; items: { title: string; body: string }[]; expanded: boolean }
  | { kind: 'cards'; heading: string; para: string; items: { title: string; body: string }[] } // light value-card panel (#CTAsS7)
  | { kind: 'closer'; which: string }
export type FamilyBData = {
  path: string
  bannerTitle: string
  contentH1: string
  introImage: string | null
  bands?: Band[] // preferred: ordered band model (older entries fall back below)
  sidebar?: SidebarBlock[] // sd-zn right-rail (sibling nav, CTA cards, office)
  badgeStrip?: boolean // aws accolade strip present under the banner
  bannerSearch?: boolean // Form_BannerV1 site-search box in the banner
  // legacy / back-compat (still emitted; used when `bands` is absent):
  bodyBlocks: BodyBlock[]
  accordionGroups: AccordionGroup[]
  closers: string[]
}

const PAGES = pages as Record<string, FamilyBData>

export function getFamilyBPage(path: string): FamilyBData | undefined {
  return PAGES[path.replace(/\/+$/, '')]
}

export function familyBPaths(): string[] {
  return Object.keys(PAGES)
}
