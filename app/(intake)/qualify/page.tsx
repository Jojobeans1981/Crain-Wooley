'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

// Demo-only build. The form collects fields that the production API doesn't
// know about (qualifyingFactors and the probate block). On submit, DEMO mode
// fakes the network round-trip and routes to /payment. Non-DEMO submission
// trims the payload to the original IntakeFormData shape so the existing
// /api/intake handler keeps working.

const PRACTICE_AREAS = [
  { value: 'ESTATE_PLANNING', label: 'Estate Planning' },
  { value: 'PROBATE',         label: 'Probate' },
  { value: 'BUSINESS_LAW',    label: 'Business Law' },
  { value: 'OTHER',           label: 'Other' },
] as const

const URGENCY_OPTIONS = [
  { value: 'IMMEDIATE',    label: 'Immediate',        sub: 'I need help now' },
  { value: 'WITHIN_WEEK',  label: 'Within a week',    sub: 'Urgent but not emergency' },
  { value: 'WITHIN_MONTH', label: 'Within a month',   sub: 'Planning ahead' },
  { value: 'RESEARCHING',  label: 'Just researching', sub: 'No immediate need' },
] as const

const QUALIFYING_FACTORS = [
  { value: 'minorChildren', label: 'I have minor children' },
  { value: 'blendedFamily', label: 'I have a blended family or stepchildren' },
  { value: 'realEstate',    label: 'I own a home or other real estate' },
  { value: 'business',      label: 'I own a business' },
  { value: 'multiState',    label: 'I have assets in multiple states' },
  { value: 'existingPlan',  label: 'I have an existing will or trust I want to update' },
] as const

const STEPS = [
  { num: 1, label: 'Contact' },
  { num: 2, label: 'Your Matter' },
  { num: 3, label: 'Review & Consent' },
] as const

type YesNo = '' | 'yes' | 'no'

type FormState = {
  firstName: string; lastName: string; email: string; phone: string
  practiceArea: string; caseType: string; description: string; urgency: string
  qualifyingFactors: string[]
  decedentName: string; decedentRelation: string
  decedentTxResident: YesNo; decedentAddress: string
  hasTxAssets: YesNo; txAssetsDescription: string
  youInTexas: YesNo; yourAddress: string
  hasWill: YesNo; executorName: string; willNotes: string
  hasTrust: YesNo; trusteeName: string; trustNotes: string
  assetValue: string; debtValue: string
  caseFiled: YesNo; caseDetails: string
  consentToContact: boolean; consentToTerms: boolean
}

const EMPTY: FormState = {
  firstName: '', lastName: '', email: '', phone: '',
  practiceArea: '', caseType: '', description: '', urgency: '',
  qualifyingFactors: [],
  decedentName: '', decedentRelation: '',
  decedentTxResident: '', decedentAddress: '',
  hasTxAssets: '', txAssetsDescription: '',
  youInTexas: '', yourAddress: '',
  hasWill: '', executorName: '', willNotes: '',
  hasTrust: '', trusteeName: '', trustNotes: '',
  assetValue: '', debtValue: '',
  caseFiled: '', caseDetails: '',
  consentToContact: false, consentToTerms: false,
}

const STORAGE_KEY = 'cw-intake-draft-v2'

export default function QualifyPage() {
  const router = useRouter()
  const [revealedSections, setRevealedSections] = useState<1 | 2 | 3>(1)
  const [form, setForm] = useState<FormState>(EMPTY)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [hydrated, setHydrated] = useState(false)

  const section2Ref = useRef<HTMLDivElement>(null)
  const section3Ref = useRef<HTMLDivElement>(null)

  // localStorage restore (one-shot)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (parsed && typeof parsed === 'object') {
          if (parsed.form) setForm({ ...EMPTY, ...parsed.form })
          if (parsed.revealedSections === 1 || parsed.revealedSections === 2 || parsed.revealedSections === 3) {
            setRevealedSections(parsed.revealedSections)
          }
        }
      }
    } catch {
      // ignore corrupt storage
    }
    setHydrated(true)
  }, [])

  // localStorage save (only after hydration so we don't wipe restored state)
  useEffect(() => {
    if (!hydrated) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ form, revealedSections }))
    } catch {
      // ignore
    }
  }, [form, revealedSections, hydrated])

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm(f => ({ ...f, [key]: value }))

  const toggleFactor = (factor: string) =>
    setForm(f => ({
      ...f,
      qualifyingFactors: f.qualifyingFactors.includes(factor)
        ? f.qualifyingFactors.filter(x => x !== factor)
        : [...f.qualifyingFactors, factor],
    }))

  const isSection1Valid = () =>
    !!(form.firstName && form.lastName && form.email && form.phone)
  const isSection2Valid = () =>
    !!(form.practiceArea && form.caseType && form.description.length >= 20 && form.urgency)
  const isSection3Valid = () =>
    form.consentToContact && form.consentToTerms

  const advanceTo = (n: 2 | 3) => {
    if (n > revealedSections) {
      setRevealedSections(n)
      setTimeout(() => {
        const ref = n === 2 ? section2Ref.current : section3Ref.current
        ref?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 80)
    }
  }

  const DEMO = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'

  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    try {
      if (DEMO) {
        await new Promise(r => setTimeout(r, 900))
        localStorage.removeItem(STORAGE_KEY)
        router.push('/payment?leadId=demo-lead')
        return
      }
      // Production path: only the original IntakeFormData fields ship to the API.
      // PROBATE collapses to OTHER because the Prisma enum doesn't include it yet.
      const apiPayload = {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
        practiceArea: form.practiceArea === 'PROBATE' ? 'OTHER' : form.practiceArea,
        caseType: form.caseType,
        description: form.description,
        urgency: form.urgency,
        consentToContact: form.consentToContact,
        consentToTerms: form.consentToTerms,
      }
      const res = await fetch('/api/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiPayload),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)
      localStorage.removeItem(STORAGE_KEY)
      if (data.qualified) {
        router.push(`/payment?leadId=${data.leadId}`)
      } else {
        router.push(`/confirmation?disqualified=true&reason=${encodeURIComponent(data.reason || '')}`)
      }
    } catch {
      setError('Submission failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const isProbate = form.practiceArea === 'PROBATE'

  const stepState = (n: number) =>
    n < revealedSections ? 'done' : n === revealedSections ? 'current' : 'upcoming'

  return (
    <main className="cw-page">
      <div className="cw-shell">
        <header className="cw-header">
          <div className="px-6 sm:px-10 py-5 flex items-center justify-between">
            <Link href="/" className="no-underline flex items-center gap-3" aria-label="Crain & Wooley — Home">
              <span role="img" aria-label="Crain & Wooley" className="cw-emblem" />
            </Link>
            <a
              href="tel:9729451610"
              className="inline-flex items-center text-cw-navy font-semibold text-sm hover:text-cw-gold transition-colors"
            >
              <span className="text-cw-gold">☎</span> (972) 945-1610
            </a>
          </div>
        </header>

        <div className="px-6 sm:px-10 py-10 sm:py-14">
          <div className="w-full max-w-xl mx-auto">

            {/* Page heading */}
            <div className="text-center mb-8">
              <p className="cw-eyebrow mb-3">Free Case Review</p>
              <h1 className="font-display text-cw-navy text-3xl sm:text-4xl font-semibold leading-[1.15] mb-3">
                Tell Us About Your Situation
              </h1>
              <div className="w-12 h-[2px] bg-cw-gold mx-auto mb-5" aria-hidden="true" />
              <p className="text-cw-ink-soft text-base max-w-md mx-auto leading-relaxed">
                A few short questions so we can prepare the right attorney before your call.
                Takes about three minutes. Your answers save automatically.
              </p>
            </div>

            {/* Step cards — always visible, mirror revealedSections state */}
            <div
              className="cw-stepcards mb-12"
              role="status"
              aria-label={`Section ${revealedSections} of 3`}
            >
              {STEPS.map(s => {
                const state = stepState(s.num)
                return (
                  <div key={s.num} className={`cw-stepcard cw-stepcard-${state}`}>
                    <div className="cw-stepcard-badge" aria-hidden="true">
                      {state === 'done' ? '✓' : s.num}
                    </div>
                    <div className="cw-stepcard-meta">
                      <span className="cw-stepcard-kicker">Step {s.num}</span>
                      <span className="cw-stepcard-label">{s.label}</span>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* ── Section 1: Contact ── */}
            <section className="cw-formsection">
              <header className="cw-formsection-header">
                <p className="cw-formsection-kicker">1. Contact Information</p>
                <p className="cw-formsection-help">All information is kept strictly confidential.</p>
              </header>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="cw-label">First Name</label>
                    <input
                      className="cw-input"
                      value={form.firstName}
                      onChange={e => set('firstName', e.target.value)}
                      placeholder="First"
                    />
                  </div>
                  <div>
                    <label className="cw-label">Last Name</label>
                    <input
                      className="cw-input"
                      value={form.lastName}
                      onChange={e => set('lastName', e.target.value)}
                      placeholder="Last"
                    />
                  </div>
                </div>
                <div>
                  <label className="cw-label">Email Address</label>
                  <input
                    className="cw-input"
                    type="email"
                    value={form.email}
                    onChange={e => set('email', e.target.value)}
                    placeholder="you@email.com"
                  />
                </div>
                <div>
                  <label className="cw-label">Phone Number</label>
                  <input
                    className="cw-input"
                    type="tel"
                    value={form.phone}
                    onChange={e => set('phone', e.target.value)}
                    placeholder="(555) 000-0000"
                  />
                </div>
              </div>
              {revealedSections === 1 && (
                <div className="cw-section-continue">
                  <button
                    type="button"
                    className="cw-continue-link"
                    disabled={!isSection1Valid()}
                    onClick={() => advanceTo(2)}
                  >
                    Continue to Your Matter
                  </button>
                </div>
              )}
            </section>

            {/* ── Section 2: Your Matter ── */}
            {revealedSections >= 2 && (
              <section ref={section2Ref} className="cw-formsection cw-formsection-reveal">
                <header className="cw-formsection-header">
                  <p className="cw-formsection-kicker">2. Your Matter</p>
                  <p className="cw-formsection-help">Help us understand what you need.</p>
                </header>

                <div className="space-y-8">
                  {/* Practice area — radio list */}
                  <fieldset>
                    <legend className="cw-label">Practice Area</legend>
                    <div className="mt-3 space-y-2">
                      {PRACTICE_AREAS.map(p => (
                        <label
                          key={p.value}
                          className={`cw-radio-row ${form.practiceArea === p.value ? 'cw-radio-row-selected' : ''}`}
                        >
                          <input
                            type="radio"
                            name="practiceArea"
                            value={p.value}
                            checked={form.practiceArea === p.value}
                            onChange={() => set('practiceArea', p.value)}
                            className="cw-radio-input"
                          />
                          <span className="cw-radio-label">{p.label}</span>
                        </label>
                      ))}
                    </div>
                  </fieldset>

                  {/* Qualifying factors — checkboxes */}
                  <fieldset>
                    <legend className="cw-label">
                      Which of these apply to you?{' '}
                      <span className="cw-label-aux">(check all that apply)</span>
                    </legend>
                    <div className="mt-3 space-y-2">
                      {QUALIFYING_FACTORS.map(f => (
                        <label
                          key={f.value}
                          className={`cw-checkbox-row ${form.qualifyingFactors.includes(f.value) ? 'cw-checkbox-row-selected' : ''}`}
                        >
                          <input
                            type="checkbox"
                            checked={form.qualifyingFactors.includes(f.value)}
                            onChange={() => toggleFactor(f.value)}
                            className="cw-checkbox-input"
                          />
                          <span className="cw-radio-label">{f.label}</span>
                        </label>
                      ))}
                    </div>
                  </fieldset>

                  {/* Probate conditional sub-block */}
                  {isProbate && (
                    <div className="cw-formsection-subblock">
                      <header className="cw-formsection-subblock-header">
                        <p className="cw-formsection-kicker">Probate Details</p>
                        <p className="cw-formsection-help">
                          A few extra questions specifically about the estate, mirrored from
                          our standard probate intake.
                        </p>
                      </header>

                      <div className="space-y-7">
                        <div>
                          <label className="cw-label">Name of the person who died</label>
                          <input
                            className="cw-input"
                            value={form.decedentName}
                            onChange={e => set('decedentName', e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="cw-label">Your relationship to them</label>
                          <input
                            className="cw-input"
                            value={form.decedentRelation}
                            onChange={e => set('decedentRelation', e.target.value)}
                            placeholder="e.g. spouse, parent, sibling, friend"
                          />
                        </div>

                        <YesNoQuestion
                          legend="Was the person who died a Texas resident?"
                          name="decedentTxResident"
                          value={form.decedentTxResident}
                          onChange={v => set('decedentTxResident', v)}
                        />

                        {form.decedentTxResident === 'yes' && (
                          <div>
                            <label className="cw-label">Their last permanent address</label>
                            <textarea
                              className="cw-input"
                              rows={2}
                              value={form.decedentAddress}
                              onChange={e => set('decedentAddress', e.target.value)}
                              placeholder="Street, City, State, Zip"
                            />
                          </div>
                        )}

                        {form.decedentTxResident === 'no' && (
                          <>
                            <YesNoQuestion
                              legend="Did they own any assets located in Texas?"
                              name="hasTxAssets"
                              value={form.hasTxAssets}
                              onChange={v => set('hasTxAssets', v)}
                            />
                            {form.hasTxAssets === 'yes' && (
                              <div>
                                <label className="cw-label">Describe the Texas asset(s)</label>
                                <textarea
                                  className="cw-input"
                                  rows={2}
                                  value={form.txAssetsDescription}
                                  onChange={e => set('txAssetsDescription', e.target.value)}
                                  placeholder="e.g. a home in Plano, mineral rights in West Texas"
                                />
                              </div>
                            )}
                            <div>
                              <label className="cw-label">Their last permanent address</label>
                              <textarea
                                className="cw-input"
                                rows={2}
                                value={form.decedentAddress}
                                onChange={e => set('decedentAddress', e.target.value)}
                                placeholder="Street, City, State, Zip"
                              />
                            </div>
                          </>
                        )}

                        <YesNoQuestion
                          legend="Do you live in Texas?"
                          name="youInTexas"
                          value={form.youInTexas}
                          onChange={v => set('youInTexas', v)}
                        />
                        {form.youInTexas === 'no' && (
                          <div>
                            <label className="cw-label">Where do you live?</label>
                            <input
                              className="cw-input"
                              value={form.yourAddress}
                              onChange={e => set('yourAddress', e.target.value)}
                              placeholder="City, State, Country"
                            />
                          </div>
                        )}

                        <YesNoQuestion
                          legend="Did they have a Last Will & Testament?"
                          name="hasWill"
                          value={form.hasWill}
                          onChange={v => set('hasWill', v)}
                        />
                        {form.hasWill === 'yes' && (
                          <>
                            <div>
                              <label className="cw-label">Full legal name of the Executor</label>
                              <input
                                className="cw-input"
                                value={form.executorName}
                                onChange={e => set('executorName', e.target.value)}
                              />
                            </div>
                            <DisabledFileButton label="Attach the Will" helper="Please bring the original Will to your consultation." />
                            <div>
                              <label className="cw-label">Anything else about the Will?</label>
                              <textarea
                                className="cw-input"
                                rows={2}
                                value={form.willNotes}
                                onChange={e => set('willNotes', e.target.value)}
                                placeholder="Optional"
                              />
                            </div>
                          </>
                        )}

                        <YesNoQuestion
                          legend="Did they have a Trust?"
                          name="hasTrust"
                          value={form.hasTrust}
                          onChange={v => set('hasTrust', v)}
                        />
                        {form.hasTrust === 'yes' && (
                          <>
                            <div>
                              <label className="cw-label">Full legal name of the current Trustee</label>
                              <input
                                className="cw-input"
                                value={form.trusteeName}
                                onChange={e => set('trusteeName', e.target.value)}
                              />
                            </div>
                            <DisabledFileButton label="Attach the Trust" helper="Please bring the original Trust document to your consultation." />
                            <div>
                              <label className="cw-label">Anything else about the Trust?</label>
                              <textarea
                                className="cw-input"
                                rows={2}
                                value={form.trustNotes}
                                onChange={e => set('trustNotes', e.target.value)}
                                placeholder="Optional"
                              />
                            </div>
                          </>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="cw-label">Approx. total assets</label>
                            <input
                              className="cw-input"
                              value={form.assetValue}
                              onChange={e => set('assetValue', e.target.value)}
                              placeholder="$"
                            />
                          </div>
                          <div>
                            <label className="cw-label">Approx. total debts</label>
                            <input
                              className="cw-input"
                              value={form.debtValue}
                              onChange={e => set('debtValue', e.target.value)}
                              placeholder="$"
                            />
                          </div>
                        </div>

                        <YesNoQuestion
                          legend="Is a case already filed with a court?"
                          name="caseFiled"
                          value={form.caseFiled}
                          onChange={v => set('caseFiled', v)}
                        />
                        {form.caseFiled === 'yes' && (
                          <>
                            <div>
                              <label className="cw-label">Estate name, case number, county, parties</label>
                              <textarea
                                className="cw-input"
                                rows={3}
                                value={form.caseDetails}
                                onChange={e => set('caseDetails', e.target.value)}
                              />
                            </div>
                            <DisabledFileButton label="Attach case files" helper="Please bring any case documents you have to your consultation." />
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="cw-label">Case Type / Topic</label>
                    <input
                      className="cw-input"
                      value={form.caseType}
                      onChange={e => set('caseType', e.target.value)}
                      placeholder={
                        isProbate
                          ? 'e.g. Independent administration, probate of foreign will'
                          : 'e.g. New will, trust setup, LLC formation'
                      }
                    />
                  </div>

                  <div>
                    <label className="cw-label">Describe Your Situation</label>
                    <textarea
                      className="cw-input"
                      rows={5}
                      value={form.description}
                      onChange={e => set('description', e.target.value)}
                      placeholder="A few sentences about your situation."
                    />
                    <div className="flex justify-between mt-2">
                      <span className="text-xs text-cw-ink-mute">Min. 20 characters</span>
                      <span className={`text-xs font-semibold ${form.description.length >= 20 ? 'text-cw-success' : 'text-cw-ink-mute'}`}>
                        {form.description.length} / 20
                      </span>
                    </div>
                  </div>

                  <fieldset>
                    <legend className="cw-label">How urgent is your need?</legend>
                    <div className="mt-3 space-y-2">
                      {URGENCY_OPTIONS.map(u => (
                        <label
                          key={u.value}
                          className={`cw-radio-row ${form.urgency === u.value ? 'cw-radio-row-selected' : ''}`}
                        >
                          <input
                            type="radio"
                            name="urgency"
                            value={u.value}
                            checked={form.urgency === u.value}
                            onChange={() => set('urgency', u.value)}
                            className="cw-radio-input"
                          />
                          <span className="cw-radio-label">
                            {u.label}
                            <span className="cw-radio-sub">{u.sub}</span>
                          </span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                </div>

                {revealedSections === 2 && (
                  <div className="cw-section-continue">
                    <button
                      type="button"
                      className="cw-continue-link"
                      disabled={!isSection2Valid()}
                      onClick={() => advanceTo(3)}
                    >
                      Continue to Review
                    </button>
                  </div>
                )}
              </section>
            )}

            {/* ── Section 3: Review & Consent ── */}
            {revealedSections >= 3 && (
              <section ref={section3Ref} className="cw-formsection cw-formsection-reveal">
                <header className="cw-formsection-header">
                  <p className="cw-formsection-kicker">3. Review & Consent</p>
                  <p className="cw-formsection-help">Confirm your information before submitting.</p>
                </header>

                <ReviewSummary form={form} isProbate={isProbate} />

                <div className="space-y-4 mt-8 mb-6">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.consentToContact}
                      onChange={e => set('consentToContact', e.target.checked)}
                      className="mt-1 accent-cw-gold shrink-0 w-[18px] h-[18px]"
                    />
                    <span className="text-cw-ink-soft text-sm leading-relaxed">
                      I consent to be contacted by Crain &amp; Wooley via phone, email, or SMS regarding my legal inquiry.
                    </span>
                  </label>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.consentToTerms}
                      onChange={e => set('consentToTerms', e.target.checked)}
                      className="mt-1 accent-cw-gold shrink-0 w-[18px] h-[18px]"
                    />
                    <span className="text-cw-ink-soft text-sm leading-relaxed">
                      I understand submission does not create an attorney-client relationship and the $300 consultation fee is required to schedule.
                    </span>
                  </label>
                </div>

                {error && (
                  <div className="text-sm text-cw-danger border border-cw-danger/30 bg-cw-danger/[0.06] px-4 py-3 rounded mb-2">
                    {error}
                  </div>
                )}

                <div className="flex justify-center pt-2">
                  <button
                    type="button"
                    className="cw-btn-primary"
                    disabled={!isSection3Valid() || loading}
                    onClick={handleSubmit}
                    style={{ fontSize: '1rem', padding: '14px 32px' }}
                  >
                    {loading ? 'Submitting…' : 'Submit Intake'}
                  </button>
                </div>
              </section>
            )}

            <p className="text-center text-xs text-cw-ink-mute mt-12 leading-relaxed tracking-wide">
              Licensed Texas attorneys &nbsp;·&nbsp; Confidential review &nbsp;·&nbsp; About three minutes
            </p>

          </div>
        </div>
      </div>
    </main>
  )
}

function YesNoQuestion({
  legend,
  name,
  value,
  onChange,
}: {
  legend: string
  name: string
  value: YesNo
  onChange: (v: YesNo) => void
}) {
  return (
    <fieldset>
      <legend className="cw-label">{legend}</legend>
      <div className="mt-3 flex gap-3">
        {(['yes', 'no'] as const).map(v => (
          <label
            key={v}
            className={`cw-radio-row cw-radio-row-inline ${value === v ? 'cw-radio-row-selected' : ''}`}
          >
            <input
              type="radio"
              name={name}
              value={v}
              checked={value === v}
              onChange={() => onChange(v)}
              className="cw-radio-input"
            />
            <span className="cw-radio-label capitalize">{v}</span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}

function DisabledFileButton({ label, helper }: { label: string; helper: string }) {
  return (
    <div>
      <button type="button" className="cw-fileupload-disabled" disabled aria-disabled="true">
        <span className="cw-fileupload-icon" aria-hidden="true">📎</span>
        {label}
        <span className="cw-fileupload-status">Coming soon</span>
      </button>
      <p className="cw-fileupload-help">{helper}</p>
    </div>
  )
}

function ReviewSummary({ form, isProbate }: { form: FormState; isProbate: boolean }) {
  const general: Array<[string, string]> = []
  const push = (label: string, value: string | undefined | null) => {
    if (value && value.trim().length > 0) general.push([label, value])
  }
  push('Name', `${form.firstName} ${form.lastName}`.trim())
  push('Email', form.email)
  push('Phone', form.phone)
  push('Practice Area', PRACTICE_AREAS.find(p => p.value === form.practiceArea)?.label ?? form.practiceArea)
  push('Urgency', URGENCY_OPTIONS.find(u => u.value === form.urgency)?.label ?? form.urgency)
  push('Case Type', form.caseType)
  push('Describes', form.description)
  if (form.qualifyingFactors.length > 0) {
    push(
      'Situation',
      form.qualifyingFactors
        .map(f => QUALIFYING_FACTORS.find(x => x.value === f)?.label)
        .filter(Boolean)
        .join(' · ')
    )
  }

  const probate: Array<[string, string]> = []
  const pushP = (label: string, value: string | undefined | null) => {
    if (value && value.toString().trim().length > 0) probate.push([label, value.toString()])
  }
  if (isProbate) {
    pushP('Decedent', form.decedentName)
    pushP('Your Relation', form.decedentRelation)
    if (form.decedentTxResident) pushP('TX Resident', form.decedentTxResident === 'yes' ? 'Yes' : 'No')
    pushP('Last Address', form.decedentAddress)
    if (form.hasTxAssets) pushP('TX Assets', form.hasTxAssets === 'yes' ? 'Yes' : 'No')
    pushP('TX Asset Details', form.txAssetsDescription)
    if (form.youInTexas) pushP('You in TX', form.youInTexas === 'yes' ? 'Yes' : 'No')
    pushP('Your Location', form.yourAddress)
    if (form.hasWill) {
      pushP(
        'Has Will',
        form.hasWill === 'yes'
          ? form.executorName
            ? `Yes — Executor: ${form.executorName}`
            : 'Yes'
          : 'No'
      )
    }
    pushP('Will Notes', form.willNotes)
    if (form.hasTrust) {
      pushP(
        'Has Trust',
        form.hasTrust === 'yes'
          ? form.trusteeName
            ? `Yes — Trustee: ${form.trusteeName}`
            : 'Yes'
          : 'No'
      )
    }
    pushP('Trust Notes', form.trustNotes)
    pushP('Est. Assets', form.assetValue)
    pushP('Est. Debts', form.debtValue)
    if (form.caseFiled) pushP('Case Filed', form.caseFiled === 'yes' ? 'Yes' : 'No')
    pushP('Case Details', form.caseDetails)
  }

  return (
    <div className="cw-review-summary">
      {general.map(([label, value]) => (
        <div key={label} className="cw-review-row">
          <span className="cw-review-label">{label}</span>
          <span className="cw-review-value">{value}</span>
        </div>
      ))}
      {probate.length > 0 && (
        <>
          <div className="cw-review-section-break">Probate Details</div>
          {probate.map(([label, value]) => (
            <div key={`p-${label}`} className="cw-review-row">
              <span className="cw-review-label">{label}</span>
              <span className="cw-review-value">{value}</span>
            </div>
          ))}
        </>
      )}
    </div>
  )
}
