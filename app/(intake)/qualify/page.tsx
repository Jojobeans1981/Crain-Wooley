'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { IntakeFormData, PracticeArea, Urgency } from '@/types'

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

  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    try {
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
      <header className="cw-header">
        <div className="cw-container py-5">
          <span className="font-display text-xl text-cw-gold tracking-widest">CRAIN & WOOLEY</span>
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center py-10 sm:py-16">
        <div className="cw-container">
          <div className="w-full max-w-lg mx-auto">

            {/* Step indicator */}
            <div className="flex items-center mb-10">
              {STEPS.map((s, i) => (
                <div key={s} className="flex items-center flex-1 last:flex-none">
                  <div className={`flex items-center gap-2.5 ${i <= step ? 'opacity-100' : 'opacity-30'}`}>
                    <div className={`w-6 h-6 flex items-center justify-center text-xs font-mono border shrink-0
                      ${i < step  ? 'bg-cw-gold border-cw-gold text-cw-black' : ''}
                      ${i === step ? 'border-cw-gold text-cw-gold' : ''}
                      ${i > step  ? 'border-cw-border text-cw-muted' : ''}`}>
                      {i < step ? '✓' : i + 1}
                    </div>
                    <span className="font-mono text-[10px] uppercase tracking-widest text-cw-muted hidden sm:block">{s}</span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`flex-1 h-px mx-3 ${i < step ? 'bg-cw-gold' : 'bg-cw-border'}`} />
                  )}
                </div>
              ))}
            </div>

            {/* ── Step 0: Contact ── */}
            {step === 0 && (
              <div className="cw-panel p-8 sm:p-10">
                <div className="mb-8 pb-6 border-b border-cw-border">
                  <h2 className="font-display text-4xl text-cw-white">Contact Information</h2>
                  <p className="text-cw-muted text-sm mt-2">All information is kept strictly confidential.</p>
                </div>

                <div className="space-y-8">
                  <div className="grid grid-cols-2 gap-6">
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
                <div className="mb-8 pb-6 border-b border-cw-border">
                  <h2 className="font-display text-4xl text-cw-white">Case Details</h2>
                  <p className="text-cw-muted text-sm mt-2">Help us understand your legal situation.</p>
                </div>

                <div className="space-y-8">
                  {/* Practice area — clean list */}
                  <div>
                    <label className="cw-label">Practice Area</label>
                    <div className="mt-2 border border-cw-border divide-y divide-cw-border">
                      {PRACTICE_AREAS.map(p => (
                        <button
                          key={p.value}
                          type="button"
                          onClick={() => set('practiceArea', p.value as PracticeArea)}
                          className={`w-full flex items-center justify-between px-4 py-3.5 text-left transition-colors ${
                            form.practiceArea === p.value ? 'bg-cw-dark' : 'bg-transparent hover:bg-cw-dark'
                          }`}
                        >
                          <span className={`text-sm ${form.practiceArea === p.value ? 'text-cw-white font-medium' : 'text-cw-muted'}`}>
                            {p.label}
                          </span>
                          {form.practiceArea === p.value && (
                            <span className="text-cw-gold text-sm">✓</span>
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
                      rows={4}
                      value={form.description}
                      onChange={e => set('description', e.target.value)}
                      placeholder="Brief description of your legal matter..."
                    />
                    <div className="flex justify-between mt-2">
                      <span className="font-mono text-[10px] text-cw-muted">Min. 20 characters</span>
                      <span className={`font-mono text-[10px] ${form.description.length >= 20 ? 'text-cw-success' : 'text-cw-muted'}`}>
                        {form.description.length} / 20
                      </span>
                    </div>
                  </div>

                  {/* Urgency — clean list */}
                  <div>
                    <label className="cw-label">How Urgent Is Your Need?</label>
                    <div className="mt-2 border border-cw-border divide-y divide-cw-border">
                      {URGENCY_OPTIONS.map(u => (
                        <button
                          key={u.value}
                          type="button"
                          onClick={() => set('urgency', u.value)}
                          className={`w-full flex items-center justify-between px-4 py-3.5 text-left transition-colors ${
                            form.urgency === u.value ? 'bg-cw-dark' : 'bg-transparent hover:bg-cw-dark'
                          }`}
                        >
                          <div>
                            <span className={`text-sm ${form.urgency === u.value ? 'text-cw-white font-medium' : 'text-cw-muted'}`}>
                              {u.label}
                            </span>
                            <span className="text-cw-muted text-xs ml-3">{u.sub}</span>
                          </div>
                          {form.urgency === u.value && (
                            <span className="text-cw-gold text-sm shrink-0 ml-4">✓</span>
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
                <div className="mb-8 pb-6 border-b border-cw-border">
                  <h2 className="font-display text-4xl text-cw-white">Review & Submit</h2>
                  <p className="text-cw-muted text-sm mt-2">Confirm your information before we proceed.</p>
                </div>

                <div className="border border-cw-border divide-y divide-cw-border mb-8">
                  {[
                    ['Name',          `${form.firstName} ${form.lastName}`],
                    ['Email',         form.email],
                    ['Phone',         form.phone],
                    ['Practice Area', form.practiceArea.replace(/_/g, ' ')],
                    ['Case Type',     form.caseType],
                    ['Urgency',       form.urgency.replace(/_/g, ' ')],
                  ].map(([label, value]) => (
                    <div key={label} className="flex gap-4 px-4 py-3.5">
                      <span className="font-mono text-[10px] text-cw-muted uppercase tracking-widest w-24 shrink-0 pt-0.5">{label}</span>
                      <span className="text-cw-white text-sm">{value}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-5 mb-6">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" checked={form.consentToContact} onChange={e => set('consentToContact', e.target.checked)} className="mt-0.5 accent-amber-500 shrink-0" />
                    <span className="text-cw-muted text-sm leading-relaxed">
                      I consent to be contacted by Crain & Wooley via phone, email, or SMS regarding my legal inquiry.
                    </span>
                  </label>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" checked={form.consentToTerms} onChange={e => set('consentToTerms', e.target.checked)} className="mt-0.5 accent-amber-500 shrink-0" />
                    <span className="text-cw-muted text-sm leading-relaxed">
                      I understand submission does not create an attorney-client relationship and the $300 consultation fee is required to schedule.
                    </span>
                  </label>
                </div>

                {error && (
                  <div className="text-sm text-red-400 border border-red-900 bg-red-900/10 px-4 py-3 mb-2">
                    {error}
                  </div>
                )}
              </div>
            )}

            {/* Navigation */}
            <div className="flex gap-3 mt-4">
              {step > 0 && (
                <button className="cw-btn-ghost" onClick={() => setStep(s => s - 1)}>← Back</button>
              )}
              {step < STEPS.length - 1 ? (
                <button className="cw-btn-primary flex-1" disabled={!canProceed()} onClick={() => setStep(s => s + 1)}>
                  Continue →
                </button>
              ) : (
                <button className="cw-btn-primary flex-1 py-4" disabled={!canProceed() || loading} onClick={handleSubmit}>
                  {loading ? 'Submitting...' : 'Submit Intake →'}
                </button>
              )}
            </div>

          </div>
        </div>
      </div>
    </main>
  )
}
