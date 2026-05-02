import type Stripe from 'stripe'

// Lazy init — never runs at build time
let _stripe: Stripe | null = null

function getStripe(): Stripe {
  if (_stripe) return _stripe
  const StripeLib = require('stripe')
  _stripe = new StripeLib(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2026-04-22.dahlia',
  })
  return _stripe!
}

export { getStripe as stripe }

export const CONSULT_FEE_CENTS = 30000

export async function createConsultationSession(params: {
  leadId: string
  email: string
  firstName: string
  lastName: string
  practiceArea: string
}) {
  if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
    return {
      id: 'demo_session_' + Date.now(),
      url: `/confirmation?session_id=demo_session_${Date.now()}&leadId=${params.leadId}`
    } as any
  }

  const stripe = getStripe()
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  return stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    customer_email: params.email,
    line_items: [{
      price_data: {
        currency: 'usd',
        unit_amount: CONSULT_FEE_CENTS,
        product_data: {
          name: 'Legal Consultation — Crain & Wooley',
          description: `Initial consultation for ${params.practiceArea.replace(/_/g, ' ')} matter`,
        },
      },
      quantity: 1,
    }],
    metadata: {
      leadId: params.leadId,
      firstName: params.firstName,
      lastName: params.lastName,
    },
    success_url: `${appUrl}/confirmation?session_id={CHECKOUT_SESSION_ID}&leadId=${params.leadId}`,
    cancel_url: `${appUrl}/payment?cancelled=true&leadId=${params.leadId}`,
  })
}
