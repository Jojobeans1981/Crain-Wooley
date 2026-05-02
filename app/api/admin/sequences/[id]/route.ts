export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { requireRole } from '@/src/lib/auth/requireRole'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireRole(req, 'VIEWER')
  if (auth instanceof NextResponse) return auth

  try {
    const { id } = await params
    const seq = await prisma.sequence.findUnique({
      where: { id },
      include: {
        lead: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            practiceArea: true,
            caseType: true,
            status: true,
            paymentStatus: true,
            nurturePaused: true,
          },
        },
      },
    })

    if (!seq) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const messages = await prisma.sequence.findMany({
      where: { leadId: seq.leadId },
      orderBy: { step: 'asc' },
    })

    return NextResponse.json({ sequence: seq, messages })
  } catch (err) {
    console.error('[ADMIN_SEQUENCE_DETAIL_ERROR]', err)
    return NextResponse.json({ error: 'Failed to fetch sequence' }, { status: 500 })
  }
}

