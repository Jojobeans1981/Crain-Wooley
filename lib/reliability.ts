import { prisma } from '@/lib/db/prisma'
import { auditEvent } from '@/lib/audit'
import { sendEmail } from '@/lib/resend/email'

const DEAD_LETTER_THRESHOLD = 3
const MAX_BACKOFF_HOURS = 24
const BASE_BACKOFF_MINUTES = 5

export function getBackoffMinutes(attempt: number): number {
  return Math.min(BASE_BACKOFF_MINUTES * Math.pow(2, attempt), MAX_BACKOFF_HOURS * 60)
}

export function getNextRetryTime(base: Date, attempt: number): Date {
  return new Date(base.getTime() + getBackoffMinutes(attempt) * 60 * 1000)
}

export async function checkDeadLetter(sequenceId: string): Promise<boolean> {
  const seq = await prisma.sequence.findUnique({
    where: { id: sequenceId },
    select: { consecutiveFailures: true, leadId: true },
  })

  if (!seq || seq.consecutiveFailures < DEAD_LETTER_THRESHOLD) return false

  await prisma.sequence.update({
    where: { id: sequenceId },
    data: { status: 'CANCELLED' },
  })

  await auditEvent({
    type: 'SEQUENCE_CANCELLED',
    leadId: seq.leadId,
    meta: { seqId: sequenceId, reason: 'dead_letter_threshold', failures: seq.consecutiveFailures },
  })

  await alertDeadLetter(seq.leadId, sequenceId, seq.consecutiveFailures)

  return true
}

async function alertDeadLetter(leadId: string, sequenceId: string, failures: number) {
  try {
    const admins = await prisma.adminUser.findMany({
      where: { role: 'SUPER_ADMIN' },
      select: { email: true },
    })

    if (!admins.length) return

    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      select: { firstName: true, lastName: true, email: true },
    })

    const name = lead ? `${lead.firstName} ${lead.lastName}` : leadId

    await sendEmail({
      to: admins[0].email,
      subject: `Sequence failed: ${name}`,
      text: `Sequence ${sequenceId} for ${name} (${lead?.email ?? 'unknown'}) failed ${failures} times and was cancelled.\n\nLead: ${leadId}`,
    })
  } catch (err) {
    console.error('[dead_letter_alert]', err)
  }
}
