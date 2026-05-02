import { NextResponse, type NextRequest } from 'next/server'
import { createSupabaseMiddlewareClient } from '@/src/lib/supabase/middleware'

const PROTECTED_MATCHERS = [
  /^\/dashboard(\/.*)?$/,
  /^\/leads(\/.*)?$/,
  /^\/sequences(\/.*)?$/,
  /^\/demo(\/.*)?$/,
  /^\/api\/admin(\/.*)?$/,
  /^\/api\/audit(\/.*)?$/,
]

function isProtected(pathname: string) {
  return PROTECTED_MATCHERS.some((re) => re.test(pathname))
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Allow auth routes to function without a session.
  if (pathname === '/login' || pathname === '/unauthorized' || pathname.startsWith('/auth/')) {
    return NextResponse.next()
  }

  if (!isProtected(pathname)) return NextResponse.next()

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseAnonKey) {
    // No Supabase configured (dev). Don't block local usage.
    return NextResponse.next()
  }

  const requestHeaders = new Headers(req.headers)
  const res = NextResponse.next({ request: { headers: requestHeaders } })

  try {
    const supabase = createSupabaseMiddlewareClient(req, res)
    const { data: userData } = await supabase.auth.getUser()
    const email = userData.user?.email

    if (!email) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      return NextResponse.redirect(new URL('/login', req.url))
    }

    // Validate that the authenticated user is an approved AdminUser (DB-backed).
    // Middleware runs at the edge, so we delegate the DB lookup to a small internal API.
    const authzRes = await fetch(new URL('/api/_admin/authz', req.url), {
      headers: { cookie: req.headers.get('cookie') || '' },
    })

    if (!authzRes.ok) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
      return NextResponse.redirect(new URL('/unauthorized', req.url))
    }

    const authz = (await authzRes.json()) as { email?: string; role?: string }
    requestHeaders.set('x-admin-email', authz.email || email)
    requestHeaders.set('x-admin-role', authz.role || 'VIEWER')

    return res
  } catch {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.redirect(new URL('/login', req.url))
  }
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/leads/:path*',
    '/sequences/:path*',
    '/demo/:path*',
    '/api/admin/:path*',
    '/api/audit/:path*',
  ],
}
