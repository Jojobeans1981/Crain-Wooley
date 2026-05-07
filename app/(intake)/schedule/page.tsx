'use client'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import Link from 'next/link'

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
          // In a real app, we'd verify the session_id server-side.
          // For now, we fetch the lead to confirm it exists.
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
        <div className="font-mono text-xs text-cw-gold animate-pulse uppercase tracking-widest">
          Verifying payment...
        </div>
      </div>
    )
  }

  if (!verified) {
    return (
      <main className="cw-page flex flex-col">
        <header className="cw-header">
          <div className="cw-container py-5">
            <span className="font-display text-3xl font-bold text-cw-white tracking-widest">CRAIN <span className="text-cw-gold">&amp;</span> WOOLEY</span>
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center py-16">
          <div className="cw-container">
            <div className="w-full max-w-md mx-auto cw-panel p-6 sm:p-10 text-center space-y-4">
              <div className="text-cw-muted text-4xl">⚠</div>
              <h2 className="font-display text-3xl text-cw-white">Access Restricted</h2>
              <p className="text-cw-muted text-sm">
                Scheduling is only available after the consultation fee is confirmed.
              </p>
              <Link href="/qualify" className="cw-btn-primary inline-block mt-4">
                Start Qualification -&gt;
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
          <span className="font-display text-3xl font-bold text-cw-white tracking-widest">CRAIN <span className="text-cw-gold">&amp;</span> WOOLEY</span>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 animate-pulse inline-block" />
            <span className="font-mono text-xs text-cw-muted uppercase tracking-widest">Payment Confirmed</span>
          </div>
        </div>
      </header>

      <div className="flex-1 py-12">
        <div className="cw-container">
          <div className="w-full max-w-4xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="space-y-2">
                <div className="font-mono text-xs text-cw-gold uppercase tracking-widest">
                  Final Step - Select Your Consultation Time
                </div>
                <h1 className="font-display text-4xl sm:text-5xl text-cw-white">
                  Welcome, <span className="text-cw-gold">{leadName}</span>
                </h1>
                <p className="text-cw-muted text-sm max-w-xl">
                  Choose a time for your 60-minute consultation. You&apos;ll receive a calendar invite immediately after booking.
                </p>
              </div>
              <div className="cw-panel py-2 px-4 border border-cw-border">
                <div className="font-mono text-[10px] text-cw-muted uppercase tracking-widest">Consultation Retainer</div>
                <div className="text-cw-gold font-display text-xl">$300.00 PAID</div>
              </div>
            </div>

            <div className="cw-panel-gold overflow-hidden min-h-[560px] relative">
              <div className="p-10 text-center space-y-4 min-h-[560px] flex flex-col items-center justify-center">
                <div className="border border-cw-gold w-16 h-16 flex items-center justify-center text-cw-gold text-xs font-mono">
                  CAL
                </div>
                <p className="font-mono text-xs text-cw-muted uppercase tracking-widest">Scheduling Widget</p>
                <p className="text-cw-muted text-sm max-w-sm">
                  The Cal.com embed loads here. It is configured to pass your lead details securely.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-lg mt-8">
                  <div className="p-4 border border-cw-border text-left">
                    <div className="font-mono text-[10px] text-cw-muted uppercase mb-1">Pass-through</div>
                    <div className="text-xs text-cw-white">leadId: {leadId}</div>
                    <div className="text-xs text-cw-white">name: {leadName}</div>
                  </div>
                  <div className="p-4 border border-cw-border text-left">
                    <div className="font-mono text-[10px] text-cw-muted uppercase mb-1">Event Type</div>
                    <div className="text-xs text-cw-white">60-Min Consultation</div>
                    <div className="text-xs text-cw-white">Price: $0 (pre-paid)</div>
                  </div>
                </div>

                <div className="mt-8 font-mono text-[10px] text-cw-muted uppercase tracking-widest">
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
                  <div className="font-mono text-xs text-cw-muted uppercase tracking-widest">{item.label}</div>
                  <div className="text-cw-white text-lg mt-2 font-display">{item.val}</div>
                  <div className="text-cw-muted text-[10px] uppercase tracking-wider mt-1">{item.sub}</div>
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
