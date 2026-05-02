import { NextResponse, type NextRequest } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { createSupabaseMiddlewareClient } from '@/src/lib/supabase/middleware'
import type { AdminRole, AdminUser } from '@prisma/client'

const ROLE_RANK: Record<AdminRole, number> = {
  SUPER_ADMIN: 3,
  ADMIN: 2,
  VIEWER: 1,
}

export async function requireRole(
  request: NextRequest,
  minRole: AdminRole
): Promise<AdminUser | NextResponse> {
  try {
    // Create a no-op response object for the middleware client API.
    const res = NextResponse.next()
    const supabase = createSupabaseMiddlewareClient(request, res)

    const { data } = await supabase.auth.getUser()
    const email = data.user?.email
    if (!email) return NextResponse.redirect(new URL('/login', request.url))

    const admin = await prisma.adminUser.findUnique({ where: { email } })
    if (!admin) return NextResponse.redirect(new URL('/unauthorized', request.url))

    if (ROLE_RANK[admin.role] < ROLE_RANK[minRole]) {
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }

    return admin
  } catch {
    return NextResponse.redirect(new URL('/login', request.url))
  }
}

