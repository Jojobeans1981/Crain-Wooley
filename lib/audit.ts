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

export async function auditEvent(input: {
  type: AuditEventType
  leadId?: string
  actor?: string
  ip?: string
  userAgent?: string
  meta?: Prisma.InputJsonValue
}) {
  try {
    await prisma.auditEvent.create({
      data: {
        type: input.type,
        leadId: input.leadId,
        actor: input.actor,
        ip: input.ip,
        userAgent: input.userAgent,
        meta: input.meta,
      },
    })
  } catch {
    // Audit logging must never break core flows.
  }
}
