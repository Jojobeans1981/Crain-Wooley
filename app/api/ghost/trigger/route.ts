export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { buildSequenceJobs } from '@/lib/ghost/sequences'

export async function POST(req: NextRequest) {
  try {
    const { leadId } = await req.json()
    const lead = await prisma.lead.findUnique({ where: { id: leadId } })
    if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 })

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const jobs = buildSequenceJobs(lead.id, {
      firstName: lead.firstName,
      practiceArea: lead.practiceArea.replace(/_/g, ' '),
      paymentLink: `${appUrl}/payment?leadId=${lead.id}`,
    })

    await prisma.sequence.createMany({ data: jobs })
    return NextResponse.json({ success: true, count: jobs.length })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to trigger sequence' }, { status: 500 })
  }
}
