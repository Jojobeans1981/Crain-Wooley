export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { auditEvent } from '@/lib/audit'
import { requireRole } from '@/src/lib/auth/requireRole'
import { GHOST_SEQUENCE } from '@/lib/ghost/sequences'

function delayHoursForStep(step: number) {
  return GHOST_SEQUENCE.find((s) => s.step === step)?.delayHours ?? 0
}

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

    const now = new Date()
    await prisma.lead.update({ where: { id: seq.leadId }, data: { nurturePaused: false } })

    // Re-queue any previously skipped messages, recalculating delay from "now".
    const skipped = await prisma.sequence.findMany({
      where: { leadId: seq.leadId, status: 'SKIPPED' },
      select: { id: true, step: true },
      orderBy: { step: 'asc' },
    })

    await Promise.all(
      skipped.map((m) =>
        prisma.sequence.update({
          where: { id: m.id },
          data: {
            status: 'PENDING',
            scheduledAt: new Date(now.getTime() + delayHoursForStep(m.step) * 60 * 60 * 1000),
            lastError: null,
            lockedAt: null,
          },
        })
      )
    )

    await auditEvent({
      type: 'SEQUENCE_RESUMED',
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
    console.error('[ADMIN_SEQUENCE_RESUME_ERROR]', err)
    return NextResponse.json({ error: 'Failed to resume sequence' }, { status: 500 })
  }
}

