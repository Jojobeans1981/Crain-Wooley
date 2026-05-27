'use client'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'

// NOTE: All logic and routing below is UNCHANGED.
// Only presentation has been restyled to match the new brand.

function ConfirmationContent() {
  const params = useSearchParams()
  const disqualified = params.get('disqualified') === 'true'
  const reason = params.get('reason')

  if (disqualified) {
    return (
      <main className="cw-page flex flex-col">
        <header className="cw-header">
          <div className="cw-container py-5 flex items-center justify-between">
            <Link href="/" className="no-underline">
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

        <div className="flex-1 flex items-center justify-center py-16">
          <div className="cw-container">
            <div className="w-full max-w-md mx-auto cw-panel p-8 sm:p-10 space-y-6">
              <div className="w-12 h-12 border-2 border-cw-line rounded-full flex items-center justify-center">
                <span className="text-lg text-cw-ink-mute">✕</span>
              </div>
              <div>
                <p className="text-[11px] text-cw-danger tracking-[0.2em] uppercase mb-3 font-semibold">Unable to Proceed</p>
                <h1 className="font-display text-3xl sm:text-4xl text-cw-navy font-semibold leading-tight">We Cannot Help At This Time</h1>
              </div>
              <p className="text-cw-ink-soft text-sm leading-relaxed">
                Based on your submission, this matter may not align with our current practice areas or availability.
                {reason && ` ${reason}`}
              </p>
              <p className="text-cw-ink-soft text-sm leading-relaxed border-t border-cw-line pt-5">
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
        <div className="cw-container py-5 flex items-center justify-between">
          <Link href="/" className="no-underline">
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

      <div className="flex-1 flex items-center justify-center py-16">
        <div className="cw-container">
          <div className="w-full max-w-md mx-auto space-y-4">
            <div className="cw-panel-gold p-8 sm:p-10 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 border-2 border-cw-gold rounded-full flex items-center justify-center bg-cw-gold/[0.08]">
                  <span className="text-lg text-cw-gold font-bold">✓</span>
                </div>
                <div className="text-[11px] text-cw-gold tracking-[0.2em] uppercase font-semibold">Payment Confirmed</div>
              </div>
              <div>
                <h1 className="font-display text-4xl sm:text-5xl text-cw-navy font-semibold leading-tight">
                  You&apos;re Confirmed.
                </h1>
                <div className="w-12 h-[2px] bg-cw-gold mt-4 mb-4" aria-hidden="true" />
                <p className="text-cw-ink-soft text-sm leading-relaxed mt-3">
                  Your consultation slot is ready to be reserved. Select a time that works for you.
                </p>
              </div>
              <Link
                href={`/schedule?session_id=${params.get('session_id')}&leadId=${params.get('leadId')}`}
                className="cw-btn-primary inline-flex items-center gap-3 w-full justify-center !py-4 group"
              >
                Schedule Your Consultation
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </Link>
            </div>

            <div className="cw-panel p-6 divide-y divide-cw-line">
              {[
                'Select a time that works for your schedule',
                'Receive case prep instructions before your consult',
                'Check your email for a calendar invite',
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4 py-4 first:pt-0 last:pb-0">
                  <span className="text-xs text-cw-gold shrink-0 mt-0.5 font-bold tracking-wider">{String(i + 1).padStart(2, '0')}</span>
                  <span className="text-cw-ink-soft text-sm leading-relaxed">{item}</span>
                </div>
              ))}
            </div>

            <p className="text-xs text-cw-ink-mute text-center tracking-wider pt-1">
              Questions? Email <a href="mailto:intake@crainwooley.com" className="text-cw-gold hover:underline">intake@crainwooley.com</a>
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
