'use client'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import Link from 'next/link'

// NOTE: All logic, verification fetch, and routing below is UNCHANGED.
// Only presentation has been restyled to match the new brand.

function ScheduleContent() {
  const params = useSearchParams()
  const sessionId = params.get('session_id')
  const leadId = params.get('leadId')
  const [leadName, setLeadName] = useState('')
  const [verified, setVerified] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    async function verify() {
      if (sessionId && leadId) {
        try {
          const res = await fetch(`/api/leads/${leadId}`)
          const data = await res.json()
          if (data.lead) {
            setLeadName(data.lead.firstName)
            setVerified(true)
          }
        } catch {
          // ignore
        }
      }
      setChecking(false)
    }
    verify()
  }, [sessionId, leadId])

  if (checking) {
    return (
      <div className="cw-page flex items-center justify-center">
        <div className="text-sm text-cw-gold animate-pulse uppercase tracking-widest font-semibold">
          Verifying payment...
        </div>
      </div>
    )
  }

  if (!verified) {
    return (
      <main className="cw-page flex flex-col">
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
        <div className="flex-1 flex items-center justify-center py-16">
          <div className="cw-container">
            <div className="w-full max-w-md mx-auto cw-panel p-8 sm:p-10 text-center space-y-5">
              <div className="text-cw-danger text-4xl">⚠</div>
              <h2 className="font-display text-3xl text-cw-navy font-semibold">Access Restricted</h2>
              <p className="text-cw-ink-soft text-sm leading-relaxed">
                Scheduling is only available after the consultation fee is confirmed.
              </p>
              <Link href="/qualify" className="cw-btn-primary inline-block mt-4">
                Start Qualification
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
        <div className="cw-container py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <Link href="/" className="no-underline flex items-center gap-3" aria-label="Crain & Wooley — Home">
            <span role="img" aria-label="Crain & Wooley emblem" className="cw-emblem" />
            <span className="font-display text-2xl sm:text-3xl font-semibold text-cw-navy">
              Crain <span className="text-cw-gold">&amp;</span> Wooley
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-cw-success rounded-full animate-pulse inline-block" />
            <span className="text-xs text-cw-success uppercase tracking-widest font-semibold">Payment Confirmed</span>
          </div>
        </div>
      </header>

      <div className="flex-1 py-12">
        <div className="cw-container">
          <div className="w-full max-w-4xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="space-y-3">
                <p className="cw-eyebrow">Final Step — Select Your Consultation Time</p>
                <h1 className="font-display text-3xl sm:text-4xl text-cw-navy font-semibold leading-[1.15]">
                  Welcome, <span className="text-cw-gold italic">{leadName}</span>
                </h1>
                <div className="w-12 h-[2px] bg-cw-gold" aria-hidden="true" />
                <p className="text-cw-ink-soft text-base max-w-xl leading-relaxed">
                  Choose a time for your 60-minute consultation. You&apos;ll receive a calendar
                  invite immediately after booking.
                </p>
              </div>
              <div className="cw-panel py-3 px-5 shrink-0">
                <div className="text-[10px] text-cw-ink-mute uppercase tracking-widest font-semibold">Consultation Retainer</div>
                <div className="text-cw-gold font-display text-2xl font-semibold mt-1">$300.00 Paid</div>
              </div>
            </div>

            <div className="cw-panel-gold overflow-hidden min-h-[520px] relative">
              <div className="p-10 text-center space-y-5 min-h-[520px] flex flex-col items-center justify-center">
                <div className="border-2 border-cw-gold rounded w-16 h-16 flex items-center justify-center text-cw-gold text-xs font-semibold tracking-wider">
                  CAL
                </div>
                <p className="text-xs text-cw-ink-mute uppercase tracking-widest font-semibold">Scheduling Widget</p>
                <p className="text-cw-ink-soft text-sm max-w-sm leading-relaxed">
                  The Cal.com embed loads here. It is configured to pass your lead details securely.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-lg mt-8">
                  <div className="p-4 border border-cw-line bg-white rounded text-left">
                    <div className="text-[10px] text-cw-ink-mute uppercase mb-1 tracking-wider font-semibold">Pass-through</div>
                    <div className="text-xs text-cw-navy">leadId: {leadId}</div>
                    <div className="text-xs text-cw-navy">name: {leadName}</div>
                  </div>
                  <div className="p-4 border border-cw-line bg-white rounded text-left">
                    <div className="text-[10px] text-cw-ink-mute uppercase mb-1 tracking-wider font-semibold">Event Type</div>
                    <div className="text-xs text-cw-navy">60-Min Consultation</div>
                    <div className="text-xs text-cw-navy">Price: $0 (pre-paid)</div>
                  </div>
                </div>

                <div className="mt-6 text-[10px] text-cw-ink-mute uppercase tracking-widest font-semibold">
                  Ready to sync with Clio and calendar
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-center">
              {[
                { label: 'Duration', val: '60 Minutes', sub: 'Deep-dive strategy' },
                { label: 'Location', val: 'Phone / Zoom', sub: 'Secure and confidential' },
                { label: 'Next Steps', val: 'Onboarding', sub: '< 60 min after consult' },
              ].map((item) => (
                <div key={item.label} className="cw-panel p-6">
                  <div className="text-xs text-cw-ink-mute uppercase tracking-widest font-semibold">{item.label}</div>
                  <div className="text-cw-navy text-xl mt-2 font-display font-semibold">{item.val}</div>
                  <div className="text-cw-ink-mute text-[11px] uppercase tracking-wider mt-1">{item.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default function SchedulePage() {
  return (
    <Suspense>
      <ScheduleContent />
    </Suspense>
  )
}
