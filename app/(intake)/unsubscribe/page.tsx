import { prisma } from '@/lib/db/prisma'
import { auditEvent } from '@/lib/audit'

export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const { token } = await searchParams

  let done = false
  let already = false

  if (token) {
    try {
      const lead = await prisma.lead.findUnique({
        where: { id: token },
        select: { id: true, optedOut: true },
      })

      if (lead) {
        if (lead.optedOut) {
          already = true
        } else {
          await prisma.lead.update({
            where: { id: lead.id },
            data: { optedOut: true, optedOutAt: new Date() },
          })
          await prisma.sequence.updateMany({
            where: { leadId: lead.id, status: 'PENDING' },
            data: { status: 'SKIPPED' },
          })
          await auditEvent({
            type: 'OPTED_OUT',
            leadId: lead.id,
            meta: { source: 'email_link' },
          })
        }
        done = true
      }
    } catch {
      //
    }
  }

  return (
    <main
      className="min-h-screen flex items-center justify-center"
      style={{
        backgroundColor: '#0B0D11',
        backgroundImage:
          'repeating-linear-gradient(0deg, transparent, transparent 39px, #1A1D24 39px, #1A1D24 40px), repeating-linear-gradient(90deg, transparent, transparent 39px, #1A1D24 39px, #1A1D24 40px)',
      }}
    >
      <div
        className="border p-12 max-w-md w-full mx-4"
        style={{ borderColor: '#2A2D35', backgroundColor: '#111318' }}
      >
        <div
          className="font-display text-2xl mb-6 tracking-widest"
          style={{ color: '#C5933A' }}
        >
          CRAIN & WOOLEY
        </div>

        {!token || (!done && !already) ? (
          <>
            <div className="font-mono text-xs uppercase tracking-widest mb-3" style={{ color: '#D95D39' }}>
              Invalid Link
            </div>
            <p className="text-sm" style={{ color: '#6B7B8E' }}>
              This unsubscribe link is invalid or has expired.
            </p>
          </>
        ) : already ? (
          <>
            <div className="font-mono text-xs uppercase tracking-widest mb-3" style={{ color: '#E8E2D6' }}>
              Already Unsubscribed
            </div>
            <p className="text-sm" style={{ color: '#6B7B8E' }}>
              You are already unsubscribed from messages from Crain & Wooley.
            </p>
          </>
        ) : (
          <>
            <div className="font-mono text-xs uppercase tracking-widest mb-3" style={{ color: '#3A7D5A' }}>
              Unsubscribed
            </div>
            <p className="text-sm leading-relaxed" style={{ color: '#6B7B8E' }}>
              You have been removed from all future messages from Crain & Wooley.
            </p>
            <p className="font-mono text-xs mt-4" style={{ color: '#6B7B8E' }}>
              Reply START to any SMS to re-subscribe, or contact us directly.
            </p>
          </>
        )}
      </div>
    </main>
  )
}
