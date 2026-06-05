export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { drainClioOutbox } from '@/lib/clio/outbox'

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
  return NextResponse.json(result)
}

export const POST = handle
export const GET = handle
