export const dynamic = 'force-dynamic'

import crypto from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { verifyPortalToken } from '@/lib/portal/token'
import { appendPortalUpload } from '@/lib/portal/attachments'
import { uploadPortalObject } from '@/lib/portal/storage'
import { auditEvent } from '@/lib/audit'
import { sendEmail } from '@/lib/resend/email'
import type { Prisma } from '@prisma/client'

const MAX_BYTES = 15 * 1024 * 1024

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData()
    const leadId = String(form.get('leadId') ?? '').trim()
    const token = String(form.get('token') ?? '').trim()
    const note = String(form.get('note') ?? '').trim()
    const file = form.get('file')

    if (!leadId || !token || !(file instanceof File)) {
      return NextResponse.json({ error: 'Missing upload data.' }, { status: 422 })
    }

    const claims = verifyPortalToken(token)
    if (!claims || claims.leadId !== leadId) {
      return NextResponse.json({ error: 'This portal link is no longer valid.' }, { status: 401 })
    }

    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        status: true,
        attachments: true,
      },
    })

    if (!lead || lead.email.toLowerCase() !== claims.email) {
      return NextResponse.json({ error: 'This portal link is no longer valid.' }, { status: 401 })
    }

    if (file.size <= 0 || file.size > MAX_BYTES) {
      return NextResponse.json({ error: 'Please upload a file under 15 MB.' }, { status: 422 })
    }

    const bytes = new Uint8Array(await file.arrayBuffer())
    const stored = await uploadPortalObject({
      leadId,
      fileName: file.name || 'document',
      contentType: file.type || 'application/octet-stream',
      bytes,
    })

    const uploads = appendPortalUpload(lead.attachments, {
      id: crypto.randomUUID(),
      name: file.name || 'document',
      bucket: stored.bucket,
      path: stored.path,
      contentType: stored.contentType,
      size: stored.size,
      uploadedAt: new Date().toISOString(),
      note: note || undefined,
    })

    await prisma.lead.update({
      where: { id: lead.id },
      data: { attachments: uploads as Prisma.InputJsonValue },
    })

    const firmInbox = process.env.LEAD_NOTIFICATION_EMAIL || process.env.SEED_ADMIN_EMAIL
    if (firmInbox) {
      await sendEmail({
        to: firmInbox,
        subject: `[Portal] Document uploaded by ${lead.firstName} ${lead.lastName}`,
        text: [
          `Client: ${lead.firstName} ${lead.lastName}`,
          `Email: ${lead.email}`,
          `Lead ID: ${lead.id}`,
          `File: ${file.name}`,
          `Type: ${file.type || 'application/octet-stream'}`,
          `Size: ${file.size} bytes`,
          `Bucket: ${stored.bucket}`,
          `Path: ${stored.path}`,
          note ? `Note: ${note}` : 'Note: (none)',
        ].join('\n'),
        idempotencyKey: `portal-upload:${lead.id}:${stored.path}`,
      })
    }

    await auditEvent({
      type: 'PORTAL_DOCUMENT_UPLOADED',
      leadId: lead.id,
      meta: {
        bucket: stored.bucket,
        path: stored.path,
        fileName: file.name,
        size: file.size,
        note,
      },
    })

    return NextResponse.json({ ok: true, path: stored.path, bucket: stored.bucket })
  } catch (error) {
    console.error('[PORTAL_UPLOAD_ERROR]', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to upload right now.' },
      { status: 500 }
    )
  }
}
