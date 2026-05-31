/**
 * Crain & Wooley intake — shared schema, options, and validators.
 *
 * Ported from the approved intake design
 * (wemovenewyork/crain-wooley-intake · intake-shared.jsx + option-counsel-final.jsx).
 * This is the single contract used by the questionnaire UI (components/intake/*)
 * and the submit payload (/api/intake). Narrowed to the two estate paths:
 * Wills & Trust and Probate.
 */

export type IntakeType = '' | 'wills' | 'probate'
export type YesNoNull = boolean | null

export interface Contact {
  name: string
  relationship: string
  address: string
  phone: string
}
export interface Beneficiary {
  name: string
  relationship: string
  percentage: string
}
export interface ChildDetail {
  fullName: string
  dob: string
  address: string
}
export interface RealEstateProperty {
  description: string
}

export const EMPTY_CONTACT: Contact = { name: '', relationship: '', address: '', phone: '' }
export const EMPTY_BENEFICIARY: Beneficiary = { name: '', relationship: '', percentage: '' }

export interface IntakeStep {
  id: string
  title: string
  hint: string
}

export const COUNSEL_STEPS_WILLS: IntakeStep[] = [
  { id: 'about', title: 'About You', hint: 'Where we should reach you, and what you want to cover.' },
  { id: 'family', title: 'Your Family', hint: 'Who you are planning for.' },
  { id: 'estate', title: 'Your Estate', hint: 'A rough picture of your assets.' },
  { id: 'key-people', title: 'Key People', hint: 'Beneficiaries, trustee, and powers of attorney.' },
  { id: 'wishes', title: 'Final Wishes', hint: 'Special gifts, end-of-life directives, and contingencies.' },
  { id: 'additional', title: 'Additional Info', hint: 'A few yes / no questions that help us prepare.' },
  { id: 'services', title: 'Services', hint: 'What you are considering.' },
  { id: 'schedule', title: 'Schedule', hint: 'Where and when we should meet.' },
]

export const COUNSEL_STEPS_PROBATE: IntakeStep[] = [
  { id: 'about', title: 'About You', hint: 'Where we should reach you.' },
  { id: 'decedent', title: 'Your Loved One', hint: 'About the person whose estate we are settling.' },
  { id: 'probate-estate', title: 'The Estate', hint: 'A rough picture of what they left.' },
  { id: 'will-filings', title: 'Will & Court', hint: 'Document status and any court action so far.' },
  { id: 'schedule', title: 'Schedule', hint: 'Where and when we should meet.' },
]

export const stepsFor = (type: IntakeType): IntakeStep[] =>
  type === 'probate' ? COUNSEL_STEPS_PROBATE : COUNSEL_STEPS_WILLS

export const SERVICE_OPTIONS = [
  { id: 'will', label: 'Last Will & Testament', note: 'Direct how your assets pass.' },
  { id: 'trust', label: 'Revocable Living Trust', note: 'Avoid probate, keep matters private.' },
  { id: 'poa', label: 'Powers of Attorney', note: 'Financial and medical directives.' },
  { id: 'probate', label: 'Probate Administration', note: 'Settle a loved one’s estate.' },
  { id: 'longterm', label: 'Long-Term Care & Medicaid', note: 'Plan for future care needs.' },
  { id: 'business', label: 'Business Succession', note: 'Transition a closely held company.' },
  { id: 'special', label: 'Special Needs Planning', note: 'Provide for a dependent with disabilities.' },
  { id: 'review', label: 'Review Existing Plan', note: 'Audit and update prior documents.' },
] as const

export const OFFICE_OPTIONS = [
  { id: 'plano', label: 'Plano', sub: 'Principal office · 2805 Dallas Pkwy' },
  { id: 'mansfield', label: 'Mansfield', sub: '1000 N Walnut Creek Dr' },
  { id: 'fortworth', label: 'Fort Worth', sub: '6040 Camp Bowie Blvd · by appointment' },
  { id: 'virtual', label: 'Virtual', sub: 'Secure video consultation' },
] as const

export const URGENCY_OPTIONS = [
  { id: 'soon', label: 'Within 2 weeks', note: 'Time sensitive matter' },
  { id: 'month', label: 'Within a month', note: 'Ready to move forward' },
  { id: 'quarter', label: 'Next few months', note: 'Researching options' },
  { id: 'planning', label: 'Just gathering information', note: 'Educating myself first' },
] as const

export const ASSET_OPTIONS = [
  { id: 'a1', label: 'Under $250,000' },
  { id: 'a2', label: '$250,000 – $1M' },
  { id: 'a3', label: '$1M – $3M' },
  { id: 'a4', label: '$3M – $10M' },
  { id: 'a5', label: 'Over $10M' },
  { id: 'a0', label: 'Prefer not to say' },
] as const

export const WILLS_ASSET_OPTIONS = [
  { id: 'w1', label: 'Less than $1M' },
  { id: 'w2', label: '$1M – $5M' },
  { id: 'w3', label: '$5M – $10M' },
  { id: 'w4', label: '$10M – $15M' },
  { id: 'w5', label: 'Over $15M' },
  { id: 'w0', label: 'Prefer not to say' },
] as const

export const SOURCE_OPTIONS = [
  'Web search', 'Referral from friend or family', 'Referred by another professional',
  'Attended a seminar / webinar', 'Existing client', 'Social media', 'Other',
] as const

export interface IntakeForm {
  intakeType: IntakeType
  firstName: string
  lastName: string
  email: string
  phone: string
  zip: string
  dob: string
  clientLivesInTexas: YesNoNull
  maritalStatus: string
  hasChildren: YesNoNull
  childrenCount: string
  childrenDetails: ChildDetail[]
  hasSpecialNeedsDependent: YesNoNull
  assetRange: string
  ownsRealEstate: YesNoNull
  ownsBusiness: YesNoNull
  hasExistingPlan: YesNoNull
  realEstateCount: string
  realEstateProperties: RealEstateProperty[]
  services: string[]
  preferredOffice: string
  urgency: string
  source: string
  notes: string
  // Wills/trust extras
  topConcerns: string
  worstCaseFear: string
  dateOfMarriage: string
  spouseName: string
  spouseDob: string
  spouseEmail: string
  spousePhone: string
  hasMinorChildren: YesNoNull
  spouseChildrenSeparate: string
  deedAddresses: string
  companyInfo: string
  businessType: string
  businessHasSuccession: YesNoNull
  existingPlanYear: string
  deedAttachmentName: string
  companyAttachmentName: string
  additionalAttachmentName: string
  primaryBeneficiaries: Beneficiary[]
  trusteeExecutor: Contact
  trusteeExecutorBackup: Contact
  financialPoaYou: Contact
  financialPoaYouBackup: Contact
  financialPoaSpouse: Contact
  financialPoaSpouseBackup: Contact
  medicalPoaYou: Contact
  medicalPoaYouAlternate: Contact
  medicalPoaSpouse: Contact
  medicalPoaSpouseAlternate: Contact
  specialGifts: string
  remoteContingentBeneficiaries: string
  livingWillYou: YesNoNull
  livingWillSpouse: YesNoNull
  organDonationNotes: string
  receivesGovBenefits: YesNoNull
  hasDivorcePayments: YesNoNull
  hasMarriageContract: YesNoNull
  hasFiledGiftTaxReturns: YesNoNull
  hasPriorEstatePlan: YesNoNull
  childrenHaveSpecialNeedsExtended: YesNoNull
  childrenReceiveGovBenefits: YesNoNull
  supportsAdultDependents: YesNoNull
  // Probate-specific
  decedentName: string
  decedentDateOfDeath: string
  decedentRelationship: string
  decedentCounty: string
  decedentRelationshipOther: string
  decedentTexasResident: YesNoNull
  decedentHadTrust: YesNoNull
  ownsOutOfState: YesNoNull
  debtRange: string
  willExists: string
  willHasOriginal: string
  willYear: string
  probateCourtFiled: string
  probateCountyFiled: string
  probateExecutorAppointed: YesNoNull
  heirDisputes: string
  consultationFormat: string
  preferredContactTime: string
  // Consents (app gate)
  consentToContact: boolean
  consentToTerms: boolean
}

export const INITIAL_FORM: IntakeForm = {
  intakeType: '',
  firstName: '', lastName: '', email: '', phone: '', zip: '',
  dob: '',
  clientLivesInTexas: null,
  maritalStatus: '', hasChildren: null, childrenCount: '',
  childrenDetails: [],
  hasSpecialNeedsDependent: null,
  assetRange: '', ownsRealEstate: null, ownsBusiness: null, hasExistingPlan: null,
  realEstateCount: '', realEstateProperties: [],
  services: [],
  preferredOffice: '', urgency: '', source: '', notes: '',
  topConcerns: '', worstCaseFear: '',
  dateOfMarriage: '', spouseName: '', spouseDob: '', spouseEmail: '', spousePhone: '',
  hasMinorChildren: null, spouseChildrenSeparate: '',
  deedAddresses: '', companyInfo: '', businessType: '', businessHasSuccession: null,
  existingPlanYear: '',
  deedAttachmentName: '', companyAttachmentName: '', additionalAttachmentName: '',
  primaryBeneficiaries: [],
  trusteeExecutor: { ...EMPTY_CONTACT }, trusteeExecutorBackup: { ...EMPTY_CONTACT },
  financialPoaYou: { ...EMPTY_CONTACT }, financialPoaYouBackup: { ...EMPTY_CONTACT },
  financialPoaSpouse: { ...EMPTY_CONTACT }, financialPoaSpouseBackup: { ...EMPTY_CONTACT },
  medicalPoaYou: { ...EMPTY_CONTACT }, medicalPoaYouAlternate: { ...EMPTY_CONTACT },
  medicalPoaSpouse: { ...EMPTY_CONTACT }, medicalPoaSpouseAlternate: { ...EMPTY_CONTACT },
  specialGifts: '', remoteContingentBeneficiaries: '',
  livingWillYou: null, livingWillSpouse: null, organDonationNotes: '',
  receivesGovBenefits: null, hasDivorcePayments: null, hasMarriageContract: null,
  hasFiledGiftTaxReturns: null, hasPriorEstatePlan: null,
  childrenHaveSpecialNeedsExtended: null, childrenReceiveGovBenefits: null,
  supportsAdultDependents: null,
  decedentName: '', decedentDateOfDeath: '', decedentRelationship: '', decedentCounty: '',
  decedentRelationshipOther: '',
  decedentTexasResident: null,
  decedentHadTrust: null,
  ownsOutOfState: null,
  debtRange: '',
  willExists: '', willHasOriginal: '', willYear: '',
  probateCourtFiled: '', probateCountyFiled: '',
  probateExecutorAppointed: null,
  heirDisputes: '',
  consultationFormat: '', preferredContactTime: '',
  consentToContact: false, consentToTerms: false,
}

/** Resize an array to exact length n, keeping existing entries. */
export function resizeList<T>(arr: T[], n: number, make: () => T): T[] {
  const out = (arr || []).slice(0, n)
  while (out.length < n) out.push(make())
  return out
}

/** Format US phone progressively as the user types. */
export function formatPhone(v: string): string {
  const d = v.replace(/\D/g, '').slice(0, 10)
  if (d.length < 4) return d
  if (d.length < 7) return `(${d.slice(0, 3)}) ${d.slice(3)}`
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`
}

/** Base per-step validation. Returns field ids that are missing or invalid. */
export function validateStep(form: IntakeForm, stepId: string): string[] {
  const errs: string[] = []
  if (stepId === 'about') {
    if (!form.firstName.trim()) errs.push('firstName')
    if (!form.lastName.trim()) errs.push('lastName')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errs.push('email')
    if (form.phone.replace(/\D/g, '').length < 10) errs.push('phone')
    if (!/^\d{5}$/.test(form.zip.trim())) errs.push('zip')
  } else if (stepId === 'family') {
    if (!form.maritalStatus) errs.push('maritalStatus')
    if (form.hasChildren === null) errs.push('hasChildren')
  } else if (stepId === 'estate') {
    if (!form.assetRange) errs.push('assetRange')
    if (form.ownsRealEstate === null) errs.push('ownsRealEstate')
    if (form.ownsBusiness === null) errs.push('ownsBusiness')
  } else if (stepId === 'services') {
    if (!form.services.length) errs.push('services')
  } else if (stepId === 'schedule') {
    if (!form.preferredOffice) errs.push('preferredOffice')
    if (!form.urgency) errs.push('urgency')
  }
  return errs
}

/** Counsel-flow validation: base rules plus conditional sub-question rules. */
export function counselValidate(form: IntakeForm, stepId: string): string[] {
  const errs = validateStep(form, stepId)
  if (stepId === 'family' && ['married', 'partnered'].includes(form.maritalStatus) && !form.spouseName.trim())
    errs.push('spouseName')
  if (stepId === 'estate' && form.ownsBusiness === true) {
    if (!form.businessType.trim()) errs.push('businessType')
    if (form.businessHasSuccession === null) errs.push('businessHasSuccession')
  }
  if (stepId === 'estate' && form.hasExistingPlan === true && !/^\d{4}$/.test(form.existingPlanYear))
    errs.push('existingPlanYear')
  if (stepId === 'services' && form.services.includes('probate')) {
    if (!form.decedentRelationship) errs.push('probateRelationship')
  }
  if (stepId === 'schedule') {
    if (!form.consultationFormat) errs.push('consultationFormat')
  }
  if (stepId === 'about' && form.intakeType === 'probate' && form.clientLivesInTexas === null) {
    errs.push('clientLivesInTexas')
  }
  if (stepId === 'decedent') {
    if (!form.decedentName.trim()) errs.push('decedentName')
    if (!form.decedentRelationship) errs.push('decedentRelationship')
    if (form.decedentRelationship === 'other' && !form.decedentRelationshipOther.trim())
      errs.push('decedentRelationshipOther')
    if (form.decedentTexasResident === null) errs.push('decedentTexasResident')
    if (form.decedentHadTrust === null) errs.push('decedentHadTrust')
  }
  if (stepId === 'probate-estate') {
    if (!form.assetRange) errs.push('assetRange')
    if (!form.debtRange) errs.push('debtRange')
    if (form.ownsRealEstate === null) errs.push('ownsRealEstate')
    if (form.ownsBusiness === null) errs.push('ownsBusiness')
    if (form.ownsOutOfState === null) errs.push('ownsOutOfState')
  }
  return errs
}
