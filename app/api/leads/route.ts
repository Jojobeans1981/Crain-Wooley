export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { auditEvent } from '@/lib/audit'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const skip = (page - 1) * limit

  const where = status ? { status: status as any } : {}

  const [leads, total] = await Promise.all([
    prisma.lead.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: { sequences: { select: { status: true, channel: true, step: true } } },
    }),
    prisma.lead.count({ where }),
  ])

  return NextResponse.json({ leads, total, page, limit })
}

export async function PATCH(req: NextRequest) {
  try {
    const { leadId, status } = await req.json()

    const before = await prisma.lead.findUnique({ where: { id: leadId } })
    const lead = await prisma.lead.update({
      where: { id: leadId },
      data: { status },
    })

    await auditEvent({
      type: 'LEAD_STATUS_CHANGED',
      leadId,
      meta: { from: before?.status, to: status },
    })

    return NextResponse.json({ success: true, lead })
  } catch (error) {
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }
}
