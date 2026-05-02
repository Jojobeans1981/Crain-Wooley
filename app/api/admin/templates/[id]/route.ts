export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { auditEvent } from '@/lib/audit'
import { requireRole } from '@/src/lib/auth/requireRole'

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireRole(req, 'ADMIN')
  if (admin instanceof NextResponse) return admin

  try {
    const { id } = await params
    const body = (await req.json()) as { subject?: string | null; body: string; active?: boolean }

    if (!body.body || !String(body.body).trim()) {
      return NextResponse.json({ error: 'Body must not be empty' }, { status: 400 })
    }

    const existing = await prisma.nurtureTemplate.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    if (existing.channel === 'SMS' && String(body.body).length > 1600) {
      return NextResponse.json({ error: 'SMS templates max 1600 characters' }, { status: 400 })
    }

    const updated = await prisma.nurtureTemplate.update({
      where: { id },
      data: {
        subject: existing.channel === 'EMAIL' ? (body.subject ?? null) : existing.subject,
        body: body.body,
        active: typeof body.active === 'boolean' ? body.active : existing.active,
      },
    })

    await auditEvent({
      type: 'TEMPLATE_UPDATED',
      actor: admin.email,
      meta: { templateId: id, adminEmail: admin.email },
    })

    return NextResponse.json({ template: updated })
  } catch (err) {
    console.error('[ADMIN_TEMPLATE_UPDATE_ERROR]', err)
    return NextResponse.json({ error: 'Failed to update template' }, { status: 500 })
  }
}

