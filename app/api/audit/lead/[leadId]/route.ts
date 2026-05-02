export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ leadId: string }> }
) {
  try {
    const { leadId } = await params
    const { searchParams } = new URL(req.url)
    const limit = Math.max(1, Math.min(200, Number(searchParams.get('limit') || 100)))

    const events = await prisma.auditEvent.findMany({
      where: { leadId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    return NextResponse.json({ events })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch audit events' }, { status: 500 })
  }
}

