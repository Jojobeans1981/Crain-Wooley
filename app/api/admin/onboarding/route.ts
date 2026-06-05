export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { enqueueClioSync, drainClioOutbox } from '@/lib/clio/outbox'
import { isClioConnected } from '@/lib/clio/connection'
import { requireRole } from '@/src/lib/auth/requireRole'

export async function POST(req: NextRequest) {
  const auth = await requireRole(req, 'ADMIN')
  if (auth instanceof NextResponse) return auth

  try {
    const { leadId } = await req.json()

    const lead = await prisma.lead.findUnique({ where: { id: leadId } })
    if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    if (lead.status !== 'CONSULTED') {
      return NextResponse.json(
        { error: 'Lead must be in CONSULTED status to trigger onboarding' },
        { status: 400 }
      )
    }

    // Persist the Hired transition immediately (works with Clio off), then defer
    // the contact→matter→template→tasks work to the disconnect-safe outbox.
    await prisma.lead.update({
      where: { id: leadId },
      data: { status: 'HIRED', hired: true, hiredAt: new Date() },
    })

    await enqueueClioSync('ONBOARD_MATTER', leadId)

    // Fast path: if Clio is connected, sync now so the admin sees parity behavior.
    if (await isClioConnected()) {
      await drainClioOutbox().catch((e) => console.error('[ADMIN_ONBOARDING] drain error', e))
    }

    const synced = await prisma.lead.findUnique({ where: { id: leadId } })
    return NextResponse.json({
      success: true,
      queued: true,
      clioConnected: await isClioConnected(),
      clioContactId: synced?.clioContactId ?? null,
      clioMatterId: synced?.clioMatterId ?? null,
    })
  } catch (error) {
    console.error('[ADMIN_ONBOARDING_ERROR]', error)
    return NextResponse.json({ error: 'Onboarding trigger failed' }, { status: 500 })
  }
}

