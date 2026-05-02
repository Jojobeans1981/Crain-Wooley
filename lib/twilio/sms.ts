import twilio from 'twilio'
import { prisma } from '@/lib/db/prisma'
import { auditEvent } from '@/lib/audit'

let _client: ReturnType<typeof twilio> | null = null

function getClient() {
  if (!_client) {
    _client = twilio(process.env.TWILIO_ACCOUNT_SID!, process.env.TWILIO_AUTH_TOKEN!)
  }
  return _client
}

export async function sendSMS(
  to: string,
  body: string,
  options?: { idempotencyKey?: string; optedOut?: boolean; leadId?: string; sequenceId?: string }
): Promise<void> {
  const callerOptedOut = options?.optedOut
  const dbLead = callerOptedOut
    ? null
    : await prisma.lead.findFirst({ where: { phone: to }, select: { id: true, optedOut: true } })

  if (callerOptedOut || dbLead?.optedOut) {
    const leadId = options?.leadId ?? dbLead?.id
    const seqId = options?.sequenceId

    if (seqId) {
      await prisma.sequence.update({ where: { id: seqId }, data: { status: 'SKIPPED' } })
    }
    await auditEvent({ type: 'MESSAGE_BLOCKED_OPT_OUT', leadId, meta: { phone: to, seqId } })
    throw new Error('OPTED_OUT')
  }

  if (process.env.NODE_ENV === 'development') {
    console.log(`[SMS] ${to}\n${body}`)
    return
  }

  await getClient().messages.create({
    body,
    from: process.env.TWILIO_FROM_NUMBER!,
    to,
    ...(options?.idempotencyKey && { idempotencyKey: options.idempotencyKey }),
  })
}
