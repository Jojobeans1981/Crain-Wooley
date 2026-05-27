'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { IntakeFormData, PracticeArea, Urgency } from '@/types'

// NOTE: All logic, state, validation, and API calls below are UNCHANGED
// from the prior build. Only presentation has been restyled to match the
// estateplanningdfw.law brand.

const STEPS = ['Contact', 'Case Details', 'Review & Submit']

const PRACTICE_AREAS: { value: PracticeArea; label: string }[] = [
  { value: 'ESTATE_PLANNING',  label: 'Estate Planning' },
  { value: 'FAMILY_LAW',       label: 'Family Law' },
  { value: 'PERSONAL_INJURY',  label: 'Personal Injury' },
  { value: 'BUSINESS_LAW',     label: 'Business Law' },
  { value: 'CRIMINAL_DEFENSE', label: 'Criminal Defense' },
  { value: 'REAL_ESTATE',      label: 'Real Estate' },
  { value: 'OTHER',            label: 'Other' },
]

const URGENCY_OPTIONS: { value: Urgency; label: string; sub: string }[] = [
  { value: 'IMMEDIATE',    label: 'Immediate',       sub: 'I need help now' },
  { value: 'WITHIN_WEEK',  label: 'Within a week',   sub: 'Urgent but not emergency' },
  { value: 'WITHIN_MONTH', label: 'Within a month',  sub: 'Planning ahead' },
  { value: 'RESEARCHING',  label: 'Just researching', sub: 'No immediate need' },
]

const EMPTY: IntakeFormData = {
  firstName: '', lastName: '', email: '', phone: '',
  practiceArea: 'ESTATE_PLANNING', caseType: '', description: '', urgency: 'WITHIN_WEEK',
  consentToContact: false, consentToTerms: false,
}

export default function QualifyPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<IntakeFormData>(EMPTY)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (key: keyof IntakeFormData, value: unknown) =>
    setForm((f) => ({ ...f, [key]: value }))

  const canProceed = () => {
    if (step === 0) return form.firstName && form.lastName && form.email && form.phone
    if (step === 1) return form.practiceArea && form.caseType && form.description.length >= 20 && form.urgency
    if (step === 2) return form.consentToContact && form.consentToTerms
    return false
  }

  const DEMO = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'

  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    try {
      if (DEMO) {
        await new Promise(r => setTimeout(r, 900))
        router.push('/payment?leadId=demo-lead')
        return
      }
      const res = await fetch('/api/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)
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

  return (
    <main className="cw-page flex flex-col">
      {/* Header */}
      <header className="cw-header">
        <div className="cw-container py-5 flex items-center justify-between">
          <Link href="/" className="no-underline flex items-center gap-3" aria-label="Crain & Wooley — Home">
            <span role="img" aria-label="Crain & Wooley emblem" className="cw-emblem" />
            <span className="font-display text-2xl sm:text-3xl font-semibold text-cw-navy">
              Crain <span className="text-cw-gold">&amp;</span> Wooley
            </span>
          </Link>
          <a
            href="tel:9729451610"
            className="hidden sm:inline-flex items-center gap-2 text-cw-navy font-semibold text-sm hover:text-cw-gold transition-colors"
          >
            <span className="text-cw-gold">☎</span> (972) 945-1610
          </a>
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center py-10 sm:py-16">
        <div className="cw-container">
          <div className="w-full max-w-2xl mx-auto">

            {/* Page heading */}
            <div className="text-center mb-10">
              <p className="cw-eyebrow mb-3">Free Case Review</p>
              <h1 className="font-display text-cw-navy text-4xl sm:text-5xl font-semibold leading-tight mb-3">
                Tell Us About Your Situation
              </h1>
              <div className="w-12 h-[2px] bg-cw-gold mx-auto mb-4" aria-hidden="true" />
              <p className="text-cw-ink-soft text-base max-w-md mx-auto leading-relaxed">
                A few quick questions so we can determine if we&apos;re the right fit — and get
                you to the right attorney faster.
              </p>
            </div>

            {/* Step indicator */}
            <div className="flex items-center mb-10">
              {STEPS.map((s, i) => (
                <div key={s} className="flex items-center flex-1 last:flex-none">
                  <div className={`flex items-center gap-3 ${i <= step ? 'opacity-100' : 'opacity-50'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 transition-all
                      ${i < step  ? 'bg-cw-gold text-white' : ''}
                      ${i === step ? 'bg-cw-navy text-white' : ''}
                      ${i > step  ? 'bg-white border border-cw-line text-cw-ink-mute' : ''}`}>
                      {i < step ? '✓' : i + 1}
                    </div>
                    <span className={`font-sans text-xs sm:text-sm font-medium hidden sm:block ${i <= step ? 'text-cw-navy' : 'text-cw-ink-mute'}`}>
                      {s}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`flex-1 h-[2px] mx-3 transition-colors ${i < step ? 'bg-cw-gold' : 'bg-cw-line'}`} />
                  )}
                </div>
              ))}
            </div>

            {/* ── Step 0: Contact ── */}
            {step === 0 && (
              <div className="cw-panel p-8 sm:p-10">
                <div className="mb-8 pb-6 border-b border-cw-line">
                  <h2 className="font-display text-3xl text-cw-navy font-semibold">Contact Information</h2>
                  <p className="text-cw-ink-soft text-sm mt-2 leading-relaxed">
                    All information is kept strictly confidential. We&apos;ll only use it to follow up about your matter.
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="cw-label">First Name</label>
                      <input className="cw-input" value={form.firstName} onChange={e => set('firstName', e.target.value)} placeholder="First" autoFocus />
                    </div>
                    <div>
                      <label className="cw-label">Last Name</label>
                      <input className="cw-input" value={form.lastName} onChange={e => set('lastName', e.target.value)} placeholder="Last" />
                    </div>
                  </div>
                  <div>
                    <label className="cw-label">Email Address</label>
                    <input className="cw-input" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="you@email.com" />
                  </div>
                  <div>
                    <label className="cw-label">Phone Number</label>
                    <input className="cw-input" type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="(555) 000-0000" />
                  </div>
                </div>
              </div>
            )}

            {/* ── Step 1: Case Details ── */}
            {step === 1 && (
              <div className="cw-panel p-8 sm:p-10">
                <div className="mb-8 pb-6 border-b border-cw-line">
                  <h2 className="font-display text-3xl text-cw-navy font-semibold">Case Details</h2>
                  <p className="text-cw-ink-soft text-sm mt-2 leading-relaxed">
                    Help us understand your legal situation so we can prepare the right attorney.
                  </p>
                </div>

                <div className="space-y-8">
                  {/* Practice area */}
                  <div>
                    <label className="cw-label">Practice Area</label>
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {PRACTICE_AREAS.map(p => (
                        <button
                          key={p.value}
                          type="button"
                          onClick={() => set('practiceArea', p.value as PracticeArea)}
                          className={`flex items-center justify-between px-4 py-3 text-left rounded border transition-all ${
                            form.practiceArea === p.value
                              ? 'border-cw-gold bg-cw-gold/[0.08] shadow-sm'
                              : 'border-cw-line bg-white hover:border-cw-gold/60 hover:bg-cw-gold/[0.04]'
                          }`}
                        >
                          <span className={`text-sm ${form.practiceArea === p.value ? 'text-cw-navy font-semibold' : 'text-cw-ink-soft'}`}>
                            {p.label}
                          </span>
                          {form.practiceArea === p.value && (
                            <span className="text-cw-gold text-sm font-semibold">✓</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="cw-label">Case Type / Topic</label>
                    <input
                      className="cw-input"
                      value={form.caseType}
                      onChange={e => set('caseType', e.target.value)}
                      placeholder="e.g. Will setup, divorce filing, injury claim..."
                    />
                  </div>

                  <div>
                    <label className="cw-label">Describe Your Situation</label>
                    <textarea
                      className="cw-input resize-none"
                      rows={5}
                      value={form.description}
                      onChange={e => set('description', e.target.value)}
                      placeholder="Brief description of your legal matter..."
                    />
                    <div className="flex justify-between mt-2">
                      <span className="text-xs text-cw-ink-mute">Min. 20 characters</span>
                      <span className={`text-xs font-semibold ${form.description.length >= 20 ? 'text-cw-success' : 'text-cw-ink-mute'}`}>
                        {form.description.length} / 20
                      </span>
                    </div>
                  </div>

                  {/* Urgency */}
                  <div>
                    <label className="cw-label">How Urgent Is Your Need?</label>
                    <div className="mt-3 space-y-2">
                      {URGENCY_OPTIONS.map(u => (
                        <button
                          key={u.value}
                          type="button"
                          onClick={() => set('urgency', u.value)}
                          className={`w-full flex items-center justify-between px-4 py-3.5 text-left rounded border transition-all ${
                            form.urgency === u.value
                              ? 'border-cw-gold bg-cw-gold/[0.08]'
                              : 'border-cw-line bg-white hover:border-cw-gold/60 hover:bg-cw-gold/[0.04]'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-3">
                            <span className={`text-sm ${form.urgency === u.value ? 'text-cw-navy font-semibold' : 'text-cw-ink-soft'}`}>
                              {u.label}
                            </span>
                            <span className="text-cw-ink-mute text-xs">{u.sub}</span>
                          </div>
                          {form.urgency === u.value && (
                            <span className="text-cw-gold text-sm shrink-0 ml-4 font-semibold">✓</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── Step 2: Review ── */}
            {step === 2 && (
              <div className="cw-panel p-8 sm:p-10">
                <div className="mb-8 pb-6 border-b border-cw-line">
                  <h2 className="font-display text-3xl text-cw-navy font-semibold">Review &amp; Submit</h2>
                  <p className="text-cw-ink-soft text-sm mt-2 leading-relaxed">
                    Confirm your information before we proceed.
                  </p>
                </div>

                <div className="border border-cw-line rounded divide-y divide-cw-line mb-8 bg-white">
                  {[
                    ['Name',          `${form.firstName} ${form.lastName}`],
                    ['Email',         form.email],
                    ['Phone',         form.phone],
                    ['Practice Area', form.practiceArea.replace(/_/g, ' ')],
                    ['Case Type',     form.caseType],
                    ['Urgency',       form.urgency.replace(/_/g, ' ')],
                  ].map(([label, value]) => (
                    <div key={label} className="flex gap-4 px-4 py-3.5">
                      <span className="text-xs text-cw-ink-mute uppercase tracking-wider font-semibold w-28 shrink-0 pt-0.5">{label}</span>
                      <span className="text-cw-navy text-sm font-medium">{value}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-4 mb-6">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" checked={form.consentToContact} onChange={e => set('consentToContact', e.target.checked)} className="mt-1 accent-cw-gold shrink-0 w-4 h-4" />
                    <span className="text-cw-ink-soft text-sm leading-relaxed">
                      I consent to be contacted by Crain &amp; Wooley via phone, email, or SMS regarding my legal inquiry.
                    </span>
                  </label>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" checked={form.consentToTerms} onChange={e => set('consentToTerms', e.target.checked)} className="mt-1 accent-cw-gold shrink-0 w-4 h-4" />
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
              </div>
            )}

            {/* Navigation */}
            <div className="flex gap-3 mt-6">
              {step > 0 && (
                <button className="cw-btn-ghost" onClick={() => setStep(s => s - 1)}>← Back</button>
              )}
              {step < STEPS.length - 1 ? (
                <button className="cw-btn-primary flex-1" disabled={!canProceed()} onClick={() => setStep(s => s + 1)}>
                  Continue →
                </button>
              ) : (
                <button className="cw-btn-primary flex-1 !py-4" disabled={!canProceed() || loading} onClick={handleSubmit}>
                  {loading ? 'Submitting...' : 'Submit Intake →'}
                </button>
              )}
            </div>

            {/* Trust footer */}
            <p className="text-center text-xs text-cw-ink-mute mt-8 leading-relaxed">
              <span className="text-cw-gold">✦</span> Licensed Texas Attorneys &nbsp;·&nbsp; <span className="text-cw-gold">✦</span> Client Privacy Guaranteed &nbsp;·&nbsp; <span className="text-cw-gold">✦</span> Takes About 3 Minutes
            </p>

          </div>
        </div>
      </div>
    </main>
  )
}
