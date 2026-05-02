export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export async function GET(req: NextRequest) {
  try {
    const totalLeads = await prisma.lead.count()
    const qualified = await prisma.lead.count({
      where: { qualified: true }
    })
    
    const paidStatuses = ['PAYMENT_COMPLETE', 'SCHEDULED', 'CONSULTED', 'HIRED']
    const paid = await prisma.lead.count({
      where: {
        status: { in: paidStatuses as any }
      }
    })

    const scheduledStatuses = ['SCHEDULED', 'CONSULTED', 'HIRED']
    const scheduled = await prisma.lead.count({
      where: {
        status: { in: scheduledStatuses as any }
      }
    })

    const hired = await prisma.lead.count({
      where: {
        status: 'HIRED'
      }
    })

    const revenue = paid * 300
    const conversionRate = totalLeads > 0 ? Math.round((hired / totalLeads) * 100) : 0

    return NextResponse.json({
      totalLeads,
      qualified,
      paid,
      scheduled,
      hired,
      revenue,
      conversionRate
    })
  } catch (error) {
    console.error('[METRICS_ERROR]', error)
    return NextResponse.json({ error: 'Failed to fetch metrics' }, { status: 500 })
  }
}
