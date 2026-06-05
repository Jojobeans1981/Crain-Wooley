/**
 * ============================================================================
 *  ⚖️  ATTORNEY REVIEW REQUIRED  ⚖️
 * ============================================================================
 *  This file is the quiz logic the firm OWNS. The questions, the option
 *  weights, the thresholds, and the result language below are a DRAFT and must
 *  be reviewed and red-lined by the attorney (Justin) before a quiz shows a
 *  real recommendation to a visitor — these outputs are legal-adjacent.
 *
 *  Until sign-off, keep SCORING_APPROVED = false. While false, the "tier"
 *  quizzes (trust, probate) still capture the lead but show a neutral
 *  "let's talk" message instead of a graded result. The "router" quiz
 *  (which-plan) only points to an educational guide, so it always shows.
 * ============================================================================
 */

import type { PersonaSlug } from './personas'
import { PERSONAS } from './personas'
import { PILLAR_BY_SLUG } from './pillars'

/** Gate: tier quizzes only show a graded recommendation when this is true. */
export const SCORING_APPROVED = false

export interface QuizOption {
  value: string
  label: string
  /** points toward the "yes" end of a tier quiz (ignored for router quizzes) */
  weight?: number
  /** persona signal carried by this answer */
  persona?: PersonaSlug
}
export interface QuizQuestion {
  id: string
  prompt: string
  help?: string
  options: QuizOption[]
}
export interface QuizDef {
  slug: string
  title: string
  intro: string
  /** 'tier' = graded yes/maybe/no (gated); 'router' = recommends a guide (always shows) */
  kind: 'tier' | 'router'
  questions: QuizQuestion[]
}

export interface QuizResult {
  /** tier key for graded quizzes, or persona/'mixed' for the router */
  tier: string
  headline: string
  explanation: string
  primaryPersona: PersonaSlug | null
  /** pillar slug to recommend (router quiz) */
  recommendedPillar?: string
  score?: number
  maxScore?: number
}

/* ════════════════════════ 1) DO YOU NEED A TRUST? (tier) ════════════════════════ */
export const TRUST_QUIZ: QuizDef = {
  slug: 'do-you-need-a-trust',
  title: 'Do You Need a Trust?',
  kind: 'tier',
  intro: 'A few plain questions about your family and what you own. There are no wrong answers.',
  questions: [
    { id: 'realEstate', prompt: 'Do you own a home or other real estate?', options: [
      { value: 'multi', label: 'Yes — in more than one state', weight: 3, persona: 'high_net_worth' },
      { value: 'one', label: 'Yes — in Texas only', weight: 2 },
      { value: 'no', label: 'No', weight: 0 },
    ]},
    { id: 'probate', prompt: 'How important is it to keep your family out of probate court?',
      help: 'Probate is the public court process that otherwise transfers property after death.', options: [
      { value: 'very', label: 'Very — I want to spare them that', weight: 3 },
      { value: 'somewhat', label: 'Somewhat', weight: 1 },
      { value: 'not', label: 'Not a concern', weight: 0 },
    ]},
    { id: 'privacy', prompt: 'Do you care about keeping your estate private (out of the public record)?', options: [
      { value: 'yes', label: 'Yes, privacy matters to me', weight: 2 },
      { value: 'no', label: 'Not especially', weight: 0 },
    ]},
    { id: 'dependents', prompt: 'Does your family include any of these?', options: [
      { value: 'special_needs', label: 'A loved one with a disability or special needs', weight: 3, persona: 'special_needs' },
      { value: 'minor', label: 'Minor children', weight: 2, persona: 'young_families' },
      { value: 'blended', label: 'A blended family (children from a prior relationship)', weight: 2, persona: 'blended_families' },
      { value: 'none', label: 'None of these', weight: 0 },
    ]},
    { id: 'business', prompt: 'Do you own a business or professional practice?', options: [
      { value: 'yes', label: 'Yes', weight: 2, persona: 'business_owners' },
      { value: 'no', label: 'No', weight: 0 },
    ]},
    { id: 'estate', prompt: 'Roughly, what is the total value of what you own?', options: [
      { value: 'high', label: 'Over $1 million', weight: 3, persona: 'high_net_worth' },
      { value: 'mid', label: '$250k – $1 million', weight: 2 },
      { value: 'low', label: 'Under $250k', weight: 0 },
    ]},
    { id: 'control', prompt: 'Would you want to control how and when heirs receive an inheritance?', options: [
      { value: 'yes', label: 'Yes — release it over time or with conditions', weight: 2 },
      { value: 'no', label: 'No — a simple, outright gift is fine', weight: 0 },
    ]},
  ],
}

/* ════════════════════════ 2) DO YOU NEED PROBATE? (tier) ════════════════════════ */
export const PROBATE_QUIZ: QuizDef = {
  slug: 'do-you-need-probate',
  title: 'Do You Need Probate?',
  kind: 'tier',
  intro: 'Answer a few questions about the estate and how things were titled. This is educational, not legal advice.',
  questions: [
    { id: 'soleAssets', prompt: 'Did the person own real estate or accounts titled in their name alone (no beneficiary, not in a trust)?', options: [
      { value: 'yes', label: 'Yes', weight: 4 },
      { value: 'unsure', label: 'Not sure', weight: 2 },
      { value: 'no', label: 'No', weight: 0 },
    ]},
    { id: 'realEstate', prompt: 'Did they own real estate in Texas?', options: [
      { value: 'yes', label: 'Yes', weight: 3 },
      { value: 'no', label: 'No', weight: 0 },
    ]},
    { id: 'beneficiaries', prompt: 'Are most assets covered by beneficiary designations, joint ownership, or a trust?', options: [
      { value: 'yes', label: 'Yes — most pass that way', weight: -3 },
      { value: 'some', label: 'Some of them', weight: -1 },
      { value: 'no', label: 'No / unsure', weight: 1 },
    ]},
    { id: 'size', prompt: 'Roughly how large is the estate?', options: [
      { value: 'small', label: 'Modest (a small-estate process might fit)', weight: -1 },
      { value: 'mid', label: 'Moderate', weight: 1 },
      { value: 'large', label: 'Substantial', weight: 2 },
    ]},
    { id: 'will', prompt: 'Was there a valid will?', options: [
      { value: 'yes', label: 'Yes', weight: 1 },
      { value: 'no', label: 'No', weight: 2 },
      { value: 'unsure', label: 'Not sure', weight: 1 },
    ]},
    { id: 'disputes', prompt: 'Are there disagreements among heirs or a challenge to the will?', options: [
      { value: 'yes', label: 'Yes', weight: 2 },
      { value: 'no', label: 'No', weight: 0 },
    ]},
  ],
}

/* ════════════════════════ 3) WHICH PLAN DO I NEED? (router) ════════════════════════ */
export const WHICH_PLAN_QUIZ: QuizDef = {
  slug: 'which-plan-do-i-need',
  title: 'Which Estate Plan Do I Need?',
  kind: 'router',
  intro: 'A few questions about your life and goals — we will point you to the right guide to start with.',
  questions: [
    { id: 'describe', prompt: 'Which best describes you right now?', options: [
      { value: 'young', label: 'Raising young kids', persona: 'young_families' },
      { value: 'retiree', label: 'Retired or nearing retirement', persona: 'retirees' },
      { value: 'owner', label: 'Business owner', persona: 'business_owners' },
      { value: 'blended', label: 'Blended family', persona: 'blended_families' },
      { value: 'hnw', label: 'Larger estate / tax-focused', persona: 'high_net_worth' },
      { value: 'special', label: 'Caring for someone with a disability', persona: 'special_needs' },
    ]},
    { id: 'kids', prompt: 'Do you have minor children?', options: [
      { value: 'yes', label: 'Yes', persona: 'young_families' },
      { value: 'no', label: 'No', weight: 0 },
    ]},
    { id: 'care', prompt: 'Are you concerned about long-term care or Medicaid costs?', options: [
      { value: 'yes', label: 'Yes', persona: 'retirees' },
      { value: 'no', label: 'No', weight: 0 },
    ]},
    { id: 'business', prompt: 'Do you own a business?', options: [
      { value: 'yes', label: 'Yes', persona: 'business_owners' },
      { value: 'no', label: 'No', weight: 0 },
    ]},
    { id: 'tax', prompt: 'Is your estate over about $1 million, or are taxes a concern?', options: [
      { value: 'yes', label: 'Yes', persona: 'high_net_worth' },
      { value: 'no', label: 'No', weight: 0 },
    ]},
  ],
}

export const QUIZZES: Record<string, QuizDef> = {
  [TRUST_QUIZ.slug]: TRUST_QUIZ,
  [PROBATE_QUIZ.slug]: PROBATE_QUIZ,
  [WHICH_PLAN_QUIZ.slug]: WHICH_PLAN_QUIZ,
}

/* ───────────────────────────── scorers ───────────────────────────── */

function tallyPersona(def: QuizDef, answers: Record<string, string>): PersonaSlug | null {
  const tally: Partial<Record<PersonaSlug, number>> = {}
  for (const q of def.questions) {
    const chosen = q.options.find((o) => o.value === answers[q.id])
    if (chosen?.persona) tally[chosen.persona] = (tally[chosen.persona] ?? 0) + 1
  }
  let top = 0
  let best: PersonaSlug | null = null
  for (const [p, n] of Object.entries(tally)) if ((n ?? 0) > top) { top = n ?? 0; best = p as PersonaSlug }
  return best
}

/* DRAFT thresholds — attorney to review */
const TRUST_STRONG = 8, TRUST_CONSIDER = 4
const PROBATE_LIKELY = 6, PROBATE_MAYBE = 2

function scoreTier(def: QuizDef, answers: Record<string, string>) {
  let score = 0, maxScore = 0
  for (const q of def.questions) {
    const max = Math.max(0, ...q.options.map((o) => o.weight ?? 0))
    maxScore += max
    const chosen = q.options.find((o) => o.value === answers[q.id])
    score += chosen?.weight ?? 0
  }
  return { score, maxScore, primaryPersona: tallyPersona(def, answers) }
}

export function scoreQuiz(slug: string, answers: Record<string, string>): QuizResult {
  const def = QUIZZES[slug]
  if (!def) return { tier: 'unknown', headline: '', explanation: '', primaryPersona: null }

  if (def.kind === 'router') {
    const persona = tallyPersona(def, answers) ?? 'retirees'
    const p = PERSONAS[persona]
    const pillar = PILLAR_BY_SLUG[p.startPillar]
    return {
      tier: persona,
      primaryPersona: persona,
      recommendedPillar: p.startPillar,
      headline: `Start with ${pillar?.title ?? 'the essentials'}.`,
      explanation: `Based on your answers, the ${pillar?.title ?? 'right'} guide is the best place to begin — and a quick consultation can confirm exactly which documents fit your situation.`,
    }
  }

  const { score, maxScore, primaryPersona } = scoreTier(def, answers)

  if (slug === TRUST_QUIZ.slug) {
    const tier = score >= TRUST_STRONG ? 'strong' : score >= TRUST_CONSIDER ? 'consider' : 'will-likely'
    const COPY: Record<string, [string, string]> = {
      strong: ['A trust is likely worth a conversation.', 'Several factors point toward a trust — it could help your family avoid probate, keep things private, and give you more control. The next step is a quick consultation to confirm what fits.'],
      consider: ["It's worth weighing a trust against a will.", 'You have a few factors a trust can address, but a well-drafted will might also serve you. A short consultation can tell you which is the better fit.'],
      'will-likely': ['A solid will may be all you need right now.', 'A properly drafted will and the core documents may cover you well. A trust can always be revisited as your life changes.'],
    }
    return { tier, score, maxScore, primaryPersona, headline: COPY[tier][0], explanation: COPY[tier][1] }
  }

  // probate
  const tier = score >= PROBATE_LIKELY ? 'likely' : score >= PROBATE_MAYBE ? 'maybe' : 'alternative'
  const COPY: Record<string, [string, string]> = {
    likely: ['Probate is likely required.', 'From your answers, some assets probably need to pass through Texas probate. The good news is Texas independent administration is usually faster than people expect — and a consultation can map the simplest path.'],
    maybe: ['It could go either way.', 'Depending on the details, full probate may or may not be needed — a Texas alternative might fit. A short consultation can tell you quickly.'],
    alternative: ['A simpler route may fit.', 'Much of the estate may pass outside probate, and a streamlined Texas process could be enough. A consultation can confirm and handle the paperwork.'],
  }
  return { tier, score, maxScore, primaryPersona, headline: COPY[tier][0], explanation: COPY[tier][1] }
}
