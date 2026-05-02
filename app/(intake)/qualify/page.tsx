'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { IntakeFormData, PracticeArea, Urgency } from '@/types'

const STEPS = ['Contact', 'Case Details', 'Review & Submit']

const PRACTICE_AREAS: { value: PracticeArea; label: string }[] = [
  { value: 'ESTATE_PLANNING', label: 'Estate Planning' },
  { value: 'FAMILY_LAW', label: 'Family Law' },
  { value: 'PERSONAL_INJURY', label: 'Personal Injury' },
  { value: 'BUSINESS_LAW', label: 'Business Law' },
  { value: 'CRIMINAL_DEFENSE', label: 'Criminal Defense' },
  { value: 'REAL_ESTATE', label: 'Real Estate' },
  { value: 'OTHER', label: 'Other' },
]

const URGENCY_OPTIONS: { value: Urgency; label: string; sub: string }[] = [
  { value: 'IMMEDIATE', label: 'Immediate', sub: 'I need help now' },
  { value: 'WITHIN_WEEK', label: 'Within a week', sub: 'Urgent but not emergency' },
  { value: 'WITHIN_MONTH', label: 'Within a month', sub: 'Planning ahead' },
  { value: 'RESEARCHING', label: 'Just researching', sub: 'No immediate need' },
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
      {/* Header */}
      <header className="cw-header">
        <div className="cw-container py-5">
          <span className="font-display text-xl text-cw-gold tracking-widest">CRAIN & WOOLEY</span>
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center py-10 sm:py-16">
        <div className="cw-container">
          <div className="w-full max-w-xl mx-auto">
          {/* Step indicator */}
          <div className="flex items-center gap-0 mb-8 sm:mb-10">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center flex-1 last:flex-none">
                <div className={`flex items-center gap-2 ${i <= step ? 'opacity-100' : 'opacity-30'}`}>
                  <div className={`w-6 h-6 flex items-center justify-center text-xs font-mono border
                    ${i < step ? 'bg-cw-gold border-cw-gold text-cw-black' : ''}
                    ${i === step ? 'border-cw-gold text-cw-gold' : ''}
                    ${i > step ? 'border-cw-border text-cw-muted' : ''}`}>
                    {i < step ? '✓' : i + 1}
                  </div>
                  <span className="font-mono text-xs uppercase tracking-widest text-cw-muted hidden sm:block">{s}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-px mx-3 ${i < step ? 'bg-cw-gold' : 'bg-cw-border'}`} />
                )}
              </div>
            ))}
          </div>

          {/* Step 0 - Contact */}
          {step === 0 && (
            <div className="cw-panel p-6 sm:p-8 space-y-6">
              <div>
                <h2 className="font-display text-4xl text-cw-white">Contact Information</h2>
                <p className="text-cw-muted text-sm mt-1">All information is kept strictly confidential.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="cw-label">First Name</label>
                  <input className="cw-input" value={form.firstName} onChange={e => set('firstName', e.target.value)} placeholder="Justin" />
                </div>
                <div>
                  <label className="cw-label">Last Name</label>
                  <input className="cw-input" value={form.lastName} onChange={e => set('lastName', e.target.value)} placeholder="Crain" />
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
          )}

          {/* Step 1 - Case Details */}
          {step === 1 && (
            <div className="cw-panel p-6 sm:p-8 space-y-6">
              <div>
                <h2 className="font-display text-4xl text-cw-white">Case Details</h2>
                <p className="text-cw-muted text-sm mt-1">Help us understand your legal situation.</p>
              </div>
              <div>
                <label className="cw-label">Practice Area</label>
                <select className="cw-select" value={form.practiceArea} onChange={e => set('practiceArea', e.target.value as PracticeArea)}>
                  {PRACTICE_AREAS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              </div>
              <div>
                <label className="cw-label">Case Type / Topic</label>
                <input className="cw-input" value={form.caseType} onChange={e => set('caseType', e.target.value)} placeholder="e.g. Will and Trust Setup, Divorce Filing..." />
              </div>
              <div>
                <label className="cw-label">Describe Your Situation</label>
                <textarea
                  className="cw-input resize-none"
                  rows={4}
                  value={form.description}
                  onChange={e => set('description', e.target.value)}
                  placeholder="Please provide details about your legal matter..."
                />
                <p className="font-mono text-xs text-cw-muted mt-1">{form.description.length} / 20 min characters</p>
              </div>
              <div>
                <label className="cw-label">How Urgent Is Your Need?</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                  {URGENCY_OPTIONS.map(u => (
                    <button
                      key={u.value}
                      type="button"
                      onClick={() => set('urgency', u.value)}
                      className={`p-3 text-left border transition-all ${form.urgency === u.value ? 'border-cw-gold bg-cw-dark' : 'border-cw-border'}`}
                    >
                      <div className="font-mono text-xs text-cw-white uppercase tracking-wide">{u.label}</div>
                      <div className="text-cw-muted text-xs mt-0.5">{u.sub}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2 - Review */}
          {step === 2 && (
            <div className="cw-panel p-6 sm:p-8 space-y-6">
              <div>
                <h2 className="font-display text-4xl text-cw-white">Review & Submit</h2>
                <p className="text-cw-muted text-sm mt-1">Confirm your information before we proceed.</p>
              </div>
              <div className="space-y-3 text-sm">
                {[
                  ['Name', `${form.firstName} ${form.lastName}`],
                  ['Email', form.email],
                  ['Phone', form.phone],
                  ['Practice Area', form.practiceArea.replace(/_/g, ' ')],
                  ['Case Type', form.caseType],
                  ['Urgency', form.urgency.replace(/_/g, ' ')],
                ].map(([label, value]) => (
                  <div key={label} className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4 border-b border-cw-border pb-3">
                    <span className="font-mono text-xs text-cw-muted uppercase tracking-widest w-28 shrink-0 pt-0.5">{label}</span>
                    <span className="text-cw-white">{value}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-3 pt-2">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" checked={form.consentToContact} onChange={e => set('consentToContact', e.target.checked)} className="mt-1 accent-amber-500" />
                  <span className="text-cw-muted text-xs leading-relaxed">
                    I consent to be contacted by Crain & Wooley via phone, email, or SMS regarding my legal inquiry.
                  </span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" checked={form.consentToTerms} onChange={e => set('consentToTerms', e.target.checked)} className="mt-1 accent-amber-500" />
                  <span className="text-cw-muted text-xs leading-relaxed">
                    I understand that submission does not create an attorney-client relationship and that the $300 consultation fee is required to schedule.
                  </span>
                </label>
              </div>
              {error && <p className="font-mono text-xs text-red-400 bg-red-900/20 border border-red-900 p-3">{error}</p>}
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 mt-6">
            {step > 0 && (
              <button className="cw-btn-ghost" onClick={() => setStep(s => s - 1)}>&larr; Back</button>
            )}
            {step < STEPS.length - 1 ? (
              <button
                className="cw-btn-primary flex-1"
                disabled={!canProceed()}
                onClick={() => setStep(s => s + 1)}
              >
                Continue -&gt;
              </button>
            ) : (
              <button
                className="cw-btn-primary flex-1"
                disabled={!canProceed() || loading}
                onClick={handleSubmit}
              >
                {loading ? 'Submitting...' : 'Submit Intake -&gt;'}
              </button>
            )}
          </div>
          </div>
        </div>
      </div>
    </main>
  )
}
