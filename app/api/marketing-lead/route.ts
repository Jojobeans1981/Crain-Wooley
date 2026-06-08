export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/resend/email'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(req: NextRequest) {
  let b: Record<string, unknown>
  try { b = await req.json() } catch { return NextResponse.json({ ok: false, error: 'Invalid request.' }, { status: 400 }) }
  const kind = b.kind === 'webinar' ? 'webinar' : 'guide'
  const firstName = String(b.firstName ?? '').trim()
  const lastName = String(b.lastName ?? '').trim()
  const email = String(b.email ?? '').trim()
  const phone = String(b.phone ?? '').trim()
  const session = String(b.session ?? '').trim()
  const consent = b.consent === true

  if (!firstName || !lastName || !EMAIL_RE.test(email)) {
    return NextResponse.json({ ok: false, error: 'Please enter your name and a valid email.' }, { status: 422 })
  }
  if (kind === 'webinar' && (!phone || !session)) {
    return NextResponse.json({ ok: false, error: 'Please add a phone number and pick a session.' }, { status: 422 })
  }

  const to = process.env.LEAD_NOTIFICATION_EMAIL || process.env.SEED_ADMIN_EMAIL
  if (!to) { console.error('[marketing-lead] no LEAD_NOTIFICATION_EMAIL/SEED_ADMIN_EMAIL'); return NextResponse.json({ ok: false, error: 'Submission is temporarily unavailable.' }, { status: 500 }) }

  const label = kind === 'webinar' ? 'Webinar registration' : 'Free guide download'
  const sessionLabel = session === '630pm' ? '6:30 pm' : session === '12pm' ? '12:00 pm' : session
  const text = [
    `New ${label} from the Crain & Wooley website.`, '',
    `Name:  ${firstName} ${lastName}`,
    `Email: ${email}`,
    phone ? `Phone: ${phone}` : '',
    kind === 'webinar' ? `Session: ${sessionLabel}` : '',
    `Consent to communications: ${consent ? 'Yes' : 'No'}`,
  ].filter(Boolean).join('\n')

  try {
    await sendEmail({ to, subject: `[Website] ${label}: ${firstName} ${lastName}`, text, idempotencyKey: `${kind}:${email}:${new Date().toISOString().slice(0,10)}` })
  } catch (e) {
    console.error('[marketing-lead] sendEmail failed', e)
    return NextResponse.json({ ok: false, error: 'Could not send your request. Please call (972) 945-1610.' }, { status: 502 })
  }
  return NextResponse.json({ ok: true })
}
