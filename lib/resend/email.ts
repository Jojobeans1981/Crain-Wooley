import { Resend } from 'resend'

let _resend: Resend | null = null

function getClient() {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY!)
  }
  return _resend
}

export async function sendEmail(params: {
  to: string
  subject: string
  text: string
}): Promise<void> {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[EMAIL STUB] To: ${params.to} | Subject: ${params.subject}\n${params.text}`)
    return
  }
  const resend = getClient()
  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to: params.to,
    subject: params.subject,
    text: params.text,
  })
}
