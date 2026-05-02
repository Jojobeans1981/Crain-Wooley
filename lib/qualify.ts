import type { IntakeFormData } from '@/types'

export interface QualificationResult {
  qualified: boolean
  reason?: string
}

/**
 * Core qualification logic for Crain & Wooley intake.
 * Disqualify conditions are checked in priority order.
 * Edit rules here as the firm's criteria evolve.
 */
export function qualifyLead(data: IntakeFormData): QualificationResult {
  // Rule 1: Researching with no urgency — low intent, disqualify
  if (data.urgency === 'RESEARCHING') {
    return {
      qualified: false,
      reason: 'Lead is in research phase — no immediate legal need identified.',
    }
  }

  // Rule 2: "Other" practice area — cannot route
  if (data.practiceArea === 'OTHER') {
    return {
      qualified: false,
      reason: 'Practice area does not match current firm offerings.',
    }
  }

  // Rule 3: Description too vague (< 20 chars)
  if (data.description.trim().length < 20) {
    return {
      qualified: false,
      reason: 'Insufficient case description — cannot assess legal need.',
    }
  }

  // Rule 4: Negative Keywords (Low Intent / Out of Scope)
  const negativeKeywords = [
    'pro bono',
    'free advice',
    'free consultation',
    'contingency',
    'legal aid',
    'suing for a million',
  ]
  const descLower = data.description.toLowerCase()
  if (negativeKeywords.some((kw) => descLower.includes(kw))) {
    return {
      qualified: false,
      reason: 'Lead criteria matches excluded case profiles (Low Intent / Pro Bono).',
    }
  }

  // Rule 5: Missing consent
  if (!data.consentToContact || !data.consentToTerms) {
    return {
      qualified: false,
      reason: 'Required consents not provided.',
    }
  }

  // ✅ Passed all gates
  return { qualified: true }
}
