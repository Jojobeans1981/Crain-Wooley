import { prisma } from '@/lib/db/prisma'
import { ClioService } from './ClioService'
import { isClioConnected } from './connection'

export type ClioSyncType = 'UPSERT_CONTACT' | 'ONBOARD_MATTER'

const MAX_ATTEMPTS = 6
const BACKOFF_CAP_MS = 60 * 60 * 1000 // 1 hour
const DEFAULT_DRAIN_LIMIT = 25

export interface DrainResult {
  skipped: boolean
  processed: number
  done: number
  failed: number
}

/**
 * Enqueue a Clio sync job for a lead. Deduped by idempotencyKey (`${leadId}:${type}`)
 * so the same lead+type is never double-queued. NEVER calls Clio — pure persistence.
 */
export function enqueueClioSync(type: ClioSyncType, leadId: string) {
  const idempotencyKey = `${leadId}:${type}`
  return prisma.clioSyncJob.upsert({
    where: { idempotencyKey },
    create: { type, leadId, idempotencyKey, status: 'PENDING' },
    update: {}, // already queued (any status) — leave it; dedupe
  })
}

// ── Idempotent Clio operations (the stored clio IDs are the idempotency guard) ──

async function ensureContact(leadId: string): Promise<string> {
  const lead = await prisma.lead.findUnique({ where: { id: leadId } })
  if (!lead) throw new Error(`Lead ${leadId} not found`)
  if (lead.clioContactId) return lead.clioContactId

  const existing = await ClioService.getContactByEmail(lead.email)
  const contactId =
    existing?.id ??
    (await ClioService.createContact({
      firstName: lead.firstName,
      lastName: lead.lastName,
      email: lead.email,
      phone: lead.phone,
    })).id

  await prisma.lead.update({ where: { id: leadId }, data: { clioContactId: contactId } })
  return contactId
}

async function processJob(job: { type: string; leadId: string }): Promise<void> {
  if (job.type === 'UPSERT_CONTACT') {
    await ensureContact(job.leadId)
    return
  }

  if (job.type === 'ONBOARD_MATTER') {
    const contactId = await ensureContact(job.leadId)
    const lead = await prisma.lead.findUnique({ where: { id: job.leadId } })
    if (!lead) throw new Error(`Lead ${job.leadId} not found`)

    // Matter already created on a prior attempt — nothing more to create.
    if (lead.clioMatterId) {
      if (!lead.clioSyncedAt) {
        await prisma.lead.update({ where: { id: job.leadId }, data: { clioSyncedAt: new Date() } })
      }
      return
    }

    const matter = await ClioService.createMatter({
      contactId,
      description: lead.description,
      practiceArea: lead.practiceArea,
    })
    await ClioService.triggerOnboardingTemplate(matter.id)

    const dueAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    for (const name of ['Send retainer agreement', 'Request initial documents from client', 'Assign lead attorney']) {
      await ClioService.createTask({ matterId: matter.id, name, dueAt })
    }

    await prisma.lead.update({
      where: { id: job.leadId },
      data: { clioMatterId: matter.id, clioSyncedAt: new Date() },
    })
    return
  }

  throw new Error(`Unknown ClioSyncJob type: ${job.type}`)
}

/**
 * Process due PENDING jobs oldest-first, idempotently. If Clio is not connected
 * this is a no-op that leaves jobs PENDING (no throw) — they drain later. On a
 * per-job failure: bump attempts, set exponential backoff via nextAttemptAt, and
 * mark FAILED only once MAX_ATTEMPTS is reached.
 */
export async function drainClioOutbox(opts?: { limit?: number }): Promise<DrainResult> {
  if (!(await isClioConnected())) {
    return { skipped: true, processed: 0, done: 0, failed: 0 }
  }

  const now = new Date()
  const jobs = await prisma.clioSyncJob.findMany({
    where: {
      status: 'PENDING',
      OR: [{ nextAttemptAt: null }, { nextAttemptAt: { lte: now } }],
    },
    orderBy: { createdAt: 'asc' },
    take: opts?.limit ?? DEFAULT_DRAIN_LIMIT,
  })

  let done = 0
  let failed = 0

  for (const job of jobs) {
    await prisma.clioSyncJob.update({ where: { id: job.id }, data: { status: 'IN_PROGRESS' } })
    try {
      await processJob(job)
      await prisma.clioSyncJob.update({
        where: { id: job.id },
        data: { status: 'DONE', lastError: null, nextAttemptAt: null },
      })
      done++
    } catch (err) {
      const attempts = job.attempts + 1
      const terminal = attempts >= MAX_ATTEMPTS
      const backoff = Math.min(BACKOFF_CAP_MS, 1000 * 2 ** attempts)
      await prisma.clioSyncJob.update({
        where: { id: job.id },
        data: {
          status: terminal ? 'FAILED' : 'PENDING',
          attempts,
          lastError: (err instanceof Error ? err.message : String(err)).slice(0, 500),
          nextAttemptAt: terminal ? null : new Date(Date.now() + backoff),
        },
      })
      failed++
    }
  }

  return { skipped: false, processed: jobs.length, done, failed }
}
