import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/auth-helpers-nextjs'
import { prisma } from '@/lib/db/prisma'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const code = url.searchParams.get('code')

  if (!code) return NextResponse.redirect(new URL('/login', req.url))

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!supabaseUrl || !supabaseAnonKey) return NextResponse.redirect(new URL('/login', req.url))

    const cookieStore = await cookies()
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll().map((c) => ({ name: c.name, value: c.value }))
        },
        setAll(cookiesToSet) {
          for (const c of cookiesToSet) cookieStore.set(c.name, c.value, c.options)
        },
      },
    })
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) return NextResponse.redirect(new URL('/login', req.url))

    const email = data.user?.email
    if (!email) return NextResponse.redirect(new URL('/login', req.url))

    const admin = await prisma.adminUser.findUnique({ where: { email } })
    if (!admin) return NextResponse.redirect(new URL('/unauthorized', req.url))

    return NextResponse.redirect(new URL('/dashboard', req.url))
  } catch {
    return NextResponse.redirect(new URL('/login', req.url))
  }
}
