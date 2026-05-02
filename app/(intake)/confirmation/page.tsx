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
            <span className="font-display text-xl text-cw-gold tracking-widest">CRAIN & WOOLEY</span>
          </div>
        </header>

        <div className="flex-1 flex items-center justify-center py-16">
          <div className="cw-container">
            <div className="w-full max-w-md mx-auto cw-panel p-10 text-center space-y-6">
              <div className="w-12 h-12 border border-cw-border flex items-center justify-center mx-auto text-cw-muted text-xl">
                X
              </div>
              <h1 className="font-display text-4xl text-cw-white">We Cannot Help At This Time</h1>
              <p className="text-cw-muted text-sm leading-relaxed">
                Based on your submission, this matter may not align with our current practice areas or availability.
                {reason && ` ${reason}`}
              </p>
              <p className="text-cw-muted text-sm">
                We encourage you to reach out to the State Bar referral service for assistance finding the right attorney.
              </p>
              <Link href="/" className="cw-btn-ghost inline-block">
                &larr; Return Home
              </Link>
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
          <span className="font-display text-xl text-cw-gold tracking-widest">CRAIN & WOOLEY</span>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center py-16">
        <div className="cw-container">
          <div className="w-full max-w-md mx-auto cw-panel-gold p-10 text-center space-y-6">
            <div className="w-12 h-12 border border-cw-gold flex items-center justify-center mx-auto text-cw-gold text-2xl">
              ✓
            </div>
            <h1 className="font-display text-5xl text-cw-white">You&apos;re Confirmed</h1>
            <p className="text-cw-muted text-sm leading-relaxed">
              Payment received. Your consultation slot is ready to be reserved.
            </p>
            <Link
              href={`/schedule?session_id=${params.get('session_id')}&leadId=${params.get('leadId')}`}
              className="cw-btn-primary inline-block w-full py-4 text-lg"
            >
              Schedule Your Consultation -&gt;
            </Link>
            <div className="text-left space-y-3 border-t border-cw-border pt-6">
              {[
                'Select a time that works for you',
                'Receive case prep instructions before your consult',
                'Check your email for a calendar invite',
              ].map((item, i) => (
                <div key={i} className="flex gap-3 text-sm">
                  <span className="font-mono text-cw-gold">{String(i + 1).padStart(2, '0')}</span>
                  <span className="text-cw-muted">{item}</span>
                </div>
              ))}
            </div>
            <p className="font-mono text-xs text-cw-muted border-t border-cw-border pt-4">
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
