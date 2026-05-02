'use client'
import { useSearchParams } from 'next/navigation'
import { useState, Suspense } from 'react'

function PaymentContent() {
  const params = useSearchParams()
  const leadId = params.get('leadId')
  const cancelled = params.get('cancelled')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handlePayment = async () => {
    if (!leadId) return
    setLoading(true)
    setError('')
    try {
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
    <main className="cw-page flex flex-col">
      <header className="cw-header">
        <div className="cw-container py-5">
          <span className="font-display text-xl text-cw-gold tracking-widest">CRAIN & WOOLEY</span>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center py-10 sm:py-16">
        <div className="cw-container">
          <div className="w-full max-w-md mx-auto">
            {cancelled && (
              <div className="border border-amber-700 bg-amber-900/20 p-4 mb-6 font-mono text-xs text-amber-400">
                ⚠ Payment was not completed. Your consultation slot has not been reserved.
              </div>
            )}

            <div className="cw-panel-gold p-6 sm:p-8 space-y-6">
              <div>
                <div className="font-mono text-xs text-cw-gold uppercase tracking-widest mb-2">Step 2 of 3</div>
                <h1 className="font-display text-4xl sm:text-5xl text-cw-white">Secure Your Slot</h1>
                <p className="text-cw-muted text-sm mt-2 leading-relaxed">
                  Your inquiry has been reviewed. To confirm your consultation with our attorneys, a $300 retainer is required upfront.
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
                  <div key={label} className="flex justify-between text-sm">
                    <span className="text-cw-muted">{label}</span>
                    <span className="font-mono text-cw-white">{value}</span>
                  </div>
                ))}
              </div>

              <hr className="cw-divider" />

              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <span className="text-cw-gold mt-0.5">✓</span>
                  <span className="text-cw-muted text-xs">Payment secured via Stripe - 256-bit encryption</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-cw-gold mt-0.5">✓</span>
                  <span className="text-cw-muted text-xs">Scheduling link sent within 60 seconds of payment</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-cw-gold mt-0.5">✓</span>
                  <span className="text-cw-muted text-xs">Refundable if we are unable to assist with your matter</span>
                </div>
              </div>

              {error && <p className="font-mono text-xs text-red-400 bg-red-900/20 border border-red-900 p-3">{error}</p>}

              <button className="cw-btn-primary w-full" onClick={handlePayment} disabled={loading || !leadId}>
                {loading ? 'Redirecting to Stripe...' : 'Pay $300 & Book Consultation ->'}
              </button>

              <p className="font-mono text-xs text-cw-muted text-center">
                You will be redirected to Stripe&apos;s secure checkout
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default function PaymentPage() {
  return (
    <Suspense>
      <PaymentContent />
    </Suspense>
  )
}
