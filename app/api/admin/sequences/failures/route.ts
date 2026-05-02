export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { requireRole } from '@/src/lib/auth/requireRole'

export async function GET(req: NextRequest) {
  const auth = await requireRole(req, 'VIEWER')
  if (auth instanceof NextResponse) return auth

  try {
    const failures = await prisma.sequence.findMany({
      where: { status: 'FAILED' },
      include: {
        lead: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
      take: 500,
    })

    return NextResponse.json({ failures })
  } catch (err) {
    console.error('[ADMIN_FAILURES_ERROR]', err)
    return NextResponse.json({ error: 'Failed to fetch failures' }, { status: 500 })
  }
}

