export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { createConsultationSession } from '@/lib/stripe/stripe'

export async function POST(req: NextRequest) {
  try {
    const { leadId } = await req.json()
    const lead = await prisma.lead.findUnique({ where: { id: leadId } })
    if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    if (!lead.qualified) return NextResponse.json({ error: 'Lead not qualified' }, { status: 403 })

    const session = await createConsultationSession({
      leadId: lead.id, email: lead.email,
      firstName: lead.firstName, lastName: lead.lastName,
      practiceArea: lead.practiceArea,
    })

    await prisma.lead.update({
      where: { id: leadId },
      data: { status: 'PAYMENT_PENDING', stripeSessionId: session.id },
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('[STRIPE SESSION ERROR]', error)
    return NextResponse.json({ error: 'Failed to create payment session' }, { status: 500 })
  }
}
