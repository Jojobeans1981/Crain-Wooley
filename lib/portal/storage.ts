import crypto from 'crypto'

const DEFAULT_BUCKET = process.env.SUPABASE_PORTAL_BUCKET || 'client-documents'

function getSupabaseUrl() {
  return process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '') || ''
}

function getServiceRoleKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || ''
}

function hasStorageConfig() {
  return !!getSupabaseUrl() && !!getServiceRoleKey()
}

function sanitizeFileName(name: string) {
  return name
    .trim()
    .replace(/[^\w.\-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 120) || 'document'
}

export function portalBucketName() {
  return DEFAULT_BUCKET
}

export async function uploadPortalObject(input: {
  leadId: string
  fileName: string
  contentType: string
  bytes: Uint8Array
}) {
  if (!hasStorageConfig()) {
    throw new Error('Supabase storage is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.')
  }

  const bucket = DEFAULT_BUCKET
  const path = `${input.leadId}/${Date.now()}-${crypto.randomUUID()}-${sanitizeFileName(input.fileName)}`
  const url = `${getSupabaseUrl()}/storage/v1/object/${bucket}/${encodeURI(path)}`

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getServiceRoleKey()}`,
      apikey: getServiceRoleKey(),
      'Content-Type': input.contentType || 'application/octet-stream',
      'x-upsert': 'true',
    },
    body: Buffer.from(input.bytes),
  })

  if (!res.ok) {
    throw new Error(`Storage upload failed: ${res.status} ${await res.text()}`)
  }

  return {
    bucket,
    path,
    contentType: input.contentType || 'application/octet-stream',
    size: input.bytes.byteLength,
  }
}

export async function signPortalObjectUrl(input: {
  bucket?: string
  path: string
  expiresIn?: number
}) {
  if (!hasStorageConfig()) return null

  const bucket = input.bucket || DEFAULT_BUCKET
  const url = `${getSupabaseUrl()}/storage/v1/object/sign/${bucket}/${encodeURI(input.path)}`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getServiceRoleKey()}`,
      apikey: getServiceRoleKey(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ expiresIn: Math.max(60, input.expiresIn ?? 3600) }),
  })

  if (!res.ok) return null

  const data = await res.json().catch(() => null)
  if (!data?.signedURL) return null
  return `${getSupabaseUrl()}${data.signedURL}`
}

