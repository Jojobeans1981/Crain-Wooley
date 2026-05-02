import type { SequenceStep } from '@/types'

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
  return GHOST_SEQUENCE.map((seq) => ({
    leadId,
    channel: seq.channel,
    step: seq.step,
    scheduledAt: new Date(baseTime.getTime() + seq.delayHours * 60 * 60 * 1000),
    template: interpolate(seq.template, vars),
    status: 'PENDING' as const,
  }))
}
