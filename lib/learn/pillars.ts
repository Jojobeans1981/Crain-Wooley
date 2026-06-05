/**
 * Crain & Wooley Learning Center — the nine topic pillars.
 *
 * PILLARS is the registry the hub uses to render its cards. The full editorial
 * content for each guide lives in lib/learn/content.ts (GUIDES), keyed by the
 * same slug. Existing /blogs/... URLs are NEVER moved — pillar guides are new
 * cornerstone pages that link out to those posts (see GuideContent.readlist).
 */

import type { PersonaSlug } from './personas'

export const PILLAR_SLUGS = [
  'trusts',
  'probate',
  'wills',
  'powers-of-attorney',
  'medicaid-long-term-care',
  'special-needs',
  'business-succession',
  'family-situations',
  'tax-estate-planning',
] as const

export type PillarSlug = (typeof PILLAR_SLUGS)[number]

export interface PillarMeta {
  slug: PillarSlug
  /** two-digit display number on the hub card */
  num: string
  title: string
  /** short hub-card description */
  blurb: string
  /** primary persona ('all' = broadly relevant) */
  persona: PersonaSlug | 'all'
  /** count of existing blog posts in this topic cluster */
  clusterCount: number
  /** whether a quiz anchors this pillar */
  hasQuiz: boolean
}

export const PILLARS: PillarMeta[] = [
  { slug: 'trusts', num: '01', title: 'Trusts Explained', blurb: 'What they are, revocable vs. irrevocable, and how they avoid probate.', persona: 'all', clusterCount: 19, hasQuiz: true },
  { slug: 'probate', num: '02', title: 'Probate in Texas', blurb: "What probate is, when it's required, and how to make it easier.", persona: 'all', clusterCount: 24, hasQuiz: true },
  { slug: 'wills', num: '03', title: 'Wills & the Basics', blurb: 'The foundation: wills, guardianship, and your first documents.', persona: 'young_families', clusterCount: 8, hasQuiz: false },
  { slug: 'powers-of-attorney', num: '04', title: 'Powers of Attorney & Incapacity', blurb: "Who decides for you if you can't — financial and medical.", persona: 'all', clusterCount: 8, hasQuiz: false },
  { slug: 'medicaid-long-term-care', num: '05', title: 'Medicaid & Long-Term Care', blurb: "Plan for care costs without draining everything you've saved.", persona: 'retirees', clusterCount: 8, hasQuiz: false },
  { slug: 'special-needs', num: '06', title: 'Special Needs & Disability', blurb: 'Provide for a loved one without risking their benefits.', persona: 'special_needs', clusterCount: 5, hasQuiz: false },
  { slug: 'business-succession', num: '07', title: 'Business Succession', blurb: 'Keep a family business running through any transition.', persona: 'business_owners', clusterCount: 5, hasQuiz: false },
  { slug: 'family-situations', num: '08', title: 'Family & Life Situations', blurb: 'Blended families, marriage, inheritance, and digital assets.', persona: 'blended_families', clusterCount: 30, hasQuiz: false },
  { slug: 'tax-estate-planning', num: '09', title: 'Tax & Legacy Planning', blurb: 'Reduce estate tax, protect assets, and give to causes you love.', persona: 'high_net_worth', clusterCount: 10, hasQuiz: false },
]

export const PILLAR_BY_SLUG: Record<string, PillarMeta> = Object.fromEntries(
  PILLARS.map((p) => [p.slug, p]),
)

/* ── Guide content model (full editorial copy lives in content.ts) ── */

export interface GuideBullet {
  strong?: string
  text: string
}
export interface GuideSection {
  h2: string
  /** body paragraphs (plain text) */
  body?: string[]
  /** optional bullet list under the section */
  bullets?: GuideBullet[]
}
export interface GuideFAQ {
  q: string
  a: string
}
export interface GuideLink {
  title: string
  url: string
}
export interface GuideContent {
  slug: PillarSlug
  eyebrow: string
  /** <h1> */
  title: string
  /** SEO <title> */
  metaTitle: string
  metaDescription: string
  /** bold lead-in sentence + the rest of the lede paragraph */
  leadIn: string
  lede: string
  sections: GuideSection[]
  callout: { title: string; items: GuideBullet[] }
  readlist: GuideLink[]
  quiz: { title: string; body: string; cta: string; href: string }
  faq: GuideFAQ[]
  disclaimer: string
}
