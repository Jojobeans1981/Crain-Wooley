import type { SequenceStep } from '@/types'
import { prisma } from '@/lib/db/prisma'

const SMS_FOOTER = '\n\nReply STOP to opt out.'

const EMAIL_FOOTER = (unsubscribeUrl: string) =>
  `\n\n---\nYou are receiving this because you submitted an inquiry to Crain & Wooley. To unsubscribe: ${unsubscribeUrl}`

function appendSmsFooter(body: string): string {
  if (body.includes('Reply STOP to opt out')) return body
  return body + SMS_FOOTER
}

function appendEmailFooter(body: string, leadId: string): string {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? ''
  const url = `${base}/unsubscribe?token=${leadId}`
  return body + EMAIL_FOOTER(url)
}

export const GHOST_SEQUENCE: SequenceStep[] = [
  {
    step: 1,
    channel: 'EMAIL',
    delayHours: 0, // Immediate
    subject: 'Your Consultation Request — Crain & Wooley',
    template: `Hi {{firstName}},

Thank you for reaching out to Crain & Wooley.

We've received your consultation request and a member of our team will be in touch shortly. To confirm your spot, your $300 consultation fee secures your time with our attorneys.

→ Complete your booking: {{paymentLink}}

This link expires in 48 hours.

— The Team at Crain & Wooley`,
  },
  {
    step: 2,
    channel: 'SMS',
    delayHours: 1,
    template: `Hi {{firstName}}, this is Crain & Wooley. We received your inquiry about {{practiceArea}}. Secure your consultation here: {{paymentLink}} — Reply STOP to opt out.`,
  },
  {
    step: 3,
    channel: 'EMAIL',
    delayHours: 24,
    subject: 'Still thinking it over? — Crain & Wooley',
    template: `Hi {{firstName}},

We noticed you haven't yet secured your consultation slot.

Legal matters in {{practiceArea}} often have time-sensitive implications. Our attorneys are ready to help — but availability is limited.

→ Book your consultation: {{paymentLink}}

Questions? Reply to this email directly.

— Crain & Wooley`,
  },
  {
    step: 4,
    channel: 'SMS',
    delayHours: 48,
    template: `Hi {{firstName}}, following up from Crain & Wooley. Your consultation slot is still available. Book here: {{paymentLink}} — Reply STOP to opt out.`,
  },
  {
    step: 5,
    channel: 'EMAIL',
    delayHours: 72,
    subject: 'Last chance to book — Crain & Wooley',
    template: `Hi {{firstName}},

This is our final follow-up regarding your consultation request.

If you'd like to move forward, we're ready. If your situation has changed, no worries — we're here if you need us in the future.

→ Book before this link expires: {{paymentLink}}

— Crain & Wooley`,
  },
  {
    step: 6,
    channel: 'SMS',
    delayHours: 96,
    template: `Final follow-up from Crain & Wooley, {{firstName}}. Your consultation link: {{paymentLink}} — Reply STOP to opt out.`,
  },
]

export function interpolate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? `{{${key}}}`)
}

export function buildSequenceJobs(
  leadId: string,
  vars: Record<string, string>,
  baseTime: Date = new Date()
): Array<{
  leadId: string
  channel: 'SMS' | 'EMAIL'
  step: number
  scheduledAt: Date
  template: string
  status: 'PENDING'
}> {
  return GHOST_SEQUENCE.map((seq) => {
    const rendered = interpolate(seq.template, vars)
    const withFooter =
      seq.channel === 'SMS'
        ? appendSmsFooter(rendered)
        : appendEmailFooter(rendered, leadId)
    return {
      leadId,
      channel: seq.channel,
      step: seq.step,
      scheduledAt: new Date(baseTime.getTime() + seq.delayHours * 60 * 60 * 1000),
      template: withFooter,
      status: 'PENDING' as const,
    }
  })
}

export async function buildSequenceJobsFromTemplates(
  leadId: string,
  vars: Record<string, string>,
  baseTime: Date = new Date()
) {
  try {
    const count = await prisma.nurtureTemplate.count()
    if (count === 0) {
      await prisma.nurtureTemplate.createMany({
        data: GHOST_SEQUENCE.map((s) => ({
          day: s.step,
          channel: s.channel,
          subject: s.subject ?? null,
          body: s.template,
          active: true,
        })),
      })
    }

    const templates = await prisma.nurtureTemplate.findMany({
      where: { active: true },
      orderBy: [{ day: 'asc' }, { channel: 'asc' }],
    })

    const byDay = new Map<string, { day: number; channel: 'SMS' | 'EMAIL'; subject: string | null; body: string }>()
    for (const t of templates) {
      byDay.set(`${t.day}:${t.channel}`, { day: t.day, channel: t.channel, subject: t.subject, body: t.body })
    }

    // Delay hours are still defined by the canonical sequence timeline.
    return GHOST_SEQUENCE.map((seq) => {
      const t = byDay.get(`${seq.step}:${seq.channel}`)
      const rawBody = t?.body ?? seq.template
      const rawSubject = t?.subject ?? seq.subject

      const renderedBody = interpolate(rawBody, vars)
      const withSubject =
        seq.channel === 'EMAIL' && rawSubject
          ? `Subject: ${interpolate(rawSubject, vars)}\n\n${renderedBody}`
          : renderedBody

      const withFooter =
        seq.channel === 'SMS'
          ? appendSmsFooter(withSubject)
          : appendEmailFooter(withSubject, leadId)

      return {
        leadId,
        channel: seq.channel,
        step: seq.step,
        scheduledAt: new Date(baseTime.getTime() + seq.delayHours * 60 * 60 * 1000),
        template: withFooter,
        status: 'PENDING' as const,
      }
    })
  } catch {
    // Fallback to hard-coded sequence if templates table isn't ready.
    return buildSequenceJobs(leadId, vars, baseTime)
  }
}
