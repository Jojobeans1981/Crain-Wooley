export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/src/lib/auth/requireRole'

export async function GET(req: NextRequest) {
  const auth = await requireRole(req, 'ADMIN')
  if (auth instanceof NextResponse) return auth

  const clientId = process.env.CLIO_CLIENT_ID
  const redirectUri = process.env.CLIO_REDIRECT_URI

  if (!clientId || !redirectUri) {
    return NextResponse.json(
      { error: 'CLIO_CLIENT_ID and CLIO_REDIRECT_URI must be set in environment variables.' },
      { status: 500 }
    )
  }

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
  })

  return NextResponse.redirect(`https://app.clio.com/oauth/authorize?${params}`)
}
