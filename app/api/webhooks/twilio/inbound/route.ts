export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import twilio from 'twilio'
import { prisma } from '@/lib/db/prisma'
import { auditEvent } from '@/lib/audit'

const STOP_KEYWORDS = ['STOP', 'UNSUBSCRIBE', 'CANCEL', 'END', 'QUIT']

function toE164(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 10) return `+1${digits}`
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`
  return `+${digits}`
}

function twiml(message: string): NextResponse {
  return new NextResponse(
    `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${message}</Message></Response>`,
    { status: 200, headers: { 'Content-Type': 'text/xml' } }
  )
}

function twimlEmpty(): NextResponse {
  return new NextResponse('<?xml version="1.0" encoding="UTF-8"?><Response/>', {
    status: 200,
    headers: { 'Content-Type': 'text/xml' },
  })
}

export async function POST(req: NextRequest) {
  try {
    const authToken = process.env.TWILIO_AUTH_TOKEN!
    const signature = req.headers.get('x-twilio-signature') ?? ''
    const base = process.env.NEXT_PUBLIC_BASE_URL ?? `https://${req.headers.get('host')}`
    const url = base + '/api/webhooks/twilio/inbound'

    const rawBody = await req.text()
    const params: Record<string, string> = {}
    for (const [k, v] of new URLSearchParams(rawBody)) params[k] = v

    const valid = twilio.validateRequest(authToken, signature, url, params)
    if (!valid && process.env.NODE_ENV !== 'development') {
      return new NextResponse('Forbidden', { status: 403 })
    }

    const from = params['From'] ?? ''
    const text = (params['Body'] ?? '').trim().toUpperCase()
    const normalized = toE164(from)

    if (STOP_KEYWORDS.some((kw) => text === kw || text.startsWith(kw + ' '))) {
      const lead = await prisma.lead.findFirst({ where: { phone: { in: [from, normalized] } } })

      if (lead) {
        await prisma.lead.update({
          where: { id: lead.id },
          data: { optedOut: true, optedOutAt: new Date() },
        })
        await prisma.sequence.updateMany({
          where: { leadId: lead.id, status: 'PENDING' },
          data: { status: 'SKIPPED' },
        })
        await auditEvent({
          type: 'OPTED_OUT',
          leadId: lead.id,
          meta: { phone: from, keyword: text, source: 'sms' },
        })
      }

      return twiml('You have been unsubscribed. Reply START to re-subscribe.')
    }

    if (text === 'START') {
      const lead = await prisma.lead.findFirst({ where: { phone: { in: [from, normalized] } } })

      if (lead?.optedOut) {
        await prisma.lead.update({
          where: { id: lead.id },
          data: { optedOut: false, optedOutAt: null },
        })
        await auditEvent({
          type: 'OPTED_IN',
          leadId: lead.id,
          meta: { phone: from, source: 'sms' },
        })
      }

      return twiml('You have been re-subscribed to messages from Crain & Wooley.')
    }

    return twimlEmpty()
  } catch (err) {
    console.error('[twilio/inbound]', err)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
