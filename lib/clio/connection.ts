import { prisma } from '@/lib/db/prisma'

/**
 * Whether Clio is actually usable right now. True only when a ClioToken
 * 'singleton' row exists (with a refresh token) AND the kill-switch env
 * CLIO_CONNECTED is not explicitly 'false'. Never throws — callers use this to
 * decide between the fast path (drain now) and deferring work to the outbox.
 */
export async function isClioConnected(): Promise<boolean> {
  if (process.env.CLIO_CONNECTED === 'false') return false
  try {
    const record = await prisma.clioToken.findUnique({ where: { id: 'singleton' } })
    return !!record && !!record.refreshToken
  } catch {
    return false
  }
}
