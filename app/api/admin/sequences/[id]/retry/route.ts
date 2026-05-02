export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { auditEvent } from '@/lib/audit'
import { requireRole } from '@/src/lib/auth/requireRole'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireRole(req, 'ADMIN')
  if (admin instanceof NextResponse) return admin

  try {
    const { nurtureMessageId } = await req.json()
    const { id } = await params

    // In this codebase, a "nurture message" maps 1:1 to a Sequence row.
    const msg = await prisma.sequence.findUnique({ where: { id: nurtureMessageId || id } })
    if (!msg) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (msg.status !== 'FAILED') {
      return NextResponse.json({ error: 'Retry allowed only for FAILED messages' }, { status: 400 })
    }

    const updated = await prisma.sequence.update({
      where: { id: msg.id },
      data: {
        status: 'PENDING',
        attempts: 0,
        lastError: null,
        lockedAt: null,
        scheduledAt: new Date(),
      },
    })

    await auditEvent({
      type: 'MESSAGE_RETRY',
      leadId: msg.leadId,
      actor: admin.email,
      meta: { nurtureMessageId: msg.id, adminEmail: admin.email },
    })

    return NextResponse.json({ message: updated })
  } catch (err) {
    console.error('[ADMIN_MESSAGE_RETRY_ERROR]', err)
    return NextResponse.json({ error: 'Failed to retry message' }, { status: 500 })
  }
}

