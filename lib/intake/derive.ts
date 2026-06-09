/**
 * Bridge between the rich estate questionnaire (IntakeForm) and the app's
 * lead pipeline: derive the qualification-gate fields, a human-readable
 * summary (also used as the Clio matter description), and the Prisma row.
 */
import type { IntakeForm } from '@/lib/intake/schema'
import type { IntakeFormData, PracticeArea, Urgency } from '@/types'
import {
  SERVICE_OPTIONS, OFFICE_OPTIONS, URGENCY_OPTIONS, WILLS_ASSET_OPTIONS, ASSET_OPTIONS,
} from '@/lib/intake/schema'
import { $Enums, Prisma } from '@prisma/client'

const asJson = (v: unknown): Prisma.InputJsonValue => v as Prisma.InputJsonValue

const label = (opts: ReadonlyArray<{ id: string; label: string }>, id: string) =>
  opts.find((o) => o.id === id)?.label ?? id

const yn = (v: boolean | null) => (v === true ? 'Yes' : v === false ? 'No' : '—')

/** Source urgency id → app Urgency enum (drives the qualify gate). */
export function mapUrgency(form: IntakeForm): Urgency {
  switch (form.urgency) {
    case 'soon': return 'IMMEDIATE'
    case 'month': return 'WITHIN_MONTH'
    case 'quarter': return 'WITHIN_MONTH'
    case 'planning': return 'RESEARCHING'
    default: return 'WITHIN_MONTH'
  }
}

export function mapPracticeArea(form: IntakeForm): PracticeArea {
  return form.intakeType === 'probate' ? 'PROBATE' : 'ESTATE_PLANNING'
}

export function deriveCaseType(form: IntakeForm): string {
  if (form.intakeType === 'probate') return 'Probate Administration'
  const chosen = form.services.map((s) => label(SERVICE_OPTIONS, s)).filter(Boolean)
  return chosen.length ? chosen.join(', ') : 'Estate Planning'
}

const assetLabel = (form: IntakeForm) =>
  form.intakeType === 'probate'
    ? label(ASSET_OPTIONS, form.assetRange)
    : label(WILLS_ASSET_OPTIONS, form.assetRange)

/**
 * Human-readable intake summary. Used both as the Lead.description (so the
 * qualify gate sees real content) and as the Clio matter description.
 */
export function buildIntakeSummary(form: IntakeForm): string {
  const L: string[] = []
  const add = (k: string, v: string | undefined | null) => {
    if (v && String(v).trim()) L.push(`${k}: ${String(v).trim()}`)
  }

  if (form.intakeType === 'probate') {
    L.push('PROBATE INTAKE')
    add('Decedent', form.decedentName)
    add('Relationship', form.decedentRelationship === 'other' ? form.decedentRelationshipOther : form.decedentRelationship)
    add('Date of death', form.decedentDateOfDeath)
    add('County', form.decedentCounty)
    add('Decedent TX resident', yn(form.decedentTexasResident))
    add('Client lives in TX', yn(form.clientLivesInTexas))
    add('Had a trust', yn(form.decedentHadTrust))
    add('Estate assets', assetLabel(form))
    add('Estate debts', label(ASSET_OPTIONS, form.debtRange))
    add('Owns real estate', yn(form.ownsRealEstate))
    add('Owns a business', yn(form.ownsBusiness))
    add('Out-of-state assets', yn(form.ownsOutOfState))
    add('Will exists', form.willExists)
    add('Original will', form.willHasOriginal)
    add('Will year', form.willYear)
    add('Court filed', form.probateCourtFiled)
    add('Filing county', form.probateCountyFiled)
    add('Executor appointed', yn(form.probateExecutorAppointed))
    add('Heir disputes', form.heirDisputes)
  } else {
    L.push('WILLS & TRUST INTAKE')
    add('Services', form.services.map((s) => label(SERVICE_OPTIONS, s)).join(', '))
    add('Top concerns', form.topConcerns)
    add('Greatest fear', form.worstCaseFear)
    add('Marital status', form.maritalStatus)
    add('Spouse', form.spouseName)
    add('Has children', yn(form.hasChildren))
    add('Children count', form.childrenCount)
    add('Estate value', assetLabel(form))
    add('Owns real estate', yn(form.ownsRealEstate))
    add('Owns a business', yn(form.ownsBusiness))
    add('Business type', form.businessType)
    add('Existing plan', yn(form.hasExistingPlan))
    add('Special gifts', form.specialGifts)
  }

  add('Preferred office', label(OFFICE_OPTIONS, form.preferredOffice))
  add('Consultation format', form.consultationFormat)
  add('Timeframe', label(URGENCY_OPTIONS, form.urgency))
  add('Preferred contact time', form.preferredContactTime)
  add('Heard about us via', form.source)
  add('Notes', form.notes)

  const summary = L.join('\n')
  // Gate requires a description ≥ 20 chars; the header alone guarantees that.
  return summary
}

/** Minimal shape qualifyLead() consumes (matches IntakeFormData fields it reads). */
export function deriveGateInput(form: IntakeForm): IntakeFormData {
  return {
    firstName: form.firstName,
    lastName: form.lastName,
    email: form.email,
    phone: form.phone,
    practiceArea: mapPracticeArea(form) as $Enums.PracticeArea,
    caseType: deriveCaseType(form),
    description: buildIntakeSummary(form),
    urgency: mapUrgency(form) as $Enums.Urgency,
    consentToContact: form.consentToContact,
    consentToTerms: form.consentToTerms,
  }
}

/** Build the Prisma Lead create-data (typed columns + JSON bundles). */
export function buildLeadData(form: IntakeForm, gate: { qualified: boolean; reason?: string }) {
  return {
    firstName: form.firstName,
    lastName: form.lastName,
    email: form.email,
    phone: form.phone,
    practiceArea: mapPracticeArea(form) as $Enums.PracticeArea,
    caseType: deriveCaseType(form),
    description: buildIntakeSummary(form),
    urgency: mapUrgency(form) as $Enums.Urgency,
    qualified: gate.qualified,
    disqualifyReason: gate.reason,
    status: (gate.qualified ? 'QUALIFIED' : 'DISQUALIFIED') as $Enums.LeadStatus,

    intakeType: (form.intakeType === 'probate' ? 'PROBATE' : 'WILLS') as $Enums.IntakeType,
    zip: form.zip || null,
    dob: form.dob || null,
    source: form.source || null,
    notes: form.notes || null,
    preferredOffice: form.preferredOffice || null,
    consultationFormat: form.consultationFormat || null,
    preferredContactTime: form.preferredContactTime || null,
    clientLivesInTexas: form.clientLivesInTexas,
    maritalStatus: form.maritalStatus || null,
    hasChildren: form.hasChildren,
    childrenCount: form.childrenCount || null,
    hasMinorChildren: form.hasMinorChildren,
    hasSpecialNeedsDependent: form.hasSpecialNeedsDependent,
    spouseName: form.spouseName || null,
    spouseDob: form.spouseDob || null,
    spouseEmail: form.spouseEmail || null,
    spousePhone: form.spousePhone || null,
    dateOfMarriage: form.dateOfMarriage || null,
    spouseChildrenSeparate: form.spouseChildrenSeparate || null,
    assetRange: form.assetRange || null,
    debtRange: form.debtRange || null,
    ownsRealEstate: form.ownsRealEstate,
    realEstateCount: form.realEstateCount || null,
    ownsBusiness: form.ownsBusiness,
    businessType: form.businessType || null,
    businessHasSuccession: form.businessHasSuccession,
    hasExistingPlan: form.hasExistingPlan,
    existingPlanYear: form.existingPlanYear || null,
    deedAddresses: form.deedAddresses || null,
    companyInfo: form.companyInfo || null,
    ownsOutOfState: form.ownsOutOfState,
    topConcerns: form.topConcerns || null,
    worstCaseFear: form.worstCaseFear || null,
    specialGifts: form.specialGifts || null,
    remoteContingentBeneficiaries: form.remoteContingentBeneficiaries || null,
    organDonationNotes: form.organDonationNotes || null,
    livingWillYou: form.livingWillYou,
    livingWillSpouse: form.livingWillSpouse,
    receivesGovBenefits: form.receivesGovBenefits,
    hasDivorcePayments: form.hasDivorcePayments,
    hasMarriageContract: form.hasMarriageContract,
    hasFiledGiftTaxReturns: form.hasFiledGiftTaxReturns,
    hasPriorEstatePlan: form.hasPriorEstatePlan,
    childrenHaveSpecialNeedsExtended: form.childrenHaveSpecialNeedsExtended,
    childrenReceiveGovBenefits: form.childrenReceiveGovBenefits,
    supportsAdultDependents: form.supportsAdultDependents,
    services: form.services.length ? form.services.join(',') : null,
    decedentName: form.decedentName || null,
    decedentDateOfDeath: form.decedentDateOfDeath || null,
    decedentRelationship: form.decedentRelationship || null,
    decedentRelationshipOther: form.decedentRelationshipOther || null,
    decedentCounty: form.decedentCounty || null,
    decedentTexasResident: form.decedentTexasResident,
    decedentHadTrust: form.decedentHadTrust,
    willExists: form.willExists || null,
    willHasOriginal: form.willHasOriginal || null,
    willYear: form.willYear || null,
    probateCourtFiled: form.probateCourtFiled || null,
    probateCountyFiled: form.probateCountyFiled || null,
    probateExecutorAppointed: form.probateExecutorAppointed,
    heirDisputes: form.heirDisputes || null,
    // JSON bundles
    childrenDetails: form.childrenDetails?.length ? asJson(form.childrenDetails) : undefined,
    realEstateProperties: form.realEstateProperties?.length ? asJson(form.realEstateProperties) : undefined,
    primaryBeneficiaries: form.primaryBeneficiaries?.length ? asJson(form.primaryBeneficiaries) : undefined,
    fiduciaries: asJson({
      trusteeExecutor: form.trusteeExecutor,
      trusteeExecutorBackup: form.trusteeExecutorBackup,
      financialPoaYou: form.financialPoaYou,
      financialPoaYouBackup: form.financialPoaYouBackup,
      financialPoaSpouse: form.financialPoaSpouse,
      financialPoaSpouseBackup: form.financialPoaSpouseBackup,
      medicalPoaYou: form.medicalPoaYou,
      medicalPoaYouAlternate: form.medicalPoaYouAlternate,
      medicalPoaSpouse: form.medicalPoaSpouse,
      medicalPoaSpouseAlternate: form.medicalPoaSpouseAlternate,
    }),
    attachments: asJson({
      deed: form.deedAttachmentName,
      company: form.companyAttachmentName,
      additional: form.additionalAttachmentName,
    }),
  }
}
