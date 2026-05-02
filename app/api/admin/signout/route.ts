export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { auditEvent } from '@/lib/audit'
import { requireRole } from '@/src/lib/auth/requireRole'

export async function POST(req: NextRequest) {
  const auth = await requireRole(req, 'VIEWER')
  if (auth instanceof NextResponse) return auth

  try {
    await auditEvent({
      type: 'ADMIN_SIGNOUT',
      actor: auth.email,
      meta: { email: auth.email },
    })
  } catch {
    // Best-effort
  }

  return NextResponse.json({ ok: true })
}

