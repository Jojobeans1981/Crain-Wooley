export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { createSupabaseMiddlewareClient } from '@/src/lib/supabase/middleware'

export async function GET(req: NextRequest) {
  try {
    // Use the middleware client because this route is called from middleware (cookie-based).
    const res = NextResponse.next()
    const supabase = createSupabaseMiddlewareClient(req, res)
    const { data } = await supabase.auth.getUser()
    const email = data.user?.email
    if (!email) return NextResponse.json({ ok: false }, { status: 401 })

    const admin = await prisma.adminUser.findUnique({ where: { email } })
    if (!admin) return NextResponse.json({ ok: false }, { status: 403 })

    return NextResponse.json({ ok: true, email: admin.email, role: admin.role })
  } catch {
    return NextResponse.json({ ok: false }, { status: 401 })
  }
}

