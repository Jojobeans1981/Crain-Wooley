export type PracticeArea =
  | 'ESTATE_PLANNING'
  | 'PROBATE'
  | 'FAMILY_LAW'
  | 'PERSONAL_INJURY'
  | 'BUSINESS_LAW'
  | 'CRIMINAL_DEFENSE'
  | 'REAL_ESTATE'
  | 'OTHER'

export type IntakeType = 'WILLS' | 'PROBATE'

export type Urgency =
  | 'IMMEDIATE'
  | 'WITHIN_WEEK'
  | 'WITHIN_MONTH'
  | 'RESEARCHING'

export type LeadStatus =
  | 'NEW'
  | 'QUALIFIED'
  | 'DISQUALIFIED'
  | 'PAYMENT_PENDING'
  | 'PAYMENT_COMPLETE'
  | 'SCHEDULED'
  | 'CONSULTED'
  | 'HIRED'
  | 'CLOSED_LOST'

export type PaymentStatus = 'UNPAID' | 'PENDING' | 'PAID' | 'REFUNDED'
export type Channel = 'SMS' | 'EMAIL'
export type SequenceStatus = 'PENDING' | 'SENT' | 'FAILED' | 'CANCELLED' | 'SKIPPED'

export interface IntakeFormData {
  // Step 1 — Contact
  firstName: string
  lastName: string
  email: string
  phone: string
  // Step 2 — Qualification
  practiceArea: PracticeArea
  caseType: string
  description: string
  urgency: Urgency
  // Step 3 — Consent
  consentToContact: boolean
  consentToTerms: boolean
}

export interface Lead {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  practiceArea: PracticeArea
  caseType: string
  description: string
  urgency: Urgency
  qualified: boolean
  disqualifyReason?: string
  status: LeadStatus
  paymentStatus: PaymentStatus
  stripeSessionId?: string
  paidAt?: string
  consultAt?: string
  hired: boolean
  hiredAt?: string
  clioContactId?: string
  clioMatterId?: string
  optedOut: boolean
  optedOutAt?: string
  createdAt: string
  updatedAt: string
}

export interface FunnelMetrics {
  totalLeads: number
  qualified: number
  paid: number
  scheduled: number
  hired: number
  conversionRate: number
  revenue: number
}

export interface SequenceStep {
  step: number
  channel: Channel
  delayHours: number
  template: string
  subject?: string
}
