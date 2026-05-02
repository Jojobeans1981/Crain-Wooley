export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { auditEvent } from '@/lib/audit'
import { requireRole } from '@/src/lib/auth/requireRole'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireRole(req, 'ADMIN')
  if (auth instanceof NextResponse) return auth

  try {
    const { id } = await params
    const { status } = await req.json()

    const before = await prisma.lead.findUnique({ where: { id } })
    const lead = await prisma.lead.update({
      where: { id },
      data: { status },
    })

    await auditEvent({
      type: 'LEAD_STATUS_CHANGED',
      leadId: id,
      actor: auth.email,
      meta: { from: before?.status, to: status },
    })

    return NextResponse.json({ success: true, lead })
  } catch {
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }
}

