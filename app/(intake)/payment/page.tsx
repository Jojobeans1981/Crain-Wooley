'use client'
import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { useState, Suspense } from 'react'
import Link from 'next/link'

// NOTE: All logic, payment flow, and Stripe handling below is UNCHANGED.
// Only presentation has been restyled to match the new brand.

function PaymentContent() {
  const router = useRouter()
  const params = useSearchParams()
  const leadId = params.get('leadId')
  const cancelled = params.get('cancelled')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const DEMO = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'

  const handlePayment = async () => {
    if (!leadId) return
    setLoading(true)
    setError('')
    try {
      if (DEMO) {
        await new Promise(r => setTimeout(r, 900))
        router.push(`/confirmation?session_id=demo&leadId=${leadId}`)
        return
      }
      const res = await fetch('/api/stripe/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else throw new Error(data.error)
    } catch {
      setError('Payment session failed. Please try again or call us directly.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="cw-page"><div className="cw-shell">
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

      <div className="flex-1 flex items-center justify-center py-10 sm:py-16">
        <div className="cw-container">
          <div className="w-full max-w-lg mx-auto">
            {cancelled && (
              <div className="border border-cw-danger/40 bg-cw-danger/[0.06] rounded p-4 mb-6 text-sm text-cw-danger">
                <span className="font-semibold">⚠ Payment not completed.</span> Your consultation slot has not been reserved.
              </div>
            )}

            <div className="cw-panel-gold p-8 sm:p-10 space-y-7">
              <div>
                <p className="cw-eyebrow mb-3">Step 2 of 3</p>
                <h1 className="font-display text-3xl sm:text-4xl text-cw-navy font-semibold leading-[1.15]">
                  Secure Your Consultation
                </h1>
                <div className="w-12 h-[2px] bg-cw-gold mt-4 mb-4" aria-hidden="true" />
                <p className="text-cw-ink-soft text-base mt-3 leading-relaxed">
                  Your inquiry has been reviewed. To confirm your consultation with our
                  attorneys, a <span className="font-semibold text-cw-navy">$300 retainer</span> is required upfront.
                </p>
              </div>

              <hr className="cw-divider" />

              <div className="space-y-3">
                {[
                  ['Consultation Fee', '$300.00'],
                  ['Duration', '60 minutes'],
                  ['Format', 'Phone or In-Person'],
                  ['Attorney', 'Assigned upon booking'],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between items-baseline text-sm">
                    <span className="text-cw-ink-soft">{label}</span>
                    <span className="text-cw-navy font-semibold">{value}</span>
                  </div>
                ))}
              </div>

              <hr className="cw-divider" />

              <div className="space-y-3">
                {[
                  'Payment secured via Stripe — 256-bit encryption',
                  'Scheduling link sent within 60 seconds of payment',
                  'Refundable if we are unable to assist with your matter',
                ].map((line) => (
                  <div key={line} className="flex items-start gap-3">
                    <span className="text-cw-gold mt-0.5 font-bold">✓</span>
                    <span className="text-cw-ink-soft text-sm leading-relaxed">{line}</span>
                  </div>
                ))}
              </div>

              {error && (
                <p className="text-sm text-cw-danger bg-cw-danger/[0.06] border border-cw-danger/30 rounded px-4 py-3">
                  {error}
                </p>
              )}

              <button className="cw-btn-primary w-full !py-4" onClick={handlePayment} disabled={loading || !leadId}>
                {loading ? 'Redirecting to Stripe…' : 'Pay $300 & Book Consultation'}
              </button>

              <p className="text-xs text-cw-ink-mute text-center">
                You will be redirected to Stripe&apos;s secure checkout.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div></main>
  )
}

export default function PaymentPage() {
  return (
    <Suspense>
      <PaymentContent />
    </Suspense>
  )
}
