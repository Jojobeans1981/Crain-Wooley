export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/stripe'
import { prisma } from '@/lib/db/prisma'
import { enqueueClioSync, drainClioOutbox } from '@/lib/clio/outbox'
import { isClioConnected } from '@/lib/clio/connection'
import { auditEvent } from '@/lib/audit'
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

      await auditEvent({
        type: 'PAYMENT_COMPLETED',
        leadId,
        meta: { stripeSessionId: session.id },
      })

      // Disconnect-safe Clio sync: persist the intent, then drain if connected.
      // When Clio is offline the job stays PENDING and the webhook still succeeds.
      await enqueueClioSync('UPSERT_CONTACT', leadId)
      if (await isClioConnected()) {
        await drainClioOutbox().catch((e) => console.error('[STRIPE WEBHOOK] drain error', e))
      }

      await prisma.sequence.updateMany({
        where: { leadId, status: 'PENDING' },
        data: { status: 'CANCELLED' },
      })
      await auditEvent({ type: 'SEQUENCE_CANCELLED', leadId, meta: { reason: 'payment_completed' } })
    }
  }

  return NextResponse.json({ received: true })
}
