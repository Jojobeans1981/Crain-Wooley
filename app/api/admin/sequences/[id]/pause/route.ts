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
    const { id } = await params
    const seq = await prisma.sequence.findUnique({ where: { id } })
    if (!seq) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    await prisma.lead.update({ where: { id: seq.leadId }, data: { nurturePaused: true } })

    // Convert any queued messages to SKIPPED while paused.
    await prisma.sequence.updateMany({
      where: { leadId: seq.leadId, status: 'PENDING' },
      data: { status: 'SKIPPED', lockedAt: null },
    })

    await auditEvent({
      type: 'SEQUENCE_PAUSED',
      leadId: seq.leadId,
      actor: admin.email,
      meta: { leadId: seq.leadId, adminEmail: admin.email },
    })

    const updated = await prisma.sequence.findUnique({
      where: { id },
      include: { lead: true },
    })
    return NextResponse.json({ sequence: updated })
  } catch (err) {
    console.error('[ADMIN_SEQUENCE_PAUSE_ERROR]', err)
    return NextResponse.json({ error: 'Failed to pause sequence' }, { status: 500 })
  }
}

