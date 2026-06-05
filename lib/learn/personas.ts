/**
 * Crain & Wooley — the six personas that are the spine of the Learning Center.
 * Defined once here and imported everywhere (hub router, pillar tagging, future
 * /learn/for/[persona] paths). Keep these slugs stable; other modules key off them.
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
}

export const PERSONAS: Record<PersonaSlug, Persona> = {
  young_families: {
    slug: 'young_families',
    path: 'young-families',
    kicker: 'Young families',
    title: 'Protect young children',
    blurb: 'Guardianship, a first will, and the documents that matter when kids are involved.',
    startPillar: 'wills',
  },
  retirees: {
    slug: 'retirees',
    path: 'retirees',
    kicker: 'Retirees',
    title: 'Plan for later life',
    blurb: 'Avoid probate, plan for long-term care, and keep control if your health changes.',
    startPillar: 'medicaid-long-term-care',
  },
  business_owners: {
    slug: 'business_owners',
    path: 'business-owners',
    kicker: 'Business owners',
    title: 'Keep the business going',
    blurb: 'Succession, continuity, and shielding what you have built.',
    startPillar: 'business-succession',
  },
  blended_families: {
    slug: 'blended_families',
    path: 'blended-families',
    kicker: 'Blended families',
    title: 'Balance everyone fairly',
    blurb: 'Provide for a spouse and children from a prior relationship without conflict.',
    startPillar: 'family-situations',
  },
  high_net_worth: {
    slug: 'high_net_worth',
    path: 'high-net-worth',
    kicker: 'Higher net worth',
    title: 'Reduce tax, protect assets',
    blurb: 'Trusts, tax strategy, and charitable giving for larger estates.',
    startPillar: 'tax-estate-planning',
  },
  special_needs: {
    slug: 'special_needs',
    path: 'special-needs',
    kicker: 'Special needs',
    title: 'Provide for a loved one',
    blurb: 'Special needs trusts and guardianship that protect benefits.',
    startPillar: 'special-needs',
  },
}

export const PERSONA_LIST: Persona[] = PERSONA_SLUGS.map((s) => PERSONAS[s])
