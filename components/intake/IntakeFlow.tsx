'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { cf } from '@/lib/cf'
import { IntakeScaffold } from './IntakeScaffold'
import { PrivacyShield } from './PrivacyShield'
import { CounselFinalStep, IntakeChooser, CounselWelcome } from './steps'
import {
  INITIAL_FORM, stepsFor, counselValidate,
  type IntakeForm, type IntakeType,
} from '@/lib/intake/schema'

type Phase = 'welcome' | 'choose' | 'form'
type UpdatePatch = Partial<IntakeForm> & { __jumpTo?: string }

/**
 * Estate intake orchestrator — the welcome → Wills/Probate chooser → branched
 * multi-step questionnaire, ported from the approved design's CounselFinalIntake
 * and wired into the app: on submit it POSTs the full form to /api/intake and
 * routes into the existing qualify → $300 payment → schedule → confirmation
 * pipeline. Rendered inside the shared split-screen IntakeScaffold.
 */
export function IntakeFlow() {
  const router = useRouter()
  const [phase, setPhase] = useState<Phase>('welcome')
  const [stepIdx, setStepIdx] = useState(0)
  const [form, setForm] = useState<IntakeForm>(INITIAL_FORM)
  const [errors, setErrors] = useState<string[]>([])
  const [savedAt, setSavedAt] = useState<Date | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [consented, setConsented] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    // Intentional one-time sync from an external system (matchMedia) on mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMobile(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const steps = stepsFor(form.intakeType)
  const totalSteps = steps.length + 1 // + review
  const currentId = stepIdx < steps.length ? steps[stepIdx].id : 'review'
  const currentStep =
    stepIdx < steps.length ? steps[stepIdx] : { title: 'Review', hint: 'Confirm your details before submitting.' }

  // Autosave indicator (debounced)
  useEffect(() => {
    if (phase !== 'form') return
    const t = setTimeout(() => setSavedAt(new Date()), 600)
    return () => clearTimeout(t)
  }, [form, phase])

  const update = (patch: UpdatePatch) => {
    if (patch.__jumpTo) {
      const target = steps.findIndex((s) => s.id === patch.__jumpTo)
      if (target >= 0) setStepIdx(target)
      return
    }
    setForm((f) => ({ ...f, ...patch }))
    if (errors.length) setErrors((errs) => errs.filter((e) => !(e in patch)))
  }

  const DEMO = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'

  const submit = async () => {
    setSubmitting(true)
    setSubmitError('')
    const payload: IntakeForm = { ...form, consentToContact: consented, consentToTerms: consented }
    try {
      if (DEMO) {
        await new Promise((r) => setTimeout(r, 900))
        router.push('/payment?leadId=demo-lead')
        return
      }
      const res = await fetch('/api/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)
      if (data.qualified) router.push(`/payment?leadId=${data.leadId}`)
      else router.push(`/confirmation?disqualified=true&reason=${encodeURIComponent(data.reason || '')}`)
    } catch {
      setSubmitError('Submission failed. Please try again.')
      setSubmitting(false)
    }
  }

  const next = () => {
    if (currentId === 'review') {
      if (!consented) return
      submit()
      return
    }
    const errs = counselValidate(form, currentId)
    if (errs.length) {
      setErrors(errs)
      return
    }
    setErrors([])
    setStepIdx((i) => i + 1)
  }
  const back = () => {
    setErrors([])
    setStepIdx((i) => Math.max(0, i - 1))
  }

  const progressPct = (stepIdx / (totalSteps - 1)) * 100
  const savedLabel =
    savedAt && phase === 'form'
      ? `Saved ${savedAt.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`
      : ''

  // ── Welcome / chooser phases ──
  if (phase === 'welcome') {
    return (
      <IntakeScaffold>
        <div
          className="cw-intake-pad"
          style={{ flex: 1, display: 'flex', alignItems: 'center', paddingTop: 48, paddingBottom: 32 }}
        >
          <CounselWelcome isMobile={isMobile} onBegin={() => setPhase('choose')} />
        </div>
      </IntakeScaffold>
    )
  }
  if (phase === 'choose') {
    return (
      <IntakeScaffold>
        <div
          className="cw-intake-pad"
          style={{ flex: 1, display: 'flex', alignItems: 'center', paddingTop: 48, paddingBottom: 32 }}
        >
          <IntakeChooser
            isMobile={isMobile}
            onChoose={(type: IntakeType) => {
              setForm({ ...INITIAL_FORM, intakeType: type })
              setStepIdx(0)
              setErrors([])
              setConsented(false)
              setPhase('form')
            }}
          />
        </div>
      </IntakeScaffold>
    )
  }

  // ── Form phase ──
  return (
    <IntakeScaffold>
      {/* Top — section indicator + change + saved */}
      <div
        className="cw-intake-pad"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, paddingTop: 24 }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', fontFamily: cf.mono, fontSize: 10.5, letterSpacing: '0.22em', textTransform: 'uppercase', color: cf.textMute }}>
          <span>Section {Math.min(stepIdx + 1, totalSteps)} of {totalSteps}</span>
          <span style={{ color: cf.brass }}>· {form.intakeType === 'probate' ? 'Probate' : 'Wills & Trust'}</span>
          {stepIdx === 0 && (
            <button
              type="button"
              onClick={() => setPhase('choose')}
              style={{ background: 'transparent', border: 'none', padding: 0, color: cf.textMute, fontFamily: cf.mono, fontSize: 10.5, letterSpacing: '0.16em', textTransform: 'uppercase', cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 3 }}
            >
              Change
            </button>
          )}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: cf.mono, fontSize: 10.5, letterSpacing: '0.16em', textTransform: 'uppercase', color: cf.textMute }}>
          {savedLabel && (
            <>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: cf.brass, display: 'inline-block' }} />
              {savedLabel}
            </>
          )}
        </span>
      </div>

      {/* Progress rail */}
      <div className="cw-intake-pad" style={{ paddingTop: 12 }}>
        <div style={{ height: 2, background: cf.ruleSoft, position: 'relative' }}>
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${progressPct}%`, background: cf.brass, transition: 'width .35s cubic-bezier(.4,0,.2,1)' }} />
        </div>
        <div className="cw-intake-deskonly-grid" style={{ gridTemplateColumns: `repeat(${steps.length + 1}, minmax(0, 1fr))`, gap: 12, marginTop: 10 }}>
          {[...steps, { id: 'review', title: 'Review' }].map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => i <= stepIdx && setStepIdx(i)}
              disabled={i > stepIdx}
              style={{
                fontFamily: cf.sans, fontSize: 11, letterSpacing: '0.02em',
                color: i <= stepIdx ? cf.ink : cf.textMute,
                fontWeight: i === stepIdx ? 600 : 400,
                background: 'transparent', border: 'none', padding: '4px 0',
                cursor: i <= stepIdx ? 'pointer' : 'default',
                textAlign: i === 0 ? 'left' : i === steps.length ? 'right' : 'center',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', minWidth: 0,
              }}
            >
              {s.title}
            </button>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="cw-intake-pad" style={{ flex: 1, overflow: 'auto', paddingTop: 32, paddingBottom: 24 }}>
        <div style={{ maxWidth: 760 }}>
          <div style={{ marginBottom: isMobile ? 22 : 28 }}>
            <h2 className="font-display" style={{ margin: 0, color: cf.ink, fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.01em', fontSize: 'clamp(30px, 4vw, 40px)' }}>
              {currentStep.title}
            </h2>
            <p style={{ fontFamily: cf.sans, fontSize: 14.5, color: cf.textMute, margin: '8px 0 0', lineHeight: 1.5 }}>
              {currentStep.hint}
            </p>
          </div>

          <CounselFinalStep stepId={currentId} form={form} errors={errors} update={update} isMobile={isMobile} />

          {/* Consent gate (review step only) */}
          {currentId === 'review' && (
            <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={consented}
                  onChange={(e) => setConsented(e.target.checked)}
                  style={{ marginTop: 3, width: 16, height: 16, accentColor: cf.brass, flexShrink: 0 }}
                />
                <span style={{ fontFamily: cf.sans, fontSize: 13.5, color: cf.textMute, lineHeight: 1.55 }}>
                  I consent to be contacted by Crain &amp; Wooley by phone, email, or SMS about my inquiry, and
                  I understand that submitting this intake does not create an attorney-client relationship and that
                  a $300 consultation fee is required to reserve a time.
                </span>
              </label>
              {submitError && (
                <div style={{ fontFamily: cf.sans, fontSize: 13, color: cf.danger, border: `1px solid ${cf.danger}`, background: 'rgba(162,58,42,0.06)', padding: '10px 14px' }}>
                  {submitError}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Action bar */}
      <div
        className="cw-intake-pad"
        style={{ borderTop: `1px solid ${cf.rule}`, paddingTop: 18, paddingBottom: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: cf.cream, position: 'sticky', bottom: 0 }}
      >
        <button
          onClick={back}
          disabled={stepIdx === 0}
          style={{ fontFamily: cf.sans, fontSize: 13, letterSpacing: '0.04em', color: stepIdx === 0 ? cf.textMute : cf.ink, background: 'transparent', border: 'none', padding: '10px 4px', cursor: stepIdx === 0 ? 'default' : 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <span style={{ fontFamily: cf.serif, fontSize: 18 }}>←</span> Back
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <span style={{ fontFamily: cf.sans, fontSize: 11.5, color: cf.textMute, display: 'flex', alignItems: 'center', gap: 6 }}>
            <PrivacyShield color={cf.brass} size={12} /> Confidential
          </span>
          <button
            onClick={next}
            disabled={submitting || (currentId === 'review' && !consented)}
            style={{
              fontFamily: cf.sans, fontSize: 13, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase',
              color: cf.cream, background: cf.ink, border: `1px solid ${cf.ink}`, padding: '14px 28px',
              cursor: submitting || (currentId === 'review' && !consented) ? 'not-allowed' : 'pointer',
              opacity: submitting || (currentId === 'review' && !consented) ? 0.5 : 1,
              display: 'flex', alignItems: 'center', gap: 10, transition: 'background .15s',
            }}
          >
            {currentId === 'review' ? (submitting ? 'Submitting…' : 'Submit intake') : 'Continue'}
            <span style={{ fontFamily: cf.serif, fontSize: 18, color: cf.brass }}>→</span>
          </button>
        </div>
      </div>
    </IntakeScaffold>
  )
}
