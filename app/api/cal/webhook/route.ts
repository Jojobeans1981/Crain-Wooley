import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json()
    console.log('[CAL WEBHOOK] Received payload:', JSON.stringify(payload, null, 2))

    const { triggerEvent, payload: bookingData } = payload

    if (triggerEvent === 'BOOKING_CREATED') {
      // In Cal.com, the payload is nested under 'payload'
      const booking = bookingData
      const email = booking.attendees?.[0]?.email || booking.responses?.email || booking.email
      const leadId = booking.metadata?.leadId

      if (!email && !leadId) {
        return NextResponse.json({ error: 'No lead identifiers found' }, { status: 400 })
      }

      const lead = await prisma.lead.findFirst({
        where: leadId ? { id: leadId } : { email: email },
      })

      if (!lead) {
        console.warn(`[CAL WEBHOOK] Lead not found for email: ${email} or leadId: ${leadId}`)
        return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
      }

      await prisma.lead.update({
        where: { id: lead.id },
        data: {
          status: 'SCHEDULED',
          consultAt: new Date(booking.startTime),
          calEventId: String(booking.id),
        },
      })

      // Cancel any pending follow-up sequences for this lead
      await prisma.sequence.updateMany({
        where: {
          leadId: lead.id,
          status: 'PENDING',
        },
        data: {
          status: 'CANCELLED',
        },
      })

      console.log(`[CAL WEBHOOK] Updated lead ${lead.id} to SCHEDULED`)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[CAL WEBHOOK] Error processing webhook:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
