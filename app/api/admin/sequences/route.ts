export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { requireRole } from '@/src/lib/auth/requireRole'

export async function GET(req: NextRequest) {
  const auth = await requireRole(req, 'VIEWER')
  if (auth instanceof NextResponse) return auth

  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const leadId = searchParams.get('leadId')
    const channel = searchParams.get('channel')
    const q = (searchParams.get('q') || '').trim()
    const page = Math.max(1, Number(searchParams.get('page') || 1))
    const limit = Math.max(1, Math.min(100, Number(searchParams.get('limit') || 25)))
    const skip = (page - 1) * limit

    const whereSeq: any = {}
    if (status && status !== 'ALL') whereSeq.status = status
    if (leadId) whereSeq.leadId = leadId
    if (channel && channel !== 'ALL') whereSeq.channel = channel

    // Lead search (name/email) happens at the lead layer.
    const leadWhere: any = {}
    if (q) {
      leadWhere.OR = [
        { email: { contains: q, mode: 'insensitive' } },
        { firstName: { contains: q, mode: 'insensitive' } },
        { lastName: { contains: q, mode: 'insensitive' } },
      ]
    }

    // If the caller filtered sequences, require at least one matching sequence.
    // This keeps the left panel "lead rows" aligned with filters.
    const hasSeqFilter = Boolean(whereSeq.status || whereSeq.channel || whereSeq.leadId)
    if (hasSeqFilter) {
      leadWhere.sequences = { some: whereSeq }
    }

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where: leadWhere,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          practiceArea: true,
          caseType: true,
          status: true,
          nurturePaused: true,
          sequences: {
            where: whereSeq,
            orderBy: { step: 'asc' },
            select: {
              id: true,
              step: true,
              channel: true,
              status: true,
              scheduledAt: true,
              sentAt: true,
              attempts: true,
              lastError: true,
              updatedAt: true,
            },
          },
        },
      }),
      prisma.lead.count({ where: leadWhere }),
    ])

    // Counts across the current filter scope (sequence-level filters only; search not applied here).
    const countsRows = await prisma.sequence.groupBy({
      by: ['status'],
      _count: { _all: true },
      where: whereSeq,
    })
    const counts = {
      total: countsRows.reduce((a, r) => a + r._count._all, 0),
      queued: countsRows.find((r) => r.status === 'PENDING')?._count._all ?? 0,
      sent: countsRows.find((r) => r.status === 'SENT')?._count._all ?? 0,
      failed: countsRows.find((r) => r.status === 'FAILED')?._count._all ?? 0,
      cancelled: countsRows.find((r) => r.status === 'CANCELLED')?._count._all ?? 0,
      skipped: countsRows.find((r) => r.status === 'SKIPPED')?._count._all ?? 0,
    }

    return NextResponse.json({ leads, total, page, limit, counts })
  } catch (err) {
    console.error('[ADMIN_SEQUENCES_ERROR]', err)
    return NextResponse.json({ error: 'Failed to fetch sequences' }, { status: 500 })
  }
}

