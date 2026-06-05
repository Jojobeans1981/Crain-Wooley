/**
 * Crain & Wooley — the six personas that are the spine of the Learning Center.
 * Defined once and imported everywhere (hub router, pillar tagging,
 * /learn/for/[persona] paths, persona search filter). Keep these slugs stable;
 * other modules key off them.
 *
 * The data (labels, blurbs, heuristics, OVERRIDES) lives in ./persona-data.json
 * so it is the SINGLE source of truth shared with scripts/build-search-index.mjs
 * (a plain-Node build script that can't import this .ts). This file keeps the
 * public exports/types stable for the UI.
 *
 * URL slug for personas is the kebab `path` (e.g. /learn/for/young-families).
 * `heuristics` are lowercase substrings used by the index build to AUTO-suggest a
 * persona; the human-owned source of truth is OVERRIDES.
 */
import data from './persona-data.json'

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

export const PERSONA_LIST: Persona[] = data.personas as Persona[]

export const PERSONAS: Record<PersonaSlug, Persona> = Object.fromEntries(
  PERSONA_LIST.map((p) => [p.slug, p]),
) as Record<PersonaSlug, Persona>

/** The six kebab URL slugs (for /learn/for/[persona] static params + filters). */
export const PERSONA_PATHS: string[] = PERSONA_LIST.map((p) => p.path)

/** Look up a persona by its kebab URL slug. */
export const PERSONA_BY_PATH: Record<string, Persona> = Object.fromEntries(
  PERSONA_LIST.map((p) => [p.path, p]),
)

/**
 * OVERRIDES — the human-owned source of truth for persona tagging, keyed by page
 * path → persona kebab slugs. A path present here wins over auto-suggested
 * heuristics, definitively, regardless of signal count. Promote 'auto' tags here
 * after reviewing lib/learn/persona-report.json. Edit the data in
 * ./persona-data.json (single source for both this file and the index build).
 */
export const OVERRIDES: Record<string, string[]> = data.overrides
