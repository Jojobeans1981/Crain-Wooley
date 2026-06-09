export const dynamic = 'force-dynamic'

import crypto from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { auditEvent } from '@/lib/audit'
import { verifyPortalToken } from '@/lib/portal/token'
import { appendPortalRequest } from '@/lib/portal/attachments'
import { sendEmail } from '@/lib/resend/email'
import type { Prisma } from '@prisma/client'

const KIND_LABELS = {
  DOCUMENT: 'document upload',
  SIGNATURE: 'signature packet',
} as const

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const leadId = String(body.leadId ?? '').trim()
    const token = String(body.token ?? '').trim()
    const kind = body.kind === 'SIGNATURE' ? 'SIGNATURE' : 'DOCUMENT'
    const note = String(body.note ?? '').trim()

    if (!leadId || !token) {
      return NextResponse.json({ error: 'Missing portal credentials.' }, { status: 422 })
    }

    const claims = verifyPortalToken(token)
    if (!claims || claims.leadId !== leadId) {
      return NextResponse.json({ error: 'This portal link is no longer valid.' }, { status: 401 })
    }

    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        status: true,
        practiceArea: true,
        description: true,
        attachments: true,
      },
    })

    if (!lead || lead.email.toLowerCase() !== claims.email) {
      return NextResponse.json({ error: 'This portal link is no longer valid.' }, { status: 401 })
    }

    const firmInbox = process.env.LEAD_NOTIFICATION_EMAIL || process.env.SEED_ADMIN_EMAIL
    if (!firmInbox) {
      return NextResponse.json({ error: 'No firm inbox is configured.' }, { status: 500 })
    }

    await sendEmail({
      to: firmInbox,
      subject: `[Portal] ${KIND_LABELS[kind]} requested for ${lead.firstName} ${lead.lastName}`,
      text: [
        `Client: ${lead.firstName} ${lead.lastName}`,
        `Email: ${lead.email}`,
        `Lead ID: ${lead.id}`,
        `Request type: ${KIND_LABELS[kind]}`,
        `Practice area: ${lead.practiceArea}`,
        `Status: ${lead.status}`,
        '',
        note ? `Note: ${note}` : 'Note: (none)',
        '',
        `Lead summary:`,
        lead.description,
      ].join('\n'),
      idempotencyKey: `portal-item:${lead.id}:${kind}:${Math.floor(Date.now() / 1000 / 3600)}`,
    })

    await prisma.lead.update({
      where: { id: lead.id },
      data: {
        attachments: appendPortalRequest(lead.attachments, {
          id: crypto.randomUUID(),
          kind,
          note,
          createdAt: new Date().toISOString(),
        }) as Prisma.InputJsonValue,
      },
    })

    await auditEvent({
      type: kind === 'SIGNATURE' ? 'PORTAL_SIGNATURE_REQUESTED' : 'PORTAL_ITEM_REQUESTED',
      leadId: lead.id,
      meta: { kind, note },
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[PORTAL_ITEM_ERROR]', error)
    return NextResponse.json({ error: 'Unable to process the request right now.' }, { status: 500 })
  }
}
