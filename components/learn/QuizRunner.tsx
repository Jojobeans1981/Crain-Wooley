'use client'

import { useState } from 'react'
import Link from 'next/link'
import { SCORING_APPROVED, type QuizDef } from '@/lib/learn/scoring'

type Phase = 'questions' | 'email' | 'done'
interface ResultPayload {
  tier: string
  headline: string
  explanation: string
  primaryPersona: string | null
  recommendedPillar?: string
}

export default function QuizRunner({
  def,
  crumbLabel,
  crumbHref,
}: {
  def: QuizDef
  crumbLabel?: string
  crumbHref?: string
}) {
  const questions = def.questions
  const [phase, setPhase] = useState<Phase>('questions')
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<ResultPayload | null>(null)

  const q = questions[step]
  const progress = phase === 'questions' ? step + 1 : questions.length + 1
  const totalSteps = questions.length + 1
  const showGraded = def.kind === 'router' || SCORING_APPROVED

  function choose(value: string) {
    setAnswers((a) => ({ ...a, [q.id]: value }))
    if (step + 1 < questions.length) setStep(step + 1)
    else setPhase('email')
  }
  function back() {
    setError('')
    if (phase === 'email') { setPhase('questions'); setStep(questions.length - 1); return }
    if (step > 0) setStep(step - 1)
  }
  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Please enter a valid email.'); return }
    setSubmitting(true)
    try {
      const res = await fetch('/api/learn/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, firstName, answers, quizSlug: def.slug }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.error || 'Something went wrong.')
      setResult(data.result)
      setPhase('done')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setSubmitting(false)
    }
  }

  const pillarHref = result?.recommendedPillar ? `/learn/${result.recommendedPillar}` : '/learn'

  return (
    <div className="cw-container learn-quiz">
      <nav aria-label="Breadcrumb" className="learn-breadcrumb">
        <Link href="/learn">Learn</Link>
        {crumbLabel && crumbHref && <> <span aria-hidden="true">→</span> <Link href={crumbHref}>{crumbLabel}</Link></>} <span aria-hidden="true">→</span> <span aria-current="page">Quiz</span>
      </nav>

      {phase !== 'done' && (
        <div className="learn-quiz-progress" aria-hidden="true">
          <span style={{ width: `${(progress / totalSteps) * 100}%` }} />
        </div>
      )}

      {phase === 'questions' && (
        <section>
          <p className="learn-eyebrow">{def.title} · Question {step + 1} of {questions.length}</p>
          <h1 className="learn-quiz-prompt">{q.prompt}</h1>
          {q.help && <p className="learn-quiz-help">{q.help}</p>}
          <div className="learn-quiz-options">
            {q.options.map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() => choose(o.value)}
                className={`learn-quiz-option${answers[q.id] === o.value ? ' is-selected' : ''}`}
              >
                {o.label}
              </button>
            ))}
          </div>
          {step > 0 && <button type="button" onClick={back} className="learn-quiz-back">← Back</button>}
        </section>
      )}

      {phase === 'email' && (
        <section>
          <p className="learn-eyebrow">{def.title} · Last step</p>
          <h1 className="learn-quiz-prompt">Where should we send your result?</h1>
          <p className="learn-quiz-help">Enter your email and we will show your result. No spam — just your answer and a way to follow up if you want to.</p>
          <form onSubmit={submit} className="learn-quiz-form">
            <label className="learn-quiz-field">
              <span>First name <span className="learn-quiz-optional">optional</span></span>
              <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First name" />
            </label>
            <label className="learn-quiz-field">
              <span>Email</span>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
            </label>
            {error && <p className="learn-quiz-error">{error}</p>}
            <div className="learn-quiz-actions">
              <button type="button" onClick={back} className="cw-btn-ghost">← Back</button>
              <button type="submit" className="cw-btn-primary" disabled={submitting}>{submitting ? 'Saving…' : 'See my result'}</button>
            </div>
            <p className="learn-quiz-disclaimer">This quiz is educational and is not legal advice. Your answers help us point you to the right next step.</p>
          </form>
        </section>
      )}

      {phase === 'done' && (
        <section className="learn-quiz-result">
          <p className="learn-eyebrow">Your result</p>
          {showGraded && result ? (
            <>
              <h1 className="learn-h1-article">{result.headline}</h1>
              <p className="learn-lede">{result.explanation}</p>
            </>
          ) : (
            <>
              <h1 className="learn-h1-article">Thanks — let&apos;s talk it through.</h1>
              <p className="learn-lede">
                We have your answers. The best next step is a quick consultation, where one of our attorneys can tell you
                exactly what fits your family — in plain language, with flat-rate pricing.
              </p>
            </>
          )}
          <div className="learn-quiz-result-cta">
            <Link href="/get-started" className="cw-btn-primary">Book a consultation →</Link>
            {showGraded && result?.recommendedPillar
              ? <Link href={pillarHref} className="cw-btn-ghost">Read the guide</Link>
              : <Link href="/learn" className="cw-btn-ghost">Browse the guides</Link>}
          </div>
        </section>
      )}
    </div>
  )
}
