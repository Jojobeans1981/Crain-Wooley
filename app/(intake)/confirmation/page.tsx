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
      <main className="cw-page"><div className="cw-shell">
        <header className="cw-header">
          <div className="cw-container py-5 flex items-center justify-between">
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

        <div className="flex-1 flex items-center justify-center py-16">
          <div className="cw-container">
            <div
              className="cw-panel"
              style={{ width: '100%', maxWidth: '32rem', margin: '0 auto', padding: '40px 36px' }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <p
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '0.72rem',
                    color: '#9B8059',
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    fontWeight: 600,
                    margin: 0,
                  }}
                >
                  Thank you for reaching out
                </p>
                <h1 className="font-display text-3xl sm:text-4xl text-cw-navy font-semibold leading-[1.15]">
                  Let&apos;s get you to the right help.
                </h1>
                <p className="text-cw-ink-soft text-base leading-relaxed">
                  Based on what you shared, this matter falls outside our current practice — estate planning, probate, and business law for individuals and families in the Dallas-Fort Worth area.
                  {reason && (
                    <>
                      {' '}<span className="text-cw-ink-mute">({reason})</span>
                    </>
                  )}
                </p>
                <div
                  style={{
                    padding: '20px 22px',
                    background: 'rgba(155,128,89,0.06)',
                    border: '1px solid #E5DAC1',
                    borderRadius: '8px',
                  }}
                >
                  <p className="text-cw-navy text-sm font-semibold mb-2">Find the right attorney</p>
                  <p className="text-cw-ink-soft text-sm leading-relaxed">
                    The{' '}
                    <a
                      href="https://www.texasbar.com/AM/Template.cfm?Section=Lawyer_Referral_Service"
                      target="_blank"
                      rel="noopener"
                      className="text-cw-gold hover:underline font-semibold"
                    >
                      State Bar of Texas Lawyer Referral Service
                    </a>{' '}
                    can connect you with an attorney in your area for an initial consultation (typically $20 for 30 minutes).
                  </p>
                </div>
                <p className="text-cw-ink-soft text-sm leading-relaxed">
                  If you think this is a mistake — or you have an estate-planning matter we should review — call us at{' '}
                  <a href="tel:9729451610" className="text-cw-navy font-semibold hover:text-cw-gold transition-colors">
                    (972) 945-1610
                  </a>
                  .
                </p>
                <div style={{ paddingTop: '4px' }}>
                  <Link href="/" className="cw-btn-ghost inline-block">Return Home</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div></main>
    )
  }

  return (
    <main className="cw-page"><div className="cw-shell">
      <header className="cw-header">
        <div className="cw-container py-5 flex items-center justify-between">
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

      <div className="flex-1 flex items-center justify-center py-16">
        <div className="cw-container">
          <div className="w-full max-w-md mx-auto space-y-4">
            <div className="cw-panel-gold p-8 sm:p-10 space-y-6">
              <div className="flex items-center gap-3">
                <div
                  aria-hidden="true"
                  style={{
                    width: '48px',
                    height: '48px',
                    border: '2px solid #9B8059',
                    borderRadius: '999px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    background: 'rgba(155,128,89,0.08)',
                  }}
                >
                  <span className="text-lg text-cw-gold font-bold">✓</span>
                </div>
                <div className="text-[11px] text-cw-gold tracking-[0.2em] uppercase font-semibold">Payment Confirmed</div>
              </div>
              <div>
                <h1 className="font-display text-3xl sm:text-4xl text-cw-navy font-semibold leading-[1.15]">
                  You&apos;re Confirmed.
                </h1>
                <div className="w-12 h-[2px] bg-cw-gold mt-4 mb-4" aria-hidden="true" />
                <p className="text-cw-ink-soft text-sm leading-relaxed mt-3">
                  Your consultation slot is ready to be reserved. Select a time that works for you.
                </p>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '4px' }}>
                <Link
                  href={`/schedule?session_id=${params.get('session_id')}&leadId=${params.get('leadId')}`}
                  className="cw-btn-primary"
                  style={{ fontSize: '1rem', padding: '14px 32px' }}
                >
                  Schedule Your Consultation
                </Link>
              </div>
            </div>

            <div className="cw-panel p-6 divide-y divide-cw-line">
              {[
                'Select a time that works for your schedule',
                'Receive case prep instructions before your consult',
                'Check your email for a calendar invite',
              ].map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '16px',
                    padding: '14px 0',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: '0.75rem',
                      color: '#9B8059',
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                      flexShrink: 0,
                      marginTop: '2px',
                      minWidth: '22px',
                    }}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
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
    </div></main>
  )
}

export default function ConfirmationPage() {
  return (
    <Suspense>
      <ConfirmationContent />
    </Suspense>
  )
}
