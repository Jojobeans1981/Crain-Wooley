import { prisma } from '@/lib/db/prisma'
import { isClioConnected } from './connection'

export interface ClioOutboxStatus {
  connected: boolean
  pending: number
  inProgress: number
  failed: number
  oldestPendingAt: string | null
  lastDrainAt: string | null
  lastDrainResult: string | null
}

/**
 * Read-only snapshot of the Clio sync outbox for the admin dashboard. Pure
 * aggregates over ClioSyncJob + the most-recent CLIO_DRAIN audit entry (so even
 * healthy {skipped:true} cron runs are visible). No new schema, never throws.
 */
export async function getClioOutboxStatus(): Promise<ClioOutboxStatus> {
  try {
    const [connected, pending, inProgress, failed, oldestPending, lastDrain] = await Promise.all([
      isClioConnected(),
      prisma.clioSyncJob.count({ where: { status: 'PENDING' } }),
      prisma.clioSyncJob.count({ where: { status: 'IN_PROGRESS' } }),
      prisma.clioSyncJob.count({ where: { status: 'FAILED' } }),
      prisma.clioSyncJob.findFirst({
        where: { status: 'PENDING' },
        orderBy: { createdAt: 'asc' },
        select: { createdAt: true },
      }),
      prisma.auditEvent.findFirst({
        where: { type: 'CLIO_DRAIN' },
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true, meta: true },
      }),
    ])

    const meta = lastDrain?.meta as { result?: string } | null
    return {
      connected,
      pending,
      inProgress,
      failed,
      oldestPendingAt: oldestPending?.createdAt.toISOString() ?? null,
      lastDrainAt: lastDrain?.createdAt.toISOString() ?? null,
      lastDrainResult: meta?.result ?? null,
    }
  } catch {
    return { connected: false, pending: 0, inProgress: 0, failed: 0, oldestPendingAt: null, lastDrainAt: null, lastDrainResult: null }
  }
}
