import { prisma } from '@/lib/db/prisma'
import { auditEvent } from '@/lib/audit'

// NOTE: All server logic (token verification, opt-out write, audit log) below
// is UNCHANGED. Only presentation has been restyled to match the new brand.

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
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 16px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '448px',
          padding: '40px 32px',
          borderRadius: '12px',
          border: '1px solid rgba(26,34,48,0.14)',
          borderTop: '3px solid #9A825E',
          backgroundColor: '#FFFFFF',
          boxShadow: '0 1px 3px rgba(46,65,79,0.06), 0 12px 32px rgba(46,65,79,0.06)',
        }}
      >
        <div className="mb-6">
          <span role="img" aria-label="Crain & Wooley" className="cw-emblem" />
        </div>

        {!token || (!done && !already) ? (
          <>
            <div
              className="text-xs uppercase tracking-widest mb-3 font-semibold"
              style={{ color: '#a23a2a' }}
            >
              Invalid Link
            </div>
            <p className="text-sm leading-relaxed" style={{ color: '#6b6356' }}>
              This unsubscribe link is invalid or has expired.
            </p>
          </>
        ) : already ? (
          <>
            <div
              className="text-xs uppercase tracking-widest mb-3 font-semibold"
              style={{ color: '#2E414F' }}
            >
              Already Unsubscribed
            </div>
            <p className="text-sm leading-relaxed" style={{ color: '#6b6356' }}>
              You are already unsubscribed from messages from Crain &amp; Wooley.
            </p>
          </>
        ) : (
          <>
            <div
              className="text-xs uppercase tracking-widest mb-3 font-semibold"
              style={{ color: '#3A7D5A' }}
            >
              Unsubscribed
            </div>
            <p className="text-sm leading-relaxed" style={{ color: '#6b6356' }}>
              You have been removed from all future messages from Crain &amp; Wooley.
            </p>
            <p className="text-xs mt-4" style={{ color: '#6b6356' }}>
              Reply START to any SMS to re-subscribe, or contact us directly.
            </p>
          </>
        )}
      </div>
    </main>
  )
}
