export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/stripe'
import { prisma } from '@/lib/db/prisma'
import { ClioService } from '@/lib/clio/ClioService'
import type Stripe from 'stripe'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    if (sig === 'demo_signature' && process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
      event = JSON.parse(body) as Stripe.Event
    } else {
      event = stripe().webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
    }
  } catch (err) {
    console.error('[STRIPE WEBHOOK] Signature verification failed', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const leadId = session.metadata?.leadId

    if (leadId) {
      const lead = await prisma.lead.findUnique({ where: { id: leadId } })
      if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 })

      await prisma.lead.update({
        where: { id: leadId },
        data: { 
          status: 'PAYMENT_COMPLETE', 
          paymentStatus: 'PAID', 
          paidAt: new Date(),
          stripeSessionId: session.id 
        },
      })

      // Automated Action: Create contact in Clio
      try {
        let contactId = lead.clioContactId
        if (!contactId) {
          const existing = await ClioService.getContactByEmail(lead.email)
          if (existing) {
            contactId = existing.id
          } else {
            const clioContact = await ClioService.createContact({
              firstName: lead.firstName,
              lastName: lead.lastName,
              email: lead.email,
              phone: lead.phone,
            })
            contactId = clioContact.id
          }
        }

        await prisma.lead.update({
          where: { id: leadId },
          data: { clioContactId: contactId },
        })
        console.log(`[STRIPE WEBHOOK] Linked Clio contact ${contactId} for lead ${leadId}`)
      } catch (clioError) {
        console.error(`[STRIPE WEBHOOK] Failed to link Clio contact for lead ${leadId}:`, clioError)
      }

      await prisma.sequence.updateMany({
        where: { leadId, status: 'PENDING' },
        data: { status: 'CANCELLED' },
      })
    }
  }

  return NextResponse.json({ received: true })
}
