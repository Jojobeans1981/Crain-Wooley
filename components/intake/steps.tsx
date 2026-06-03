'use client'

import type React from 'react'
import { cf } from '@/lib/cf'
import {
  SERVICE_OPTIONS,
  OFFICE_OPTIONS,
  URGENCY_OPTIONS,
  ASSET_OPTIONS,
  WILLS_ASSET_OPTIONS,
  SOURCE_OPTIONS,
  EMPTY_BENEFICIARY,
  formatPhone,
  resizeList,
  buildIntakeSummary,
} from '@/lib/intake/schema'
import type { IntakeForm } from '@/lib/intake/schema'
import { PrivacyShield } from '@/components/intake/PrivacyShield'
import {
  Field,
  Input,
  RadioCard,
  CheckCard,
  YesNo,
  TriOption,
  Select,
  Reveal,
  Textarea,
  ContactBlock,
  BeneficiaryRow,
  FileUploadStub,
} from '@/components/intake/primitives'

type UpdateFn = (patch: Partial<IntakeForm> & { __jumpTo?: string }) => void

// ---------- Step bodies ----------

export function CounselFinalStep({
  stepId,
  form,
  errors,
  update,
  isMobile,
}: {
  stepId: string
  form: IntakeForm
  errors: string[]
  update: UpdateFn
  isMobile: boolean
}) {
  const has = (id: string) => errors.includes(id)

  if (stepId === 'about') {
    const isProbate = form.intakeType === 'probate'
    const isWills = form.intakeType === 'wills'
    return (
      <div style={isMobile
        ? { display: 'flex', flexDirection: 'column', gap: 18 }
        : { display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 18, gridRowGap: 22 }
      }>
        <Field label="First name" required error={has('firstName')} span={3}>
          <Input value={form.firstName} onChange={e => update({ firstName: e.target.value })} placeholder="Margaret" error={has('firstName')} />
        </Field>
        <Field label="Last name" required error={has('lastName')} span={3}>
          <Input value={form.lastName} onChange={e => update({ lastName: e.target.value })} placeholder="Bellweather" error={has('lastName')} />
        </Field>
        <Field label="Email address" required error={has('email')} span={4}>
          <Input type="email" value={form.email} onChange={e => update({ email: e.target.value })} placeholder="m.bellweather@example.com" error={has('email')} />
        </Field>
        <Field label="Phone" required error={has('phone')} span={2}>
          <Input type="tel" value={form.phone} onChange={e => update({ phone: formatPhone(e.target.value) })} placeholder="(972) 555-0100" error={has('phone')} />
        </Field>
        <Field label="ZIP code" required error={has('zip')} hint="Routes you to your nearest office." span={2}>
          <Input value={form.zip} onChange={e => update({ zip: e.target.value.replace(/\D/g,'').slice(0,5) })} placeholder="75093" error={has('zip')} />
        </Field>
        <Field label="Date of birth" span={2}>
          <Input type="date" value={form.dob} onChange={e => update({ dob: e.target.value })} />
        </Field>
        <Field label="How did you hear of us?" span={2}>
          <Select value={form.source} onChange={e => update({ source: e.target.value })}>
            <option value="">Select an option</option>
            {SOURCE_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </Select>
        </Field>
        {isProbate && (
          <Field label="Do you live in Texas?" required error={has('clientLivesInTexas')}
            hint="Texas residency affects who can serve as executor." span={6}>
            <YesNo value={form.clientLivesInTexas} onChange={v => update({ clientLivesInTexas: v })} error={has('clientLivesInTexas')} />
          </Field>
        )}
        {isWills && (
          <>
            <Field label="Your top three concerns or goals"
              hint="What do you most want to cover during the consultation?" span={6}>
              <Textarea value={form.topConcerns} onChange={e => update({ topConcerns: e.target.value })}
                placeholder={'1. Make sure my spouse is taken care of\n2. Avoid probate for the kids\n3. Keep the family business intact'}
                rows={4} />
            </Field>
            <Field label="What would you most want to avoid?"
              hint="The worst-case scenario if your final wishes were not honored." span={6}>
              <Textarea value={form.worstCaseFear} onChange={e => update({ worstCaseFear: e.target.value })}
                placeholder="A long court process. Family disputes. Taxes eating the inheritance."
                rows={3} />
            </Field>
          </>
        )}
      </div>
    )
  }

  if (stepId === 'family') {
    const statuses: [string, string][] = [['single','Single'],['married','Married'],['partnered','Partnered'],['divorced','Divorced'],['widowed','Widowed']]
    const isPartnered = ['married','partnered'].includes(form.maritalStatus)
    const isWills = form.intakeType === 'wills'
    const childrenDetails = form.childrenDetails as unknown as Array<Record<string, string>>
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>
        <Field label="Marital status" required error={has('maritalStatus')}>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(5, 1fr)', gap: 8 }}>
            {statuses.map(([id, l]) => (
              <RadioCard key={id} narrow checked={form.maritalStatus === id}
                onClick={() => update({ maritalStatus: id, spouseName: ['married','partnered'].includes(id) ? form.spouseName : '' })}
                label={l} />
            ))}
          </div>
        </Field>
        <Reveal open={isPartnered}>
          <div style={{ padding: '18px 20px', background: cf.ivoryWarm, borderLeft: `2px solid ${cf.brass}`, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <span style={{ fontFamily: cf.mono, fontSize: 10.5, letterSpacing: '0.18em', textTransform: 'uppercase', color: cf.brass, fontWeight: 600 }}>
              {form.maritalStatus === 'married' ? 'Your spouse' : 'Your partner'}
            </span>
            <Field label="Full legal name" required={isPartnered} error={has('spouseName')}
              hint="Include any AKAs / also-known-as names.">
              <Input value={form.spouseName} onChange={e => update({ spouseName: e.target.value })}
                placeholder="James A. Bellweather" error={has('spouseName')} />
            </Field>
            {isWills && (
              <>
                <div style={isMobile
                  ? { display: 'flex', flexDirection: 'column', gap: 14 }
                  : { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }
                }>
                  <Field label="Date of marriage">
                    <Input type="date" value={form.dateOfMarriage}
                      onChange={e => update({ dateOfMarriage: e.target.value })} />
                  </Field>
                  <Field label={`${form.maritalStatus === 'married' ? 'Spouse' : 'Partner'}'s date of birth`}>
                    <Input type="date" value={form.spouseDob}
                      onChange={e => update({ spouseDob: e.target.value })} />
                  </Field>
                </div>
                <div style={isMobile
                  ? { display: 'flex', flexDirection: 'column', gap: 14 }
                  : { display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 16 }
                }>
                  <Field label={`${form.maritalStatus === 'married' ? 'Spouse' : 'Partner'}'s email`}
                    hint="Optional — for joint planning correspondence.">
                    <Input type="email" value={form.spouseEmail}
                      onChange={e => update({ spouseEmail: e.target.value })}
                      placeholder="j.bellweather@example.com" />
                  </Field>
                  <Field label={`${form.maritalStatus === 'married' ? 'Spouse' : 'Partner'}'s phone`}>
                    <Input type="tel" value={form.spousePhone}
                      onChange={e => update({ spousePhone: formatPhone(e.target.value) })}
                      placeholder="(972) 555-0100" />
                  </Field>
                </div>
              </>
            )}
          </div>
        </Reveal>
        <div style={isMobile
          ? { display: 'flex', flexDirection: 'column', gap: 20 }
          : { display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 20 }
        }>
          <Field label="Do you have children?" required error={has('hasChildren')}>
            <YesNo value={form.hasChildren} onChange={v => update({ hasChildren: v, childrenCount: v ? form.childrenCount : '', childrenDetails: v ? form.childrenDetails : [] })} error={has('hasChildren')} />
          </Field>
          {form.hasChildren && (
            <Field label="How many?" hint="Including step-children if applicable.">
              <Input value={form.childrenCount} onChange={e => {
                const raw = e.target.value.replace(/\D/g,'').slice(0,2)
                const n = raw === '' ? 0 : Math.min(parseInt(raw, 10), 12)
                update({ childrenCount: raw, childrenDetails: resizeList(form.childrenDetails, n, () => ({ fullName: '', dob: '', address: '', sex: '' })) })
              }} placeholder="0" maxWidth={120} />
            </Field>
          )}
        </div>
        <Reveal open={form.hasChildren === true && form.childrenDetails.length > 0}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {childrenDetails.map((child, i) => (
              <div key={i} style={{ padding: '18px 20px', background: cf.ivoryWarm, borderLeft: `2px solid ${cf.brass}`, display: 'flex', flexDirection: 'column', gap: 14 }}>
                <span style={{ fontFamily: cf.mono, fontSize: 10.5, letterSpacing: '0.18em', textTransform: 'uppercase', color: cf.brass, fontWeight: 600 }}>
                  Child {i + 1}
                </span>
                <div style={isMobile
                  ? { display: 'flex', flexDirection: 'column', gap: 14 }
                  : { display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }
                }>
                  <Field label={isWills ? 'Full legal name' : 'First name'}>
                    <Input value={isWills ? (child.fullName || child.name || '') : (child.name || child.fullName || '')}
                      onChange={e => {
                        const next = childrenDetails.slice()
                        next[i] = { ...next[i], [isWills ? 'fullName' : 'name']: e.target.value }
                        update({ childrenDetails: next as unknown as IntakeForm['childrenDetails'] })
                      }} placeholder={isWills ? 'Emma R. Bellweather' : 'Emma'} />
                  </Field>
                  <Field label={isWills ? 'Date of birth' : 'Age'}>
                    {isWills ? (
                      <Input type="date" value={child.dob || ''}
                        onChange={e => {
                          const next = childrenDetails.slice()
                          next[i] = { ...next[i], dob: e.target.value }
                          update({ childrenDetails: next as unknown as IntakeForm['childrenDetails'] })
                        }} />
                    ) : (
                      <Input value={child.age || ''}
                        onChange={e => {
                          const next = childrenDetails.slice()
                          next[i] = { ...next[i], age: e.target.value.replace(/\D/g,'').slice(0,3) }
                          update({ childrenDetails: next as unknown as IntakeForm['childrenDetails'] })
                        }} placeholder="12" maxWidth={120} />
                    )}
                  </Field>
                </div>
                <Field label="Sex">
                  <TriOption
                    options={[['Male', 'male'], ['Female', 'female']]}
                    value={child.sex || ''}
                    onChange={v => {
                      const next = childrenDetails.slice()
                      next[i] = { ...next[i], sex: v }
                      update({ childrenDetails: next as unknown as IntakeForm['childrenDetails'] })
                    }}
                    maxWidth={240} />
                </Field>
                <Field label="Address" hint="Use “lives with us” for minors or dependents in the home.">
                  <Input value={child.address || ''}
                    onChange={e => {
                      const next = childrenDetails.slice()
                      next[i] = { ...next[i], address: e.target.value }
                      update({ childrenDetails: next as unknown as IntakeForm['childrenDetails'] })
                    }} placeholder="123 Oak Lane, Plano TX 75093  or  lives with us" />
                </Field>
              </div>
            ))}
          </div>
        </Reveal>
        {isWills && form.hasChildren === true && (
          <Field label="Any children under 18?" hint="Determines whether we set up a guardian / minor's trust.">
            <YesNo value={form.hasMinorChildren} onChange={v => update({ hasMinorChildren: v })} />
          </Field>
        )}
        {isWills && isPartnered && (
          <Field label={`Does your ${form.maritalStatus === 'married' ? 'spouse' : 'partner'} have children that are not also yours?`}
            hint="If so, list their full legal names so we can prepare blended-family provisions.">
            <Textarea value={form.spouseChildrenSeparate}
              onChange={e => update({ spouseChildrenSeparate: e.target.value })}
              placeholder="None — or list full legal names, separated by commas." rows={2} />
          </Field>
        )}
        <Field label="Do you provide for a dependent with special needs?" hint="A Supplemental Needs Trust may be appropriate.">
          <YesNo value={form.hasSpecialNeedsDependent} onChange={v => update({ hasSpecialNeedsDependent: v })} />
        </Field>
      </div>
    )
  }

  if (stepId === 'estate') {
    const brackets = WILLS_ASSET_OPTIONS
    const realEstateProperties = form.realEstateProperties as unknown as string[]
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>
        <Field label="Approximate total assets" required error={has('assetRange')}
          hint="Real estate, investments, retirement accounts, business interests, and personal property. Include assets owned individually or with a spouse / partner.">
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(1, 1fr)' : 'repeat(3, 1fr)', gap: 8 }}>
            {brackets.map(a => (
              <RadioCard key={a.id} narrow checked={form.assetRange === a.id} onClick={() => update({ assetRange: a.id })} label={a.label} />
            ))}
          </div>
        </Field>
        <div style={isMobile
          ? { display: 'flex', flexDirection: 'column', gap: 20 }
          : { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20 }
        }>
          <Field label="Own real estate?" required error={has('ownsRealEstate')}>
            <YesNo value={form.ownsRealEstate} onChange={v => update({ ownsRealEstate: v, realEstateCount: v ? form.realEstateCount : '', realEstateProperties: v ? form.realEstateProperties : [] })} error={has('ownsRealEstate')} />
          </Field>
          <Field label="Own a business?" required error={has('ownsBusiness')}>
            <YesNo value={form.ownsBusiness} onChange={v => update({ ownsBusiness: v, businessType: v ? form.businessType : '', businessHasSuccession: v ? form.businessHasSuccession : null })} error={has('ownsBusiness')} />
          </Field>
          <Field label="Existing estate plan?" hint="Will, trust, or POA already in place.">
            <YesNo value={form.hasExistingPlan} onChange={v => update({ hasExistingPlan: v, existingPlanYear: v ? form.existingPlanYear : '' })} />
          </Field>
        </div>
        <Reveal open={form.ownsRealEstate === true}>
          <div style={{ padding: '18px 20px', background: cf.ivoryWarm, borderLeft: `2px solid ${cf.brass}`, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Field label="How many properties?" hint="Approximate is fine — we will refine during the consultation.">
              <Input value={form.realEstateCount} onChange={e => {
                const raw = e.target.value.replace(/\D/g,'').slice(0,2)
                const n = raw === '' ? 0 : Math.min(parseInt(raw, 10), 20)
                update({ realEstateCount: raw, realEstateProperties: resizeList(realEstateProperties, n, () => '') as unknown as IntakeForm['realEstateProperties'] })
              }} placeholder="0" maxWidth={120} />
            </Field>
            {realEstateProperties.map((p, i) => (
              <Field key={i} label={`Property ${i + 1}`}
                hint={i === 0 ? 'Short description plus general location — full addresses come up during the consultation.' : undefined}>
                <Input value={p}
                  onChange={e => {
                    const next = realEstateProperties.slice()
                    next[i] = e.target.value
                    update({ realEstateProperties: next as unknown as IntakeForm['realEstateProperties'] })
                  }}
                  placeholder={i === 0 ? 'Primary residence — Plano, TX' : i === 1 ? 'Rental condo — Galveston, TX' : 'Property type — city, state'} />
              </Field>
            ))}
            <Field label="Deed addresses or identifying info"
              hint="If you have deeds, bring them to the consultation. If not, list the addresses or other identifying info here.">
              <Textarea value={form.deedAddresses}
                onChange={e => update({ deedAddresses: e.target.value })}
                placeholder="123 Oak Lane, Plano TX 75093 (homestead)&#10;456 Beach Blvd Unit 2B, Galveston TX (rental)"
                rows={3} />
            </Field>
            <Field label="Attach a deed (optional)" hint="Stored locally for the demo — not transmitted.">
              <FileUploadStub value={form.deedAttachmentName}
                onChange={n => update({ deedAttachmentName: n })}
                label="Attach deed" />
            </Field>
          </div>
        </Reveal>
        <Reveal open={form.ownsBusiness === true}>
          <div style={{ padding: '18px 20px', background: cf.ivoryWarm, borderLeft: `2px solid ${cf.brass}`, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={isMobile
              ? { display: 'flex', flexDirection: 'column', gap: 14 }
              : { display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }
            }>
              <Field label="Business type" required={form.ownsBusiness === true} error={has('businessType')}>
                <Input value={form.businessType} onChange={e => update({ businessType: e.target.value })} placeholder="Family-owned construction company, professional practice, etc." error={has('businessType')} />
              </Field>
              <Field label="Succession plan in place?" required={form.ownsBusiness === true} error={has('businessHasSuccession')}>
                <YesNo value={form.businessHasSuccession} onChange={v => update({ businessHasSuccession: v })} error={has('businessHasSuccession')} />
              </Field>
            </div>
            <Field label="LLC / corp / partnership details"
              hint="Entity name, state of formation, and your percentage / number of shares.">
              <Textarea value={form.companyInfo}
                onChange={e => update({ companyInfo: e.target.value })}
                placeholder="Bellweather Holdings LLC — Texas — 100% member&#10;NorthStar Partners LP — Delaware — 25% limited partner"
                rows={3} />
            </Field>
            <Field label="Attach company documents (optional)" hint="Certificate of Formation, Operating Agreement, etc.">
              <FileUploadStub value={form.companyAttachmentName}
                onChange={n => update({ companyAttachmentName: n })}
                label="Attach company doc" />
            </Field>
          </div>
        </Reveal>
        <Reveal open={form.hasExistingPlan === true}>
          <div style={{ padding: '18px 20px', background: cf.ivoryWarm, borderLeft: `2px solid ${cf.brass}` }}>
            <Field label="Approximate year drafted" required={form.hasExistingPlan === true} error={has('existingPlanYear')}
              hint="If you have documents from multiple years, the most recent is fine.">
              <Input value={form.existingPlanYear} onChange={e => update({ existingPlanYear: e.target.value.replace(/\D/g,'').slice(0,4) })} placeholder="2014" error={has('existingPlanYear')} maxWidth={160} />
            </Field>
          </div>
        </Reveal>
      </div>
    )
  }

  if (stepId === 'key-people') {
    const isPartnered = ['married','partnered'].includes(form.maritalStatus)
    const RoleSection = ({ eyebrow, title, hint, children }: { eyebrow: React.ReactNode; title: React.ReactNode; hint?: React.ReactNode; children: React.ReactNode }) => (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 4 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontFamily: cf.mono, fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: cf.brass, fontWeight: 600 }}>{eyebrow}</span>
          <span style={{ fontFamily: cf.serif, fontSize: isMobile ? 22 : 26, color: cf.ink, fontWeight: 700, lineHeight: 1.15, letterSpacing: '-0.005em' }}>{title}</span>
          {hint && <span style={{ fontFamily: cf.sans, fontSize: 13.5, color: cf.textMute, lineHeight: 1.55, marginTop: 2 }}>{hint}</span>}
        </div>
        {children}
      </div>
    )
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 30 }}>
        <RoleSection eyebrow="Primary beneficiaries" title="Who inherits, and in what shares?"
          hint="Add each person or charity, their relationship to you, and the percentage they should receive. Shares can total whatever you intend — we will balance them in drafting.">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {form.primaryBeneficiaries.map((b, i) => (
              <BeneficiaryRow key={i} value={b} index={i} isMobile={isMobile}
                onChange={next => {
                  const list = form.primaryBeneficiaries.slice()
                  list[i] = next
                  update({ primaryBeneficiaries: list })
                }}
                onRemove={() => {
                  const list = form.primaryBeneficiaries.slice()
                  list.splice(i, 1)
                  update({ primaryBeneficiaries: list })
                }} />
            ))}
            <button type="button"
              onClick={() => update({ primaryBeneficiaries: [...form.primaryBeneficiaries, { ...EMPTY_BENEFICIARY }] })}
              style={{
                alignSelf: 'flex-start', cursor: 'pointer',
                fontFamily: cf.sans, fontSize: 12, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase',
                color: cf.ink, background: 'transparent', border: `1px solid ${cf.rule}`,
                padding: '10px 18px', borderRadius: 0,
                display: 'inline-flex', alignItems: 'center', gap: 8,
              }}>
              <span style={{ color: cf.brass, fontSize: 14 }}>+</span> Add beneficiary
            </button>
          </div>
        </RoleSection>

        <RoleSection eyebrow="Trustee / Executor" title="Who runs your estate?"
          hint="Other than your spouse — the person in charge of carrying out your wishes.">
          <ContactBlock value={form.trusteeExecutor} isMobile={isMobile}
            onChange={c => update({ trusteeExecutor: c })} />
          <div style={{ marginTop: 14 }}>
            <span style={{ fontFamily: cf.mono, fontSize: 10.5, letterSpacing: '0.18em', textTransform: 'uppercase', color: cf.textMute, fontWeight: 600, display: 'block', marginBottom: 10 }}>
              Backup trustee / executor
            </span>
            <ContactBlock value={form.trusteeExecutorBackup} isMobile={isMobile}
              onChange={c => update({ trusteeExecutorBackup: c })} />
          </div>
        </RoleSection>

        <RoleSection eyebrow="Your financial POA" title="Who handles your finances if you cannot?"
          hint="Your agent for real estate, bank accounts, stocks, and investments. Frequently your spouse.">
          <ContactBlock value={form.financialPoaYou} isMobile={isMobile}
            onChange={c => update({ financialPoaYou: c })} />
          <div style={{ marginTop: 14 }}>
            <span style={{ fontFamily: cf.mono, fontSize: 10.5, letterSpacing: '0.18em', textTransform: 'uppercase', color: cf.textMute, fontWeight: 600, display: 'block', marginBottom: 10 }}>
              Backup financial POA
            </span>
            <ContactBlock value={form.financialPoaYouBackup} isMobile={isMobile}
              onChange={c => update({ financialPoaYouBackup: c })} />
          </div>
        </RoleSection>

        {isPartnered && (
          <RoleSection eyebrow={`${form.maritalStatus === 'married' ? "Spouse's" : "Partner's"} financial POA`}
            title={`Who handles your ${form.maritalStatus === 'married' ? 'spouse' : 'partner'}'s finances?`}
            hint="Often you. If not you, list whomever they designate.">
            <ContactBlock value={form.financialPoaSpouse} isMobile={isMobile}
              onChange={c => update({ financialPoaSpouse: c })} />
            <div style={{ marginTop: 14 }}>
              <span style={{ fontFamily: cf.mono, fontSize: 10.5, letterSpacing: '0.18em', textTransform: 'uppercase', color: cf.textMute, fontWeight: 600, display: 'block', marginBottom: 10 }}>
                Backup financial POA
              </span>
              <ContactBlock value={form.financialPoaSpouseBackup} isMobile={isMobile}
                onChange={c => update({ financialPoaSpouseBackup: c })} />
            </div>
          </RoleSection>
        )}

        <RoleSection eyebrow="Your medical POA" title="Who makes medical decisions for you?"
          hint="Your agent if you cannot speak for yourself.">
          <ContactBlock value={form.medicalPoaYou} isMobile={isMobile}
            onChange={c => update({ medicalPoaYou: c })} />
          <div style={{ marginTop: 14 }}>
            <span style={{ fontFamily: cf.mono, fontSize: 10.5, letterSpacing: '0.18em', textTransform: 'uppercase', color: cf.textMute, fontWeight: 600, display: 'block', marginBottom: 10 }}>
              Alternate medical POA
            </span>
            <ContactBlock value={form.medicalPoaYouAlternate} isMobile={isMobile}
              onChange={c => update({ medicalPoaYouAlternate: c })} />
          </div>
        </RoleSection>

        {isPartnered && (
          <RoleSection eyebrow={`${form.maritalStatus === 'married' ? "Spouse's" : "Partner's"} medical POA`}
            title={`Who makes medical decisions for your ${form.maritalStatus === 'married' ? 'spouse' : 'partner'}?`}
            hint="Often you. If not you, list whomever they designate.">
            <ContactBlock value={form.medicalPoaSpouse} isMobile={isMobile}
              onChange={c => update({ medicalPoaSpouse: c })} />
            <div style={{ marginTop: 14 }}>
              <span style={{ fontFamily: cf.mono, fontSize: 10.5, letterSpacing: '0.18em', textTransform: 'uppercase', color: cf.textMute, fontWeight: 600, display: 'block', marginBottom: 10 }}>
                Alternate medical POA
              </span>
              <ContactBlock value={form.medicalPoaSpouseAlternate} isMobile={isMobile}
                onChange={c => update({ medicalPoaSpouseAlternate: c })} />
            </div>
          </RoleSection>
        )}
      </div>
    )
  }

  if (stepId === 'wishes') {
    const isPartnered = ['married','partnered'].includes(form.maritalStatus)
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>
        <Field label="Special gifts" hint="Specific items or cash gifts to individuals or charities — be as specific as possible, including your relationship to each recipient.">
          <Textarea value={form.specialGifts}
            onChange={e => update({ specialGifts: e.target.value })}
            placeholder={'Grandmother\'s pearls — Emma Bellweather (daughter)\n$10,000 — North Texas Food Bank'}
            rows={4} />
        </Field>
        <Field label="Remote contingent beneficiaries"
          hint="If none of your primary beneficiaries are alive, who receives your assets? Common choices: heirs-at-law, half to your heirs-at-law and half to spouse's, or specific named individuals or charities. This can always be revised later.">
          <Textarea value={form.remoteContingentBeneficiaries}
            onChange={e => update({ remoteContingentBeneficiaries: e.target.value })}
            placeholder="Heirs-at-law of mine and of my spouse, in equal shares."
            rows={3} />
        </Field>
        <Field label="Living Will (Directive to Physicians) — you"
          hint="Do you want a document stating you do not want to be kept on artificial life support if you have no chance of recovery in a terminal or irreversible condition?">
          <YesNo value={form.livingWillYou} onChange={v => update({ livingWillYou: v })} />
        </Field>
        {isPartnered && (
          <Field label={`Living Will — your ${form.maritalStatus === 'married' ? 'spouse' : 'partner'}`}
            hint="Same question for them.">
            <YesNo value={form.livingWillSpouse} onChange={v => update({ livingWillSpouse: v })} />
          </Field>
        )}
        <Field label="Organ donation"
          hint={`Do you${isPartnered ? ' or your ' + (form.maritalStatus === 'married' ? 'spouse' : 'partner') : ''} want to donate organs at death? Note any restrictions or preferences.`}>
          <Textarea value={form.organDonationNotes}
            onChange={e => update({ organDonationNotes: e.target.value })}
            placeholder="Both of us — any usable organ. No restrictions."
            rows={2} />
        </Field>
      </div>
    )
  }

  if (stepId === 'additional') {
    const questions: [keyof IntakeForm, string][] = [
      ['receivesGovBenefits',                'Are you or your spouse receiving Social Security, disability, or other governmental benefits?'],
      ['hasDivorcePayments',                 'Are you or your spouse making payments under a divorce or property settlement order?'],
      ['hasMarriageContract',                'If married, have you and your spouse signed a pre- or post-marriage contract?'],
      ['hasFiledGiftTaxReturns',             'Have you or your spouse ever filed federal or state gift tax returns?'],
      ['hasPriorEstatePlan',                 'Have you or your spouse completed a previous will, trust, or estate plan?'],
      ['childrenHaveSpecialNeedsExtended',   'Do any of your children have special educational, medical, or physical needs?'],
      ['childrenReceiveGovBenefits',         'Do any of your children receive governmental support or benefits?'],
      ['supportsAdultDependents',            'Do you provide primary or major financial support to adult children or others?'],
    ]
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
        <p style={{ fontFamily: cf.sans, fontSize: 14, color: cf.textMute, lineHeight: 1.6, margin: 0, maxWidth: 620 }}>
          Quick yes / no checks. If you do not know an answer, leave it blank — we can walk through any of these during the consultation.
        </p>
        {questions.map(([key, q]) => (
          <Field key={key} label={q}>
            <YesNo value={form[key] as boolean | null} onChange={v => update({ [key]: v })} />
          </Field>
        ))}
        <Field label="Anything else you would like to share or attach?"
          hint="Stored locally for the demo — not transmitted.">
          <FileUploadStub value={form.additionalAttachmentName}
            onChange={n => update({ additionalAttachmentName: n })}
            label="Attach a document" />
        </Field>
      </div>
    )
  }

  if (stepId === 'services') {
    const toggle = (id: string) => {
      const set = new Set(form.services)
      set.has(id) ? set.delete(id) : set.add(id)
      const next = Array.from(set)
      const patch: Partial<IntakeForm> & { __jumpTo?: string } = { services: next }
      if (!next.includes('probate')) { patch.decedentRelationship = ''; patch.decedentDateOfDeath = '' }
      update(patch)
    }
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
        <Field label="Select all that apply" required error={has('services')}
          hint="Not sure? Choose your best guess — we will refine recommendations during your consultation.">
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 8 }}>
            {SERVICE_OPTIONS.map(s => (
              <CheckCard key={s.id} checked={form.services.includes(s.id)} onClick={() => toggle(s.id)} label={s.label} note={s.note} />
            ))}
          </div>
        </Field>
        <Reveal open={form.services.includes('probate')}>
          <div style={isMobile
            ? { display: 'flex', flexDirection: 'column', gap: 20, padding: '18px 20px', background: cf.ivoryWarm, borderLeft: `2px solid ${cf.brass}` }
            : { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, padding: '18px 20px', background: cf.ivoryWarm, borderLeft: `2px solid ${cf.brass}` }
          }>
            <Field label="Relationship to the deceased" required error={has('probateRelationship')} span={1}>
              <Select value={form.decedentRelationship} onChange={e => update({ decedentRelationship: e.target.value })}>
                <option value="">Select</option>
                {['Spouse','Parent','Child','Sibling','Other family','Named executor','Other'].map(o => <option key={o} value={o}>{o}</option>)}
              </Select>
            </Field>
            <Field label="Date of death (approximate)" hint="Helps us assess timing for any deadlines." span={1}>
              <Input type="date" value={form.decedentDateOfDeath} onChange={e => update({ decedentDateOfDeath: e.target.value })} />
            </Field>
          </div>
        </Reveal>
      </div>
    )
  }

  if (stepId === 'schedule') {
    const formats = [
      { id: 'inperson', label: 'In person', sub: 'At one of our offices' },
      { id: 'video',    label: 'Video',     sub: 'Secure video consultation' },
      { id: 'phone',    label: 'Phone',     sub: 'Initial scoping call' },
    ]
    const times = [
      { id: 'morning',   label: 'Mornings',   sub: '8am – 12pm' },
      { id: 'afternoon', label: 'Afternoons', sub: '12pm – 5pm' },
      { id: 'anytime',   label: 'Any time',   sub: 'Whatever works' },
    ]
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>
        <Field label="Preferred office" required error={has('preferredOffice')}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
            {OFFICE_OPTIONS.map(o => (
              <RadioCard key={o.id} checked={form.preferredOffice === o.id} onClick={() => update({ preferredOffice: o.id })} label={o.label} sub={o.sub} />
            ))}
          </div>
        </Field>
        <div style={isMobile
          ? { display: 'flex', flexDirection: 'column', gap: 22 }
          : { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 22 }
        }>
          <Field label="Consultation format" required error={has('consultationFormat')}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {formats.map(f => (
                <RadioCard key={f.id} narrow checked={form.consultationFormat === f.id} onClick={() => update({ consultationFormat: f.id })} label={f.label} sub={f.sub} />
              ))}
            </div>
          </Field>
          <Field label="Best time of day">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {times.map(t => (
                <RadioCard key={t.id} narrow checked={form.preferredContactTime === t.id} onClick={() => update({ preferredContactTime: t.id })} label={t.label} sub={t.sub} />
              ))}
            </div>
          </Field>
        </div>
        <Field label="Timeline" required error={has('urgency')}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
            {URGENCY_OPTIONS.map(u => (
              <RadioCard key={u.id} checked={form.urgency === u.id} onClick={() => update({ urgency: u.id })} label={u.label} sub={u.note} />
            ))}
          </div>
        </Field>
        <Field label="Anything else we should know?" hint="Optional. Recent loss, pending sale, family complexity — anything that helps us prepare.">
          <textarea value={form.notes} onChange={e => update({ notes: e.target.value })} rows={3}
            placeholder="Share any context that may help us prepare for your consultation."
            style={{
              fontFamily: cf.sans, fontSize: 14, color: cf.ink, lineHeight: 1.5,
              background: '#fff', border: `1px solid ${cf.rule}`,
              padding: '12px 14px', outline: 'none', resize: 'vertical', borderRadius: 0,
            }}
            onFocus={e => { e.target.style.borderColor = cf.brass; e.target.style.boxShadow = `0 0 0 3px ${cf.brass}22`; }}
            onBlur={e => { e.target.style.borderColor = cf.rule; e.target.style.boxShadow = 'none'; }}
          />
        </Field>
      </div>
    )
  }

  if (stepId === 'decedent') {
    const relationships: [string, string][] = [
      ['Spouse', 'spouse'], ['Child', 'child'], ['Parent', 'parent'],
      ['Sibling', 'sibling'], ['Named executor', 'executor'], ['Other', 'other'],
    ]
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>
        <Field label="Full legal name" required error={has('decedentName')}
          hint="As it appears on the death certificate.">
          <Input value={form.decedentName} onChange={e => update({ decedentName: e.target.value })}
            placeholder="Margaret A. Bellweather" error={has('decedentName')} />
        </Field>
        <div style={isMobile
          ? { display: 'flex', flexDirection: 'column', gap: 20 }
          : { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }
        }>
          <Field label="Date of death" hint="Approximate is fine if uncertain.">
            <Input type="date" value={form.decedentDateOfDeath}
              onChange={e => update({ decedentDateOfDeath: e.target.value })} />
          </Field>
          <Field label="County of residence at death" hint="Sets the venue for probate.">
            <Input value={form.decedentCounty}
              onChange={e => update({ decedentCounty: e.target.value })}
              placeholder="Collin County, TX" />
          </Field>
        </div>
        <Field label="Was the decedent a Texas resident?" required error={has('decedentTexasResident')}
          hint="Was their permanent address a Texas address? Determines venue.">
          <YesNo value={form.decedentTexasResident} onChange={v => update({ decedentTexasResident: v })} error={has('decedentTexasResident')} />
        </Field>
        <Field label="Did the decedent have a Trust?" required error={has('decedentHadTrust')}
          hint="A funded living trust may avoid probate entirely.">
          <YesNo value={form.decedentHadTrust} onChange={v => update({ decedentHadTrust: v })} error={has('decedentHadTrust')} />
        </Field>
        <Field label="Your relationship to them" required error={has('decedentRelationship')}>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)', gap: 8 }}>
            {relationships.map(([l, v]) => (
              <RadioCard key={v} narrow checked={form.decedentRelationship === v}
                onClick={() => update({ decedentRelationship: v, decedentRelationshipOther: v === 'other' ? form.decedentRelationshipOther : '' })} label={l} />
            ))}
          </div>
        </Field>
        <Reveal open={form.decedentRelationship === 'other'}>
          <div style={{ padding: '18px 20px', background: cf.ivoryWarm, borderLeft: `2px solid ${cf.brass}` }}>
            <Field label="Describe your relationship" required={form.decedentRelationship === 'other'} error={has('decedentRelationshipOther')}>
              <Input value={form.decedentRelationshipOther}
                onChange={e => update({ decedentRelationshipOther: e.target.value })}
                placeholder="Friend, in-law, caretaker, business partner…"
                error={has('decedentRelationshipOther')} />
            </Field>
          </div>
        </Reveal>
      </div>
    )
  }

  if (stepId === 'probate-estate') {
    const realEstateProperties = form.realEstateProperties as unknown as string[]
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>
        <Field label="Approximate total ASSETS" required error={has('assetRange')}
          hint="Real estate, accounts, business interests, and personal property. A best guess is fine — we refine this together.">
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(1, 1fr)' : 'repeat(3, 1fr)', gap: 8 }}>
            {ASSET_OPTIONS.map(a => (
              <RadioCard key={a.id} narrow checked={form.assetRange === a.id} onClick={() => update({ assetRange: a.id })} label={a.label} />
            ))}
          </div>
        </Field>
        <Field label="Approximate total DEBTS" required error={has('debtRange')}
          hint="Mortgages, credit cards, medical bills, and any unpaid taxes. If debts exceed assets, the estate may be insolvent — changes our approach.">
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(1, 1fr)' : 'repeat(3, 1fr)', gap: 8 }}>
            {ASSET_OPTIONS.map(a => (
              <RadioCard key={a.id} narrow checked={form.debtRange === a.id} onClick={() => update({ debtRange: a.id })} label={a.label} />
            ))}
          </div>
        </Field>
        <div style={isMobile
          ? { display: 'flex', flexDirection: 'column', gap: 20 }
          : { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20 }
        }>
          <Field label="Owned real estate?" required error={has('ownsRealEstate')}>
            <YesNo value={form.ownsRealEstate} onChange={v => update({ ownsRealEstate: v, realEstateCount: v ? form.realEstateCount : '', realEstateProperties: v ? form.realEstateProperties : [] })} error={has('ownsRealEstate')} />
          </Field>
          <Field label="Owned a business?" required error={has('ownsBusiness')}>
            <YesNo value={form.ownsBusiness} onChange={v => update({ ownsBusiness: v, businessType: v ? form.businessType : '' })} error={has('ownsBusiness')} />
          </Field>
          <Field label="Out-of-state property?" required error={has('ownsOutOfState')}
            hint="May require ancillary probate.">
            <YesNo value={form.ownsOutOfState} onChange={v => update({ ownsOutOfState: v })} error={has('ownsOutOfState')} />
          </Field>
        </div>
        <Reveal open={form.ownsRealEstate === true}>
          <div style={{ padding: '18px 20px', background: cf.ivoryWarm, borderLeft: `2px solid ${cf.brass}`, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Field label="How many properties?" hint="Approximate is fine — we will refine during the consultation.">
              <Input value={form.realEstateCount} onChange={e => {
                const raw = e.target.value.replace(/\D/g,'').slice(0,2)
                const n = raw === '' ? 0 : Math.min(parseInt(raw, 10), 20)
                update({ realEstateCount: raw, realEstateProperties: resizeList(realEstateProperties, n, () => '') as unknown as IntakeForm['realEstateProperties'] })
              }} placeholder="0" maxWidth={120} />
            </Field>
            {realEstateProperties.map((p, i) => (
              <Field key={i} label={`Property ${i + 1}`}
                hint={i === 0 ? 'Short description plus general location.' : undefined}>
                <Input value={p}
                  onChange={e => {
                    const next = realEstateProperties.slice()
                    next[i] = e.target.value
                    update({ realEstateProperties: next as unknown as IntakeForm['realEstateProperties'] })
                  }}
                  placeholder={i === 0 ? 'Primary residence — Plano, TX' : i === 1 ? 'Rental condo — Galveston, TX' : 'Property type — city, state'} />
              </Field>
            ))}
          </div>
        </Reveal>
        <Reveal open={form.ownsBusiness === true}>
          <div style={{ padding: '18px 20px', background: cf.ivoryWarm, borderLeft: `2px solid ${cf.brass}` }}>
            <Field label="Business type" hint="Family-owned construction company, professional practice, holdings LLC, etc.">
              <Input value={form.businessType} onChange={e => update({ businessType: e.target.value })}
                placeholder="Family-owned construction company" />
            </Field>
          </div>
        </Reveal>
      </div>
    )
  }

  if (stepId === 'will-filings') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>
        <Field label="Did they sign a will?" required error={has('willExists')}>
          <TriOption options={[['Yes','yes'],['No','no'],['Not sure','unsure']]}
            value={form.willExists}
            onChange={v => update({ willExists: v, willHasOriginal: v === 'yes' ? form.willHasOriginal : '', willYear: v === 'yes' ? form.willYear : '' })}
            error={has('willExists')} />
        </Field>
        <Reveal open={form.willExists === 'yes'}>
          <div style={{ padding: '18px 20px', background: cf.ivoryWarm, borderLeft: `2px solid ${cf.brass}`, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Field label="Do you have the original document?"
              hint="Texas probate generally requires the original signed will.">
              <TriOption options={[['Yes, I have it','yes'],['Someone else has it','elsewhere'],['No / lost','no']]}
                value={form.willHasOriginal}
                onChange={v => update({ willHasOriginal: v })} maxWidth={560} />
            </Field>
            <Field label="Year drafted (approximate)" hint="If multiple versions, the most recent is fine.">
              <Input value={form.willYear}
                onChange={e => update({ willYear: e.target.value.replace(/\D/g,'').slice(0,4) })}
                placeholder="2014" maxWidth={160} />
            </Field>
          </div>
        </Reveal>
        <Field label="Has anything been filed in probate court yet?" required error={has('probateCourtFiled')}>
          <TriOption options={[['Yes','yes'],['No','no'],['Not sure','unsure']]}
            value={form.probateCourtFiled}
            onChange={v => update({ probateCourtFiled: v, probateCountyFiled: v === 'yes' ? form.probateCountyFiled : '', probateExecutorAppointed: v === 'yes' ? form.probateExecutorAppointed : null })}
            error={has('probateCourtFiled')} />
        </Field>
        <Reveal open={form.probateCourtFiled === 'yes'}>
          <div style={isMobile
            ? { display: 'flex', flexDirection: 'column', gap: 16, padding: '18px 20px', background: cf.ivoryWarm, borderLeft: `2px solid ${cf.brass}` }
            : { display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 20, padding: '18px 20px', background: cf.ivoryWarm, borderLeft: `2px solid ${cf.brass}` }
          }>
            <Field label="County where filed">
              <Input value={form.probateCountyFiled}
                onChange={e => update({ probateCountyFiled: e.target.value })}
                placeholder="Collin County, TX" />
            </Field>
            <Field label="Executor appointed?">
              <YesNo value={form.probateExecutorAppointed}
                onChange={v => update({ probateExecutorAppointed: v })} />
            </Field>
          </div>
        </Reveal>
        <Field label="Are there known disputes among heirs?"
          hint="Honest answer helps us anticipate contested-probate work.">
          <TriOption options={[['No','no'],['Possible','possible'],['Yes','yes']]}
            value={form.heirDisputes}
            onChange={v => update({ heirDisputes: v })} />
        </Field>
      </div>
    )
  }

  if (stepId === 'review') {
    const Section = ({ title, rows, onEdit }: { title: React.ReactNode; rows: [React.ReactNode, React.ReactNode][]; onEdit: () => void }) => (
      <div style={{ paddingBottom: 18, borderBottom: `1px solid ${cf.ruleSoft}`, marginBottom: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
          <h4 style={{ fontFamily: cf.serif, fontSize: 22, color: cf.ink, margin: 0, fontWeight: 700, letterSpacing: '-0.005em' }}>{title}</h4>
          <button onClick={onEdit} style={{
            background: 'transparent', border: 'none', color: cf.brass, cursor: 'pointer',
            fontFamily: cf.sans, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600,
          }}>Edit</button>
        </div>
        {rows.filter(r => r[1]).map(([k, v], ri) => (
          <div key={ri} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', gap: 16 }}>
            <span style={{ fontFamily: cf.sans, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: cf.textMute, fontWeight: 600 }}>{k}</span>
            <span style={{ fontFamily: cf.sans, fontSize: 14, color: cf.ink, textAlign: 'right', fontWeight: 500, maxWidth: '65%' }}>{v}</span>
          </div>
        ))}
      </div>
    )
    const sections = buildIntakeSummary(form)
    return (
      <div>
        <p style={{ fontFamily: cf.sans, fontSize: 14, color: cf.textMute, lineHeight: 1.6, margin: '0 0 26px', maxWidth: 560 }}>
          A final review before we route your intake to the attorney best suited to your matter.
          You can edit any section.
        </p>
        {sections.map(s => (
          <Section key={s.id} title={s.title} onEdit={() => update({ __jumpTo: s.id })} rows={s.rows} />
        ))}
      </div>
    )
  }

  return null
}

// ---------- Intake chooser ----------

export function IntakeChooser({
  onChoose,
  isMobile,
}: {
  onChoose: (type: 'wills' | 'probate') => void
  isMobile: boolean
}) {
  const cards: { id: 'wills' | 'probate'; eyebrow: string; title: string; body: string }[] = [
    {
      id: 'wills',
      eyebrow: 'Wills & Trust',
      title: 'Plan for the future.',
      body: 'Wills, revocable trusts, powers of attorney, special-needs planning, business succession, and existing-plan reviews.',
    },
    {
      id: 'probate',
      eyebrow: 'Probate',
      title: 'Settle an estate.',
      body: 'Administration after a loved one’s passing — wills, court filings, executor duties, heir notifications.',
    },
  ]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 22 : 28, maxWidth: 620, width: '100%' }}>
      <span style={{ fontFamily: cf.mono, fontSize: 10.5, letterSpacing: '0.22em', textTransform: 'uppercase', color: cf.brass, fontWeight: 600 }}>
        New Client Intake
      </span>
      <h1 style={{ fontFamily: cf.serif, fontSize: isMobile ? 38 : 56, margin: 0, lineHeight: 1.02, color: cf.ink, fontWeight: 700, letterSpacing: '-0.015em' }}>
        What brings you <em style={{ color: cf.brass }}>here today?</em>
      </h1>
      <p style={{ fontFamily: cf.sans, fontSize: isMobile ? 15 : 16, lineHeight: 1.65, color: cf.textMute, margin: 0, maxWidth: 540 }}>
        Pick the path that fits. You can switch later if needed.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 4 }}>
        {cards.map(c => (
          <button key={c.id} type="button" onClick={() => onChoose(c.id)}
            style={{
              textAlign: 'left', cursor: 'pointer',
              background: '#fff', border: `1px solid ${cf.rule}`,
              padding: isMobile ? '20px 22px' : '26px 28px',
              display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', gap: 18,
              transition: 'border-color .15s, box-shadow .15s, transform .15s',
              fontFamily: cf.sans, color: cf.ink, borderRadius: 0,
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = cf.brass; e.currentTarget.style.boxShadow = `inset 0 0 0 1px ${cf.brass}`; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = cf.rule; e.currentTarget.style.boxShadow = 'none'; }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <span style={{ fontFamily: cf.mono, fontSize: isMobile ? 13 : 15, letterSpacing: '0.2em', textTransform: 'uppercase', color: cf.brass, fontWeight: 600 }}>
                {c.eyebrow}
              </span>
              <span style={{ fontFamily: cf.serif, fontSize: isMobile ? 34 : 44, lineHeight: 1.04, color: cf.ink, fontWeight: 700, letterSpacing: '-0.012em' }}>
                {c.title}
              </span>
              <span style={{ fontFamily: cf.sans, fontSize: isMobile ? 13.5 : 14, color: cf.textMute, lineHeight: 1.55, marginTop: 4 }}>
                {c.body}
              </span>
            </div>
            <span style={{ fontFamily: cf.serif, fontSize: 28, color: cf.brass, lineHeight: 1, paddingRight: 4 }}>{'→'}</span>
          </button>
        ))}
      </div>
      <p style={{ fontFamily: cf.sans, fontSize: 12, color: cf.textMute, marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
        <PrivacyShield color={cf.brass} />
        Encrypted intake. Submitting does not create an attorney-client relationship.
      </p>
    </div>
  )
}

// ---------- Welcome screen ----------

export function CounselWelcome({
  onBegin,
  isMobile,
}: {
  onBegin: () => void
  isMobile: boolean
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 20 : 26, maxWidth: 620, width: '100%' }}>
      <span style={{ fontFamily: cf.mono, fontSize: 10.5, letterSpacing: '0.22em', textTransform: 'uppercase', color: cf.brass, fontWeight: 600 }}>
        New Client Intake
      </span>
      <h1 style={{ fontFamily: cf.serif, fontSize: isMobile ? 40 : 64, margin: 0, lineHeight: 1.02, color: cf.ink, fontWeight: 700, letterSpacing: '-0.015em' }}>
        Welcome. Let's begin <em style={{ color: cf.brass }}>with a few details.</em>
      </h1>
      <p style={{ fontFamily: cf.sans, fontSize: isMobile ? 15 : 16, lineHeight: 1.65, color: cf.textMute, margin: 0, maxWidth: 540 }}>
        This intake helps us prepare for your consultation. Five short sections — about
        six minutes — and everything you share is held in strict confidence. Submitting
        does not create an attorney-client relationship.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: isMobile ? 10 : 16, padding: '16px 0' }}>
        {([
          ['~6 min', 'To complete'],
          ['5 sections', 'Plus a final review'],
          ['Flat-rate', 'Pricing in writing'],
        ] as [string, string][]).map(([t, s]) => (
          <div key={t} style={{ borderTop: `1px solid ${cf.rule}`, paddingTop: isMobile ? 10 : 14 }}>
            <div style={{ fontFamily: cf.serif, fontSize: isMobile ? 19 : 26, color: cf.ink, fontWeight: 700, letterSpacing: '-0.005em' }}>{t}</div>
            <div style={{ fontFamily: cf.sans, fontSize: isMobile ? 11 : 12, color: cf.textMute, marginTop: 2, letterSpacing: '0.02em', lineHeight: 1.4 }}>{s}</div>
          </div>
        ))}
      </div>
      <button onClick={onBegin}
        style={{
          alignSelf: isMobile ? 'stretch' : 'flex-start', marginTop: 4,
          fontFamily: cf.sans, fontSize: 13, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase',
          color: cf.cream, background: cf.ink, border: `1px solid ${cf.ink}`,
          padding: '16px 36px', cursor: 'pointer',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 12, transition: 'background .15s',
        }}
        onMouseEnter={e => e.currentTarget.style.background = cf.inkSoft}
        onMouseLeave={e => e.currentTarget.style.background = cf.ink}>
        Begin intake
        <span style={{ fontFamily: cf.serif, fontSize: 20, color: cf.brass }}>→</span>
      </button>
      <p style={{ fontFamily: cf.sans, fontSize: 12, color: cf.textMute, marginTop: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
        <PrivacyShield color={cf.brass} />
        No obligation. Your information is encrypted and used solely to prepare for your consultation.
      </p>
    </div>
  )
}
