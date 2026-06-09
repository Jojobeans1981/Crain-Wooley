import { prisma } from '@/lib/db/prisma'
import { auditEvent } from '@/lib/audit'
import { sendEmail } from '@/lib/resend/email'
import { createPortalToken } from '@/lib/portal/token'

function getPortalBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    'https://www.estateplanningdfw.law'
  ).replace(/\/$/, '')
}

export async function sendPortalAccessEmail(leadId: string, reason: string) {
  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
    select: { id: true, firstName: true, lastName: true, email: true, status: true },
  })

  if (!lead) return null

  const token = createPortalToken({ leadId: lead.id, email: lead.email, ttlHours: 72 })
  const portalUrl = `${getPortalBaseUrl()}/portal/${lead.id}/${token}`
  const firmInbox = process.env.LEAD_NOTIFICATION_EMAIL || process.env.SEED_ADMIN_EMAIL

  await sendEmail({
    to: lead.email,
    subject: 'Your secure Crain & Wooley client portal',
    text: [
      `Hello ${lead.firstName},`,
      '',
      `Your secure client portal is ready because: ${reason}.`,
      `Open it here: ${portalUrl}`,
      '',
      'If you did not request this link, you can ignore this message.',
    ].join('\n'),
    idempotencyKey: `portal-link:${lead.id}:${reason}:${Math.floor(Date.now() / 1000 / 3600)}`,
  })

  if (firmInbox && firmInbox !== lead.email) {
    await sendEmail({
      to: firmInbox,
      subject: `[Portal] Link sent to ${lead.firstName} ${lead.lastName}`,
      text: [
        `A secure client portal link was sent to ${lead.email}.`,
        `Lead ID: ${lead.id}`,
        `Status: ${lead.status}`,
        `Reason: ${reason}`,
        `Portal URL: ${portalUrl}`,
      ].join('\n'),
      idempotencyKey: `portal-link-firm:${lead.id}:${reason}:${Math.floor(Date.now() / 1000 / 3600)}`,
    })
  }

  await auditEvent({
    type: 'PORTAL_LINK_SENT',
    leadId: lead.id,
    meta: { portalUrl, reason },
  })

  return { lead, portalUrl }
}

