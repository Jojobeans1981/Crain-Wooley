export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { requireRole } from '@/src/lib/auth/requireRole'

function escapeCsvCell(val: unknown): string {
  const str = val == null ? '' : String(val)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

function csvRow(cells: unknown[]): string {
  return cells.map(escapeCsvCell).join(',')
}

export async function GET(req: NextRequest) {
  const auth = await requireRole(req, 'ADMIN')
  if (auth instanceof NextResponse) return auth

  const { searchParams } = new URL(req.url)
  const leadId = searchParams.get('leadId') ?? undefined
  const from = searchParams.get('from') ?? undefined
  const to = searchParams.get('to') ?? undefined
  const type = searchParams.get('type') ?? undefined

  const where: Record<string, unknown> = {}
  if (leadId) where.leadId = leadId
  if (type) where.type = type
  if (from || to) {
    where.createdAt = {
      ...(from ? { gte: new Date(from) } : {}),
      ...(to ? { lte: new Date(to) } : {}),
    }
  }

  const events = await prisma.auditEvent.findMany({
    where,
    include: {
      lead: {
        select: { firstName: true, lastName: true, email: true },
      },
    },
    orderBy: { createdAt: 'asc' },
  })

  const header = csvRow(['id', 'timestamp', 'type', 'leadId', 'leadName', 'leadEmail', 'actor', 'metadata'])
  const rows = events.map((e) =>
    csvRow([
      e.id,
      e.createdAt.toISOString(),
      e.type,
      e.leadId ?? '',
      e.lead ? `${e.lead.firstName} ${e.lead.lastName}` : '',
      e.lead?.email ?? '',
      e.actor ?? '',
      e.meta != null ? JSON.stringify(e.meta) : '',
    ])
  )

  const date = new Date().toISOString().slice(0, 10)
  const csv = [header, ...rows].join('\n')

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="audit-export-${date}.csv"`,
    },
  })
}
