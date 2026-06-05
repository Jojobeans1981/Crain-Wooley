import { prisma } from '@/lib/db/prisma'
import type { Prisma } from '@prisma/client'

export type AuditEventType =
  | 'LEAD_CREATED'
  | 'LEAD_STATUS_CHANGED'
  | 'PAYMENT_COMPLETED'
  | 'SCHEDULED'
  | 'SEQUENCE_ENQUEUED'
  | 'SEQUENCE_SENT'
  | 'SEQUENCE_FAILED'
  | 'SEQUENCE_CANCELLED'
  | 'ADMIN_SIGNOUT'
  | 'SEQUENCE_PAUSED'
  | 'SEQUENCE_RESUMED'
  | 'MESSAGE_RETRY'
  | 'TEMPLATE_UPDATED'
  | 'DEAD_LETTER_THRESHOLD'
  | 'OPTED_OUT'
  | 'OPTED_IN'
  | 'MESSAGE_BLOCKED_OPT_OUT'
  | 'LEADS_EXPORTED'
  | 'AUDIT_EXPORTED'
  | 'ONBOARDING_STARTED'
  | 'ONBOARDING_SKIPPED'
  | 'ONBOARDING_FAILED'
  | 'ONBOARDING_TEMPLATE_UPDATED'
  | 'CLIO_CONNECTED'
  | 'CLIO_DRAIN'

export async function auditEvent(input: {
  type: AuditEventType
  leadId?: string
  actor?: string
  ip?: string
  userAgent?: string
  meta?: Prisma.InputJsonValue
}) {
  try {
    await prisma.auditEvent.create({ data: input })
  } catch (e) {
    console.error('[AUDIT_WRITE_ERROR]', e)
  }
}
