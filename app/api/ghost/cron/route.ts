export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { sendSMS } from '@/lib/twilio/sms'
import { sendEmail } from '@/lib/resend/email'
import { auditEvent } from '@/lib/audit'

export async function POST(req: NextRequest) {
  // Secure cron endpoint
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()

  // Find all pending sequences due for delivery
  const due = await prisma.sequence.findMany({
    where: {
      status: 'PENDING',
      scheduledAt: { lte: now },
      attempts: { lt: 5 },
      OR: [{ lockedAt: null }, { lockedAt: { lt: new Date(now.getTime() - 10 * 60 * 1000) } }],
    },
    include: { lead: true },
    take: 100,
  })

  const results = { sent: 0, failed: 0, skipped: 0 }

  for (const seq of due) {
    const lead = seq.lead

    // Skip if lead paid or hired
    if (lead.paymentStatus === 'PAID' || lead.hired) {
      await prisma.sequence.update({
        where: { id: seq.id },
        data: { status: 'CANCELLED', lockedAt: null },
      })
      await auditEvent({ type: 'SEQUENCE_CANCELLED', leadId: lead.id, meta: { seqId: seq.id, reason: 'paid_or_hired' } })
      results.skipped++
      continue
    }

    try {
      // Soft lock: prevents double-sends if cron overlaps.
      const locked = await prisma.sequence.updateMany({
        where: { id: seq.id, lockedAt: null, status: 'PENDING' },
        data: { lockedAt: now },
      })
      if (locked.count !== 1) {
        results.skipped++
        continue
      }

      if (seq.channel === 'SMS') {
        await sendSMS(lead.phone, seq.template)
      } else {
        // Extract subject from template first line if present
        const lines = seq.template.split('\n')
        const subject = lines[0].startsWith('Subject:')
          ? lines[0].replace('Subject:', '').trim()
          : `Update from Crain & Wooley`

        await sendEmail({
          to: lead.email,
          subject,
          text: seq.template,
        })
      }

      await prisma.sequence.update({
        where: { id: seq.id },
        data: { status: 'SENT', sentAt: now, attempts: { increment: 1 }, lastError: null, lockedAt: null },
      })
      await auditEvent({ type: 'SEQUENCE_SENT', leadId: lead.id, meta: { seqId: seq.id, channel: seq.channel, step: seq.step } })
      results.sent++
    } catch (err) {
      console.error(`[GHOST CRON] Failed to send seq ${seq.id}`, err)
      await prisma.sequence.update({
        where: { id: seq.id },
        data: { status: 'FAILED', attempts: { increment: 1 }, lastError: String(err), lockedAt: null },
      })
      await auditEvent({ type: 'SEQUENCE_FAILED', leadId: lead.id, meta: { seqId: seq.id, error: String(err) } })
      results.failed++
    }
  }

  return NextResponse.json({ success: true, ...results })
}
