export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { drainClioOutbox } from '@/lib/clio/outbox'
import { auditEvent } from '@/lib/audit'

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code')
  const error = req.nextUrl.searchParams.get('error')
  const base = process.env.NEXT_PUBLIC_BASE_URL || `https://${req.headers.get('host')}`

  if (error) {
    console.error('[CLIO CALLBACK] OAuth error:', error)
    return NextResponse.redirect(`${base}/dashboard?clio=error&reason=${encodeURIComponent(error)}`)
  }

  if (!code) {
    return NextResponse.redirect(`${base}/dashboard?clio=error&reason=no_code`)
  }

  try {
    const tokenRes = await fetch('https://app.clio.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: process.env.CLIO_REDIRECT_URI!,
        client_id: process.env.CLIO_CLIENT_ID!,
        client_secret: process.env.CLIO_CLIENT_SECRET!,
      }),
    })

    if (!tokenRes.ok) {
      const body = await tokenRes.text()
      console.error('[CLIO CALLBACK] Token exchange failed:', tokenRes.status, body)
      return NextResponse.redirect(`${base}/dashboard?clio=error&reason=token_exchange`)
    }

    const data = await tokenRes.json()

    await prisma.clioToken.upsert({
      where: { id: 'singleton' },
      create: {
        id: 'singleton',
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt: new Date(Date.now() + data.expires_in * 1000),
      },
      update: {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt: new Date(Date.now() + data.expires_in * 1000),
      },
    })

    await auditEvent({
      type: 'CLIO_CONNECTED',
      meta: { expiresIn: data.expires_in },
    })

    // Clio just came online — sync any backlog captured while it was disconnected.
    try {
      await drainClioOutbox()
    } catch (drainErr) {
      console.error('[CLIO CALLBACK] outbox drain after connect failed:', drainErr)
    }

    return NextResponse.redirect(`${base}/dashboard?clio=connected`)
  } catch (err) {
    console.error('[CLIO CALLBACK] Unexpected error:', err)
    return NextResponse.redirect(`${base}/dashboard?clio=error&reason=unexpected`)
  }
}
