'use client'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'

function ConfirmationContent() {
  const params = useSearchParams()
  const disqualified = params.get('disqualified') === 'true'
  const reason = params.get('reason')

  if (disqualified) {
    return (
      <main className="cw-page flex flex-col">
        <header className="cw-header">
          <div className="cw-container py-5">
            <span className="font-display text-3xl font-bold text-cw-white tracking-widest">CRAIN <span className="text-cw-gold">&amp;</span> WOOLEY</span>
          </div>
        </header>

        <div className="flex-1 flex items-center justify-center py-16">
          <div className="cw-container">
            <div className="w-full max-w-md mx-auto cw-panel p-10 space-y-6">
              <div className="w-10 h-10 border border-cw-border flex items-center justify-center">
                <span className="font-mono text-sm text-cw-muted">✕</span>
              </div>
              <div>
                <div className="font-mono text-[10px] text-red-400 tracking-[0.2em] uppercase mb-3">Unable to Proceed</div>
                <h1 className="font-display text-4xl text-cw-white">We Cannot Help At This Time</h1>
              </div>
              <p className="text-cw-muted text-sm leading-relaxed">
                Based on your submission, this matter may not align with our current practice areas or availability.
                {reason && ` ${reason}`}
              </p>
              <p className="text-cw-muted text-sm leading-relaxed border-t border-cw-border pt-5">
                We encourage you to reach out to the State Bar referral service for assistance finding the right attorney.
              </p>
              <Link href="/" className="cw-btn-ghost inline-block">← Return Home</Link>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="cw-page flex flex-col">
      <header className="cw-header">
        <div className="cw-container py-5">
          <span className="font-display text-3xl font-bold text-cw-white tracking-widest">CRAIN <span className="text-cw-gold">&amp;</span> WOOLEY</span>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center py-16">
        <div className="cw-container">
          <div className="w-full max-w-md mx-auto space-y-3">
            <div className="cw-panel-gold p-10 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 border border-cw-gold flex items-center justify-center">
                  <span className="font-mono text-sm text-cw-gold">✓</span>
                </div>
                <div className="font-mono text-[10px] text-cw-gold tracking-[0.2em] uppercase">Payment Confirmed</div>
              </div>
              <div>
                <h1 className="font-display text-5xl text-cw-white">You&apos;re Confirmed.</h1>
                <p className="text-cw-muted text-sm leading-relaxed mt-3">
                  Your consultation slot is ready to be reserved. Select a time that works for you.
                </p>
              </div>
              <Link
                href={`/schedule?session_id=${params.get('session_id')}&leadId=${params.get('leadId')}`}
                className="cw-btn-primary inline-flex items-center gap-3 w-full justify-center py-4 group"
              >
                Schedule Your Consultation
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </Link>
            </div>

            <div className="cw-panel p-6 divide-y divide-cw-border">
              {[
                'Select a time that works for your schedule',
                'Receive case prep instructions before your consult',
                'Check your email for a calendar invite',
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4 py-4 first:pt-0 last:pb-0">
                  <span className="font-mono text-[10px] text-cw-gold shrink-0 mt-0.5">{String(i + 1).padStart(2, '0')}</span>
                  <span className="text-cw-muted text-sm leading-relaxed">{item}</span>
                </div>
              ))}
            </div>

            <p className="font-mono text-[10px] text-cw-muted text-center tracking-wider pt-1">
              Questions? Email intake@crainwooley.com
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}

export default function ConfirmationPage() {
  return (
    <Suspense>
      <ConfirmationContent />
    </Suspense>
  )
}
