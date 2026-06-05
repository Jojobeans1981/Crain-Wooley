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
  sex: string
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

/** One review/summary card: a section title, the step id to jump to on edit, and its label/value rows. */
export interface IntakeSummarySection {
  id: string
  title: string
  rows: [string, string][]
}

const SEX_LABEL: Record<string, string> = { male: 'Male', female: 'Female' }

/**
 * Pure, presentation-free summary of the completed intake — the single source of
 * truth for both the on-screen Review step and the printable / downloadable summary.
 * Mirrors the questionnaire branch (Wills vs Probate) and drops empty rows.
 */
export function buildIntakeSummary(form: IntakeForm): IntakeSummarySection[] {
  const findLabel = (arr: ReadonlyArray<{ id: string; label: string }>, id: string) =>
    (arr.find(x => x.id === id) || { label: '' }).label || ''
  const isPartnered = ['married', 'partnered'].includes(form.maritalStatus)
  const isProbate = form.intakeType === 'probate'
  const formats: Record<string, string> = { inperson: 'In person', video: 'Video', phone: 'Phone' }
  const times: Record<string, string> = { morning: 'Mornings (8am–12pm)', afternoon: 'Afternoons (12pm–5pm)', anytime: 'Any time' }
  const triLabel: Record<string, string> = { yes: 'Yes', no: 'No', unsure: 'Not sure', elsewhere: 'Someone else has it', possible: 'Possible' }
  const trim = (s: string, n = 90) => (s && s.length > n ? s.slice(0, n - 3) + '…' : s)
  const realEstateProperties = form.realEstateProperties as unknown as string[]
  const cap = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : '')

  // Build a section, coercing each candidate row to a string pair and dropping any with an empty value.
  const sec = (id: string, title: string, rows: Array<readonly [string, unknown] | boolean | number | '' | null | undefined>): IntakeSummarySection => ({
    id,
    title,
    rows: rows
      .filter((r): r is readonly [string, unknown] => Boolean(r) && Boolean((r as readonly [string, unknown])[1]))
      .map(r => [r[0], String(r[1])] as [string, string]),
  })

  const childList = (form.childrenDetails || []).map((c, i) => {
    const name = c.fullName || (c as unknown as Record<string, string>).name || `Child ${i + 1}`
    const sex = SEX_LABEL[c.sex] || ''
    return [name, sex].filter(Boolean).join(' — ')
  }).filter(Boolean)

  const about = sec('about', 'About You', [
    ['Name', `${form.firstName} ${form.lastName}`.trim()],
    ['Email', form.email],
    ['Phone', form.phone],
    ['ZIP', form.zip],
    form.dob && ['Date of birth', form.dob],
    isProbate && form.clientLivesInTexas !== null && ['Lives in Texas', form.clientLivesInTexas ? 'Yes' : 'No'],
    !isProbate && form.topConcerns && ['Top concerns', trim(form.topConcerns)],
    !isProbate && form.worstCaseFear && ['Worst-case fear', trim(form.worstCaseFear)],
    ['Source', form.source],
  ])

  const schedule = sec('schedule', 'Schedule', [
    ['Office', findLabel(OFFICE_OPTIONS, form.preferredOffice)],
    ['Format', formats[form.consultationFormat]],
    ['Best time', times[form.preferredContactTime]],
    ['Timeline', findLabel(URGENCY_OPTIONS, form.urgency)],
    form.notes && ['Notes', form.notes],
  ])

  if (isProbate) {
    return [
      about,
      sec('decedent', 'Your Loved One', [
        ['Name', form.decedentName],
        form.decedentDateOfDeath && ['Date of death', form.decedentDateOfDeath],
        ['Relationship', form.decedentRelationship === 'other'
          ? (form.decedentRelationshipOther || 'Other')
          : cap(form.decedentRelationship)],
        form.decedentCounty && ['County of residence', form.decedentCounty],
        ['Texas resident', form.decedentTexasResident === null ? '' : (form.decedentTexasResident ? 'Yes' : 'No')],
        ['Had a trust', form.decedentHadTrust === null ? '' : (form.decedentHadTrust ? 'Yes' : 'No')],
      ]),
      sec('probate-estate', 'The Estate', [
        ['Total assets', findLabel(ASSET_OPTIONS, form.assetRange)],
        ['Total debts', findLabel(ASSET_OPTIONS, form.debtRange)],
        ['Real estate', form.ownsRealEstate === null ? '' : (form.ownsRealEstate ? `Yes${realEstateProperties.length ? ` — ${realEstateProperties.filter(Boolean).join(', ')}` : ''}` : 'No')],
        ['Business', form.ownsBusiness === null ? '' : (form.ownsBusiness ? `Yes — ${form.businessType || '—'}` : 'No')],
        ['Out-of-state', form.ownsOutOfState === null ? '' : (form.ownsOutOfState ? 'Yes' : 'No')],
      ]),
      sec('will-filings', 'Will & Court', [
        ['Will signed', triLabel[form.willExists]],
        form.willExists === 'yes' && form.willHasOriginal && ['Original document', triLabel[form.willHasOriginal] || form.willHasOriginal],
        form.willExists === 'yes' && form.willYear && ['Year drafted', form.willYear],
        ['Filed in court', triLabel[form.probateCourtFiled]],
        form.probateCourtFiled === 'yes' && form.probateCountyFiled && ['County', form.probateCountyFiled],
        form.probateCourtFiled === 'yes' && form.probateExecutorAppointed !== null && ['Executor appointed', form.probateExecutorAppointed ? 'Yes' : 'No'],
        form.heirDisputes && ['Heir disputes', triLabel[form.heirDisputes] || form.heirDisputes],
      ]),
      schedule,
    ]
  }

  return [
    about,
    sec('family', 'Your Family', [
      ['Status', cap(form.maritalStatus)],
      isPartnered && ['Spouse / partner', [form.spouseName, form.spouseDob && `DOB ${form.spouseDob}`].filter(Boolean).join(' · ')],
      isPartnered && form.dateOfMarriage && ['Date of marriage', form.dateOfMarriage],
      ['Children', form.hasChildren ? (form.childrenCount || 'Yes') : 'No'],
      childList.length && ['Children listed', childList.join('; ')],
      form.hasMinorChildren !== null && ['Children under 18', form.hasMinorChildren ? 'Yes' : 'No'],
      form.spouseChildrenSeparate && ['Spouse\'s separate children', form.spouseChildrenSeparate],
      form.hasSpecialNeedsDependent !== null && ['Special needs dependent', form.hasSpecialNeedsDependent ? 'Yes' : 'No'],
    ]),
    sec('estate', 'Your Estate', [
      ['Approx. value', findLabel(WILLS_ASSET_OPTIONS, form.assetRange)],
      ['Real estate', form.ownsRealEstate === null ? '' : (form.ownsRealEstate ? `Yes${form.realEstateCount ? ` (${form.realEstateCount})` : ''}` : 'No')],
      form.deedAddresses && ['Deed info', form.deedAddresses.split('\n').filter(Boolean).join(' · ')],
      form.deedAttachmentName && ['Deed attached', form.deedAttachmentName],
      ['Business', form.ownsBusiness === null ? '' : (form.ownsBusiness ? `Yes — ${form.businessType}${form.businessHasSuccession !== null ? ` (succession plan: ${form.businessHasSuccession ? 'yes' : 'no'})` : ''}` : 'No')],
      form.companyInfo && ['Company info', form.companyInfo.split('\n').filter(Boolean).join(' · ')],
      form.companyAttachmentName && ['Company doc attached', form.companyAttachmentName],
      ['Existing plan', form.hasExistingPlan === null ? '' : (form.hasExistingPlan ? `Yes (${form.existingPlanYear})` : 'No')],
    ]),
    sec('key-people', 'Key People', [
      ['Primary beneficiaries', form.primaryBeneficiaries.length
        ? form.primaryBeneficiaries.map(b => `${b.name || '—'}${b.relationship ? ` (${b.relationship})` : ''}${b.percentage ? ` · ${b.percentage}%` : ''}`).join('; ')
        : '—'],
      ['Trustee / Executor', form.trusteeExecutor.name || '—'],
      form.trusteeExecutorBackup.name && ['Backup trustee', form.trusteeExecutorBackup.name],
      ['Financial POA (you)', form.financialPoaYou.name || '—'],
      form.financialPoaYouBackup.name && ['Backup financial POA', form.financialPoaYouBackup.name],
      isPartnered && form.financialPoaSpouse.name && ['Financial POA (spouse)', form.financialPoaSpouse.name],
      isPartnered && form.financialPoaSpouseBackup.name && ['Backup financial POA (spouse)', form.financialPoaSpouseBackup.name],
      ['Medical POA (you)', form.medicalPoaYou.name || '—'],
      form.medicalPoaYouAlternate.name && ['Alternate medical POA', form.medicalPoaYouAlternate.name],
      isPartnered && form.medicalPoaSpouse.name && ['Medical POA (spouse)', form.medicalPoaSpouse.name],
      isPartnered && form.medicalPoaSpouseAlternate.name && ['Alternate medical POA (spouse)', form.medicalPoaSpouseAlternate.name],
    ]),
    sec('wishes', 'Final Wishes', [
      form.specialGifts && ['Special gifts', trim(form.specialGifts)],
      form.remoteContingentBeneficiaries && ['Remote contingents', trim(form.remoteContingentBeneficiaries)],
      form.livingWillYou !== null && ['Living Will (you)', form.livingWillYou ? 'Yes' : 'No'],
      isPartnered && form.livingWillSpouse !== null && ['Living Will (spouse)', form.livingWillSpouse ? 'Yes' : 'No'],
      form.organDonationNotes && ['Organ donation', form.organDonationNotes],
    ]),
    sec('additional', 'Additional Info', [
      form.receivesGovBenefits !== null && ['Gov benefits', form.receivesGovBenefits ? 'Yes' : 'No'],
      form.hasDivorcePayments !== null && ['Divorce / settlement payments', form.hasDivorcePayments ? 'Yes' : 'No'],
      form.hasMarriageContract !== null && ['Pre / post-marriage contract', form.hasMarriageContract ? 'Yes' : 'No'],
      form.hasFiledGiftTaxReturns !== null && ['Gift tax returns', form.hasFiledGiftTaxReturns ? 'Yes' : 'No'],
      form.hasPriorEstatePlan !== null && ['Prior estate plan', form.hasPriorEstatePlan ? 'Yes' : 'No'],
      form.childrenHaveSpecialNeedsExtended !== null && ['Children with special needs', form.childrenHaveSpecialNeedsExtended ? 'Yes' : 'No'],
      form.childrenReceiveGovBenefits !== null && ['Children receiving gov benefits', form.childrenReceiveGovBenefits ? 'Yes' : 'No'],
      form.supportsAdultDependents !== null && ['Supports adult dependents', form.supportsAdultDependents ? 'Yes' : 'No'],
      form.additionalAttachmentName && ['Attached', form.additionalAttachmentName],
    ]),
    sec('services', 'Services', [
      ['Selected', form.services.map(id => findLabel(SERVICE_OPTIONS as ReadonlyArray<{ id: string; label: string }>, id)).join(', ')],
      form.services.includes('probate') && ['Probate context', `${form.decedentRelationship}${form.decedentDateOfDeath ? ` · ${form.decedentDateOfDeath}` : ''}`],
    ]),
    schedule,
  ]
}
