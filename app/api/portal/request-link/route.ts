export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { auditEvent } from '@/lib/audit'
import { sendPortalAccessEmail } from '@/lib/portal/notify'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const leadId = String(body.leadId ?? '').trim()
    const email = String(body.email ?? '').trim().toLowerCase()

    if (!leadId || !EMAIL_RE.test(email)) {
      return NextResponse.json({ ok: false, error: 'Please provide a lead ID and valid email.' }, { status: 422 })
    }

    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      select: { id: true, firstName: true, lastName: true, email: true, status: true },
    })

    if (!lead || lead.email.toLowerCase() !== email) {
      return NextResponse.json({
        ok: true,
        message: 'If the details match our records, a secure portal link will be sent shortly.',
      })
    }

    const sent = await sendPortalAccessEmail(lead.id, 'user-request')

    await auditEvent({
      type: 'PORTAL_LINK_REQUESTED',
      leadId: lead.id,
      meta: { email: lead.email },
    })

    return NextResponse.json({ ok: true, message: 'Secure portal link sent.', portalUrl: sent?.portalUrl })
  } catch (error) {
    console.error('[PORTAL_LINK_ERROR]', error)
    return NextResponse.json({ ok: false, error: 'Unable to send the portal link right now.' }, { status: 500 })
  }
}
