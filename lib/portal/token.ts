import crypto from 'crypto'

export interface PortalTokenPayload {
  leadId: string
  email: string
  exp: number
  iat: number
}

const FALLBACK_SECRET = 'crain-wooley-portal-dev-secret'

function getSecret() {
  return (
    process.env.PORTAL_LINK_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    process.env.CRON_SECRET ||
    process.env.DATABASE_URL ||
    FALLBACK_SECRET
  )
}

function toBase64Url(value: string) {
  return Buffer.from(value, 'utf8').toString('base64url')
}

function fromBase64Url(value: string) {
  return Buffer.from(value, 'base64url').toString('utf8')
}

function sign(payload: string) {
  return crypto.createHmac('sha256', getSecret()).update(payload).digest('base64url')
}

export function createPortalToken(input: { leadId: string; email: string; ttlHours?: number }) {
  const iat = Math.floor(Date.now() / 1000)
  const exp = iat + Math.max(1, input.ttlHours ?? 72) * 60 * 60
  const payload: PortalTokenPayload = {
    leadId: input.leadId,
    email: input.email.trim().toLowerCase(),
    iat,
    exp,
  }
  const raw = JSON.stringify(payload)
  return `${toBase64Url(raw)}.${sign(raw)}`
}

export function verifyPortalToken(token: string) {
  const [encoded, signature] = token.split('.')
  if (!encoded || !signature) return null

  try {
    const raw = fromBase64Url(encoded)
    const expected = sign(raw)
    const provided = Buffer.from(signature, 'base64url')
    const actual = Buffer.from(expected, 'base64url')
    if (provided.length !== actual.length) return null
    if (!crypto.timingSafeEqual(provided, actual)) return null

    const payload = JSON.parse(raw) as PortalTokenPayload
    if (
      !payload ||
      typeof payload.leadId !== 'string' ||
      typeof payload.email !== 'string' ||
      typeof payload.exp !== 'number' ||
      payload.exp < Math.floor(Date.now() / 1000)
    ) {
      return null
    }

    return {
      leadId: payload.leadId,
      email: payload.email.toLowerCase(),
      exp: payload.exp,
      iat: payload.iat,
    } satisfies PortalTokenPayload
  } catch {
    return null
  }
}

