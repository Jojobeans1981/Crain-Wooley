/**
 * Crain & Wooley — the six personas that are the spine of the Learning Center.
 * Defined once here and imported everywhere (hub router, pillar tagging,
 * /learn/for/[persona] paths, persona search filter). Keep these slugs stable;
 * other modules key off them.
 *
 * URL slug for personas is the kebab `path` (e.g. /learn/for/young-families).
 * `heuristics` are lowercase substrings used by scripts/build-search-index.mjs to
 * AUTO-suggest a persona for a page; the human-owned source of truth is OVERRIDES.
 */

export const PERSONA_SLUGS = [
  'young_families',
  'retirees',
  'business_owners',
  'blended_families',
  'high_net_worth',
  'special_needs',
] as const

export type PersonaSlug = (typeof PERSONA_SLUGS)[number]

export interface Persona {
  slug: PersonaSlug
  /** kebab slug for URLs, e.g. /learn/for/young-families */
  path: string
  kicker: string
  title: string
  blurb: string
  /** the pillar slug this persona should start with */
  startPillar: string
  /** lowercase substrings that auto-suggest this persona (build-time tagging) */
  heuristics: string[]
}

export const PERSONAS: Record<PersonaSlug, Persona> = {
  young_families: {
    slug: 'young_families',
    path: 'young-families',
    kicker: 'Young families',
    title: 'Protect young children',
    blurb: 'Guardianship, a first will, and the documents that matter when kids are involved.',
    startPillar: 'wills',
    heuristics: ['minor child', 'minor children', 'guardian for', 'guardianship of a minor', 'young children', 'first will', 'new parent', 'naming a guardian'],
  },
  retirees: {
    slug: 'retirees',
    path: 'retirees',
    kicker: 'Retirees',
    title: 'Plan for later life',
    blurb: 'Avoid probate, plan for long-term care, and keep control if your health changes.',
    startPillar: 'medicaid-long-term-care',
    heuristics: ['long-term care', 'long term care', 'medicaid', 'nursing home', 'elder law', 'retirement', 'incapacit', 'aging', 'later life'],
  },
  business_owners: {
    slug: 'business_owners',
    path: 'business-owners',
    kicker: 'Business owners',
    title: 'Keep the business going',
    blurb: 'Succession, continuity, and shielding what you have built.',
    startPillar: 'business-succession',
    heuristics: ['business succession', 'business owner', 'closely held', 'buy-sell', 'partnership', 'company', 'succession plan'],
  },
  blended_families: {
    slug: 'blended_families',
    path: 'blended-families',
    kicker: 'Blended families',
    title: 'Balance everyone fairly',
    blurb: 'Provide for a spouse and children from a prior relationship without conflict.',
    startPillar: 'family-situations',
    heuristics: ['blended', 'remarriage', 'second marriage', 'stepchild', 'step-child', 'prenup', 'postnup', 'pre-postnuptial', 'prior relationship', 'prior marriage'],
  },
  high_net_worth: {
    slug: 'high_net_worth',
    path: 'high-net-worth',
    kicker: 'Higher net worth',
    title: 'Reduce tax, protect assets',
    blurb: 'Trusts, tax strategy, and charitable giving for larger estates.',
    startPillar: 'tax-estate-planning',
    heuristics: ['estate tax', 'gift tax', 'asset protection', 'high net worth', 'high-net-worth', 'irrevocable trust', 'charitable trust', 'generation-skipping', 'wealth'],
  },
  special_needs: {
    slug: 'special_needs',
    path: 'special-needs',
    kicker: 'Special needs',
    title: 'Provide for a loved one',
    blurb: 'Special needs trusts and guardianship that protect benefits.',
    startPillar: 'special-needs',
    heuristics: ['special needs', 'supplemental needs', 'disability', 'disabled', 'conservatorship', 'adult guardianship', 'snt', 'government benefits'],
  },
}

export const PERSONA_LIST: Persona[] = PERSONA_SLUGS.map((s) => PERSONAS[s])

/** The six kebab URL slugs (for /learn/for/[persona] static params + filters). */
export const PERSONA_PATHS: string[] = PERSONA_LIST.map((p) => p.path)

/** Look up a persona by its kebab URL slug. */
export const PERSONA_BY_PATH: Record<string, Persona> = Object.fromEntries(
  PERSONA_LIST.map((p) => [p.path, p]),
)

/**
 * OVERRIDES — the human-owned source of truth for persona tagging, keyed by page
 * path → persona kebab slugs. Seeded with the obvious canonical pages; promote
 * 'auto' tags here after reviewing lib/learn/persona-report.json. A path present
 * here wins over the auto-suggested heuristics in the search index build.
 *
 * NOTE: scripts/build-search-index.mjs reads this object straight from this file
 * (text-extracted) so this stays the single source of truth — edit it here only.
 */
export const OVERRIDES: Record<string, string[]> = {
  // ── Estate planning canonical pages ──
  '/estate-planning/supplemental-needs-trust': ['special-needs'],
  '/estate-planning/conservatorship': ['special-needs'],
  '/estate-planning/disability-planning': ['special-needs'],
  '/estate-planning/adult-guardianship': ['special-needs', 'young-families'],
  '/estate-planning/pre-postnuptial-agreements': ['blended-families'],
  '/estate-planning/inheritance-law': ['blended-families'],
  '/estate-planning/long-term-care-planning': ['retirees'],
  '/estate-planning/adult-medicaid': ['retirees'],
  '/estate-planning/retirement-planning': ['retirees'],
  '/estate-planning/tax-planning': ['high-net-worth'],
  '/estate-planning/asset-protection': ['high-net-worth'],
  '/estate-planning/irrevocable-trusts': ['high-net-worth'],
  '/estate-planning/charitable-trusts': ['high-net-worth'],
  '/estate-planning/wills': ['young-families'],
  '/estate-planning/wills/living-wills': ['young-families'],
  // ── Business ──
  '/business-law': ['business-owners'],
  '/business-law/business-succession-planning': ['business-owners'],
  // ── Learning Center pillars ──
  '/learn/special-needs': ['special-needs'],
  '/learn/business-succession': ['business-owners'],
  '/learn/medicaid-long-term-care': ['retirees'],
  '/learn/powers-of-attorney': ['retirees'],
  '/learn/family-situations': ['blended-families'],
  '/learn/tax-estate-planning': ['high-net-worth'],
  '/learn/wills': ['young-families'],
  // ── Quizzes ──
  '/learn/quizzes/do-you-need-a-trust': ['high-net-worth', 'retirees'],
}
