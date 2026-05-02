import twilio from 'twilio'

let _client: ReturnType<typeof twilio> | null = null

function getClient() {
  if (!_client) {
    _client = twilio(
      process.env.TWILIO_ACCOUNT_SID!,
      process.env.TWILIO_AUTH_TOKEN!
    )
  }
  return _client
}

export async function sendSMS(to: string, body: string): Promise<void> {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[SMS STUB] To: ${to}\n${body}`)
    return
  }
  const client = getClient()
  await client.messages.create({
    body,
    from: process.env.TWILIO_FROM_NUMBER!,
    to,
  })
}
