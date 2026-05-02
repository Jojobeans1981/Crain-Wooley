export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { requireRole } from '@/src/lib/auth/requireRole'
import { auditEvent } from '@/lib/audit'

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
  const status = searchParams.get('status') ?? undefined
  const matterType = searchParams.get('matterType') ?? undefined
  const from = searchParams.get('from') ?? undefined
  const to = searchParams.get('to') ?? undefined

  const where: Record<string, unknown> = {}
  if (status) where.status = status
  if (matterType) where.practiceArea = matterType
  if (from || to) {
    where.createdAt = {
      ...(from ? { gte: new Date(from) } : {}),
      ...(to ? { lte: new Date(to) } : {}),
    }
  }

  const leads = await prisma.lead.findMany({
    where,
    orderBy: { createdAt: 'asc' },
  })

  const header = csvRow([
    'id', 'firstName', 'lastName', 'email', 'phone',
    'matterType', 'caseType', 'status', 'qualified', 'optedOut',
    'createdAt', 'paidAt', 'consultAt', 'hiredAt',
    'stripeSessionId', 'clioMatterId',
  ])

  const rows = leads.map((l) =>
    csvRow([
      l.id,
      l.firstName,
      l.lastName,
      l.email,
      l.phone,
      l.practiceArea,
      l.caseType,
      l.status,
      l.qualified,
      l.optedOut,
      l.createdAt.toISOString(),
      l.paidAt?.toISOString() ?? '',
      l.consultAt?.toISOString() ?? '',
      l.hiredAt?.toISOString() ?? '',
      l.stripeSessionId ?? '',
      l.clioMatterId ?? '',
    ])
  )

  await auditEvent({
    type: 'LEADS_EXPORTED',
    actor: auth.email,
    meta: { filters: { status, matterType, from, to }, count: leads.length, adminEmail: auth.email },
  })

  const date = new Date().toISOString().slice(0, 10)
  const csv = [header, ...rows].join('\n')

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="leads-export-${date}.csv"`,
    },
  })
}
