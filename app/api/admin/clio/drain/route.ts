export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/src/lib/auth/requireRole'
import { drainClioOutbox } from '@/lib/clio/outbox'
import { getClioOutboxStatus } from '@/lib/clio/status'
import { auditEvent } from '@/lib/audit'

/**
 * Admin-facing Clio outbox endpoint. Protected by the ADMIN authz pattern
 * (Supabase session via requireRole) — NOT the cron Bearer, which is never
 * exposed to the browser.
 *   GET  → current outbox status (runs getClioOutboxStatus server-side)
 *   POST → "Drain now": drain server-side, audit it, return result + fresh status
 */
export async function GET(req: NextRequest) {
  const auth = await requireRole(req, 'ADMIN')
  if (auth instanceof NextResponse) return auth
  return NextResponse.json(await getClioOutboxStatus())
}

export async function POST(req: NextRequest) {
  const auth = await requireRole(req, 'ADMIN')
  if (auth instanceof NextResponse) return auth

  const result = await drainClioOutbox()
  await auditEvent({
    type: 'CLIO_DRAIN',
    actor: auth.email,
    meta: { ...result, result: result.skipped ? 'skipped' : `drained ${result.done} / failed ${result.failed}`, via: 'admin' },
  })
  return NextResponse.json({ result, status: await getClioOutboxStatus() })
}
