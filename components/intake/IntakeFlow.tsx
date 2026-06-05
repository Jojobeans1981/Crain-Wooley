'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { cf } from '@/lib/cf'
import { IntakeScaffold } from './IntakeScaffold'
import { PrivacyShield } from './PrivacyShield'
import { CounselFinalStep, IntakeChooser, CounselWelcome } from './steps'
import {
  INITIAL_FORM, stepsFor, counselValidate, buildIntakeSummary,
  type IntakeForm, type IntakeType,
} from '@/lib/intake/schema'

type Phase = 'welcome' | 'choose' | 'form'
type UpdatePatch = Partial<IntakeForm> & { __jumpTo?: string }

const escapeHtml = (s: string) =>
  s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] as string))

/**
 * Self-contained, print- and download-ready HTML summary of the completed intake.
 * Drives both the "Print summary" (opens + prints) and "Save summary" (downloads
 * an .html file the client can keep or save as PDF) actions on the Review step.
 */
function buildSummaryHtml(form: IntakeForm): string {
  const sections = buildIntakeSummary(form)
  const client = `${form.firstName} ${form.lastName}`.trim() || 'New Client'
  const matter = form.intakeType === 'probate' ? 'Probate' : 'Wills & Trust'
  const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  const body = sections.map(s => `
    <section>
      <h2>${escapeHtml(s.title)}</h2>
      <table>
        ${s.rows.map(([k, v]) => `<tr><th>${escapeHtml(k)}</th><td>${escapeHtml(v)}</td></tr>`).join('')}
      </table>
    </section>`).join('')
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Crain &amp; Wooley — Intake Summary — ${escapeHtml(client)}</title>
<style>
  :root { --ink:#1a2230; --brass:#9c6f3f; --mute:#6a6358; --rule:#e4ddd1; }
  * { box-sizing: border-box; }
  body { font-family: Georgia, 'Times New Roman', serif; color: var(--ink); margin: 0; background: #fff; }
  .wrap { max-width: 720px; margin: 0 auto; padding: 48px 40px 64px; }
  header { border-bottom: 2px solid var(--ink); padding-bottom: 20px; margin-bottom: 28px; }
  .brand { font-size: 26px; font-weight: 700; letter-spacing: -0.01em; }
  .sub { font-family: Arial, Helvetica, sans-serif; font-size: 11px; letter-spacing: 0.22em; text-transform: uppercase; color: var(--brass); margin-top: 4px; }
  h1 { font-size: 20px; font-weight: 700; margin: 22px 0 6px; }
  .meta { font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: var(--mute); letter-spacing: 0.04em; }
  section { margin-bottom: 22px; page-break-inside: avoid; }
  h2 { font-size: 16px; font-weight: 700; margin: 0 0 8px; padding-bottom: 6px; border-bottom: 1px solid var(--rule); }
  table { width: 100%; border-collapse: collapse; }
  th, td { text-align: left; vertical-align: top; padding: 5px 0; font-family: Arial, Helvetica, sans-serif; }
  th { width: 42%; font-size: 10.5px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--mute); font-weight: 600; padding-right: 16px; }
  td { font-size: 13px; color: var(--ink); font-weight: 500; }
  footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid var(--rule); font-family: Arial, Helvetica, sans-serif; font-size: 11px; color: var(--mute); line-height: 1.5; }
  @media print { .wrap { padding: 0; max-width: none; } @page { margin: 18mm; } }
</style></head>
<body><div class="wrap">
  <header>
    <div class="brand">Crain &amp; Wooley</div>
    <div class="sub">Attorneys &amp; Counselors at Law</div>
    <h1>New Client Intake Summary</h1>
    <div class="meta">${escapeHtml(client)} &nbsp;·&nbsp; ${escapeHtml(matter)} &nbsp;·&nbsp; ${escapeHtml(dateStr)}</div>
  </header>
  ${body}
  <footer>This summary was generated from your intake form before submission. It is provided for your records. Submitting this intake does not create an attorney-client relationship.</footer>
</div></body></html>`
}

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
  // A11y: bumped on each failed Continue so the focus-first-error effect re-runs
  // even when the same fields fail twice; drives the assertive error summary too.
  const [errorNonce, setErrorNonce] = useState(0)
  const bodyRef = useRef<HTMLDivElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)

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

  // A11y G7/R1: on step change (incl. review "Edit" jumps), move focus to the
  // new step heading so focus isn't lost to <body> and SR reads the new section.
  // The "Section N of M" text is announced via the polite live region below,
  // which fires when its derived text changes.
  useEffect(() => {
    if (phase !== 'form') return
    headingRef.current?.focus()
  }, [stepIdx, phase])

  // A11y G4: after a failed Continue, move focus to the first invalid control
  // (the input itself, or the first control inside an invalid fieldset) and
  // bring it into view. Pairs with the assertive error summary below.
  useEffect(() => {
    if (!errorNonce) return
    const root = bodyRef.current
    if (!root) return
    const invalid = root.querySelector('[aria-invalid="true"]') as HTMLElement | null
    if (!invalid) return
    const focusTarget = invalid.matches('input, select, textarea, button')
      ? invalid
      : (invalid.querySelector('input, select, textarea, button') as HTMLElement | null)
    const el = focusTarget || invalid
    el.focus?.()
    el.scrollIntoView?.({ block: 'center' })
  }, [errorNonce])

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

  const printSummary = () => {
    const w = window.open('', '_blank', 'width=820,height=900')
    if (!w) {
      setSubmitError('Please allow pop-ups to print your summary.')
      return
    }
    w.document.write(buildSummaryHtml(form))
    w.document.close()
    w.focus()
    // Let the new document paint before invoking the print dialog.
    setTimeout(() => w.print(), 250)
  }

  const saveSummary = () => {
    const blob = new Blob([buildSummaryHtml(form)], { type: 'text/html;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const slug = (form.lastName || form.firstName || 'summary')
      .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'summary'
    const a = document.createElement('a')
    a.href = url
    a.download = `crain-wooley-intake-${slug}.html`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    setTimeout(() => URL.revokeObjectURL(url), 1000)
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
      setErrorNonce((n) => n + 1) // re-trigger focus-to-first-error + re-announce summary
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
  // Derived (not state) so the polite live region re-announces purely on change.
  const stepAnnounce =
    phase === 'form' ? `Section ${Math.min(stepIdx + 1, totalSteps)} of ${totalSteps}: ${currentStep.title}` : ''
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
        <span role="status" aria-live="polite" style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: cf.mono, fontSize: 10.5, letterSpacing: '0.16em', textTransform: 'uppercase', color: cf.textMute }}>
          {savedLabel && (
            <>
              <span aria-hidden="true" style={{ width: 6, height: 6, borderRadius: '50%', background: cf.brass, display: 'inline-block' }} />
              {savedLabel}
            </>
          )}
        </span>
      </div>

      {/* Progress rail */}
      <div className="cw-intake-pad" style={{ paddingTop: 12 }}>
        <div role="progressbar" aria-label="Intake progress"
          aria-valuemin={1} aria-valuemax={totalSteps} aria-valuenow={Math.min(stepIdx + 1, totalSteps)}
          aria-valuetext={`Section ${Math.min(stepIdx + 1, totalSteps)} of ${totalSteps}`}
          style={{ height: 2, background: cf.ruleSoft, position: 'relative' }}>
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${progressPct}%`, background: cf.brass, transition: 'width .35s cubic-bezier(.4,0,.2,1)' }} />
        </div>
        <div className="cw-intake-deskonly-grid" style={{ gridTemplateColumns: `repeat(${steps.length + 1}, minmax(0, 1fr))`, gap: 12, marginTop: 10 }}>
          {[...steps, { id: 'review', title: 'Review' }].map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => i <= stepIdx && setStepIdx(i)}
              disabled={i > stepIdx}
              aria-current={i === stepIdx ? 'step' : undefined}
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
      <div ref={bodyRef} className="cw-intake-pad" style={{ flex: 1, overflow: 'auto', paddingTop: 32, paddingBottom: 24 }}>
        {/* Polite step-change announcement (visually hidden) */}
        <div className="cw-sr-only" aria-live="polite" role="status">{stepAnnounce}</div>

        <div style={{ maxWidth: 760 }}>
          <div style={{ marginBottom: isMobile ? 22 : 28 }}>
            <h2 ref={headingRef} tabIndex={-1} className="font-display" style={{ margin: 0, color: cf.ink, fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.01em', fontSize: 'clamp(30px, 4vw, 40px)', outline: 'none' }}>
              {currentStep.title}
            </h2>
            <p style={{ fontFamily: cf.sans, fontSize: 14.5, color: cf.textMute, margin: '8px 0 0', lineHeight: 1.5 }}>
              {currentStep.hint}
            </p>
          </div>

          {/* A11y G4: assertive error summary, re-mounted on each failed Continue
              (key=errorNonce) so it re-announces even with the same field count. */}
          {currentId !== 'review' && errors.length > 0 && (
            <div key={errorNonce} role="alert"
              style={{
                fontFamily: cf.sans, fontSize: 13.5, color: cf.danger, lineHeight: 1.5,
                border: `1px solid ${cf.danger}`, background: 'rgba(162,58,42,0.06)',
                padding: '10px 14px', marginBottom: 22,
              }}>
              Please review the {errors.length} highlighted {errors.length === 1 ? 'question' : 'questions'} below before continuing.
            </div>
          )}

          <CounselFinalStep stepId={currentId} form={form} errors={errors} update={update} isMobile={isMobile} />

          {/* Print / save the summary + consent gate (review step only) */}
          {currentId === 'review' && (
            <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10, paddingBottom: 16, marginBottom: 4, borderBottom: `1px solid ${cf.ruleSoft}` }}>
                <span style={{ fontFamily: cf.mono, fontSize: 10.5, letterSpacing: '0.16em', textTransform: 'uppercase', color: cf.textMute, marginRight: 4 }}>
                  Keep a copy
                </span>
                {([['Print summary', printSummary], ['Save summary', saveSummary]] as [string, () => void][]).map(([label, handler]) => (
                  <button
                    key={label}
                    type="button"
                    onClick={handler}
                    style={{
                      fontFamily: cf.sans, fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase',
                      color: cf.ink, background: 'transparent', border: `1px solid ${cf.rule}`, padding: '10px 18px',
                      cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8, transition: 'border-color .15s, background .15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = cf.brass; e.currentTarget.style.background = cf.ivoryWarm }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = cf.rule; e.currentTarget.style.background = 'transparent' }}
                  >
                    <span style={{ color: cf.brass, fontSize: 13 }}>{label === 'Print summary' ? '⎙' : '↓'}</span>
                    {label}
                  </button>
                ))}
              </div>
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
                <div role="alert" style={{ fontFamily: cf.sans, fontSize: 13, color: cf.danger, border: `1px solid ${cf.danger}`, background: 'rgba(162,58,42,0.06)', padding: '10px 14px' }}>
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
          type="button"
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
            type="button"
            onClick={next}
            disabled={submitting || (currentId === 'review' && !consented)}
            aria-busy={submitting || undefined}
            style={{
              fontFamily: cf.sans, fontSize: 13, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase',
              color: cf.cream, background: cf.ink, border: `1px solid ${cf.ink}`, padding: '14px 28px',
              cursor: submitting || (currentId === 'review' && !consented) ? 'not-allowed' : 'pointer',
              opacity: submitting || (currentId === 'review' && !consented) ? 0.5 : 1,
              display: 'flex', alignItems: 'center', gap: 10, transition: 'background .15s',
            }}
          >
            {currentId === 'review' ? (submitting ? 'Submitting…' : 'Submit intake') : 'Continue'}
            <span aria-hidden="true" style={{ fontFamily: cf.serif, fontSize: 18, color: cf.brass }}>→</span>
          </button>
        </div>
      </div>
    </IntakeScaffold>
  )
}
