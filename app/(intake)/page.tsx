'use client'
import Link from 'next/link'

export default function IntakeLanding() {
  return (
    <main className="cw-page flex flex-col">
      <header className="cw-header">
        <div className="cw-container py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="leading-tight">
            <span className="font-display text-2xl text-cw-gold tracking-widest">CRAIN & WOOLEY</span>
            <span className="font-mono text-xs text-cw-muted sm:ml-4 tracking-widest uppercase block sm:inline">
              Legal Counsel
            </span>
          </div>
          <span className="font-mono text-xs text-cw-muted tracking-widest uppercase border border-cw-border px-3 py-1">
            Confidential
          </span>
        </div>
      </header>

      <section className="flex-1 flex items-center py-16 sm:py-20">
        <div className="cw-container">
          <div className="max-w-2xl mx-auto text-center">
            <div className="flex items-center justify-center gap-2 mb-8">
              <div className="w-2 h-2 bg-cw-gold animate-pulse" />
              <span className="font-mono text-xs text-cw-muted tracking-widest uppercase">
                Intake System Active - Consultations Available
              </span>
            </div>

            <h1 className="font-display text-5xl sm:text-6xl md:text-8xl text-cw-white leading-none">
              YOUR CASE
              <br />
              <span className="text-cw-gold">STARTS HERE</span>
            </h1>

            <p className="text-cw-muted max-w-lg mx-auto text-base leading-relaxed mt-6">
              Answer a few questions. If we can help, you&apos;ll lock in your consultation in under 5 minutes. No phone tag. No waiting.
            </p>

            <div className="mt-10 flex items-center justify-center">
              <Link href="/qualify" className="cw-btn-primary inline-block w-full sm:w-auto">
                Begin Qualification -&gt;
              </Link>
            </div>

            <p className="font-mono text-xs text-cw-muted mt-6 tracking-wider">
              $300 consultation fee · Secured via Stripe · Refundable if we cannot help
            </p>
          </div>
        </div>
      </section>

      <section className="border-t border-cw-border">
        <div className="cw-container py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Response Time', value: '< 60 sec' },
              { label: 'Consult Fee', value: '$300' },
              { label: 'Onboarding', value: '< 60 min' },
              { label: 'Data Security', value: 'Clio Secured' },
            ].map((item) => (
              <div key={item.label} className="cw-panel p-5 sm:p-6 text-center">
                <div className="font-display text-3xl text-cw-gold">{item.value}</div>
                <div className="font-mono text-xs text-cw-muted mt-1 uppercase tracking-widest">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
