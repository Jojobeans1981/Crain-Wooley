import flatRateServices from './about-us__pricing__flat-rate-services.json'

/**
 * Structured family-B interior pages (gold banner + two-column intro + accordion
 * groups + shared closers), produced by scripts/visual-diff/extract-family-b.ts.
 * When a path has a structured entry the catch-all renders FamilyBPage; otherwise
 * it falls back to the flat LegacyArticle. The rollout adds one import per page.
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

const PAGES: Record<string, FamilyBData> = {
  [flatRateServices.path]: flatRateServices as FamilyBData,
}

export function getFamilyBPage(path: string): FamilyBData | undefined {
  return PAGES[path.replace(/\/+$/, '')]
}
