export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth/requireRole'
import { prisma } from '@/lib/db/prisma'

export async function GET(req: NextRequest) {
  const auth = await requireRole(req, 'VIEWER')
  if (auth instanceof NextResponse) return auth

  try {
    const token = await prisma.clioToken.findUnique({ where: { id: 'singleton' } })

    if (!token) {
      return NextResponse.json({ connected: false })
    }

    const expiresAt = token.expiresAt.toISOString()
    const expired = token.expiresAt < new Date()

    return NextResponse.json({ connected: true, expiresAt, expired })
  } catch {
    return NextResponse.json({ connected: false })
  }
}
