export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { drainClioOutbox } from '@/lib/clio/outbox'
import { auditEvent } from '@/lib/audit'

/** One-line summary for the audit log so "Last drain" is always visible. */
function drainSummary(r: Awaited<ReturnType<typeof drainClioOutbox>>) {
  return r.skipped ? 'skipped' : `drained ${r.done} / failed ${r.failed}`
}

/**
 * Drains the Clio sync outbox. Same Bearer auth as /api/ghost/cron. Intended for
 * Vercel Cron; GET and POST both work (Vercel Cron issues GET). When Clio is not
 * connected the drain is a safe no-op ({ skipped: true }).
 */
async function handle(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const result = await drainClioOutbox()
  await auditEvent({ type: 'CLIO_DRAIN', meta: { ...result, result: drainSummary(result), via: 'cron' } })
  return NextResponse.json(result)
}

export const POST = handle
export const GET = handle
