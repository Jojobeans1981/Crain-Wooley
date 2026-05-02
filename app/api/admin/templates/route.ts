export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { requireRole } from '@/src/lib/auth/requireRole'
import { GHOST_SEQUENCE } from '@/lib/ghost/sequences'

export async function GET(req: NextRequest) {
  const auth = await requireRole(req, 'VIEWER')
  if (auth instanceof NextResponse) return auth

  try {
    const existing = await prisma.nurtureTemplate.count()
    if (existing === 0) {
      // Seed defaults (no audit; this is initialization, not a user mutation).
      await prisma.nurtureTemplate.createMany({
        data: GHOST_SEQUENCE.map((s) => ({
          day: s.step,
          channel: s.channel,
          subject: s.subject ?? null,
          body: s.template,
          active: true,
        })),
      })
    }

    const templates = await prisma.nurtureTemplate.findMany({
      orderBy: [{ day: 'asc' }, { channel: 'asc' }],
    })
    return NextResponse.json({ templates })
  } catch (err) {
    console.error('[ADMIN_TEMPLATES_ERROR]', err)
    return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 })
  }
}

