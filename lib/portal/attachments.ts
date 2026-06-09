import crypto from 'crypto'

export type PortalUploadRecord = {
  id: string
  name: string
  bucket: string
  path: string
  contentType: string
  size: number
  uploadedAt: string
  note?: string
}

export type PortalRequestRecord = {
  id: string
  kind: 'DOCUMENT' | 'SIGNATURE'
  note: string
  createdAt: string
}

export type PortalAttachmentState = {
  portalUploads: PortalUploadRecord[]
  portalRequests: PortalRequestRecord[]
}

function isObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

export function readPortalAttachmentState(value: unknown): PortalAttachmentState {
  if (!isObject(value)) {
    return { portalUploads: [], portalRequests: [] }
  }

  const portalUploads = Array.isArray(value.portalUploads) ? value.portalUploads : []
  const portalRequests = Array.isArray(value.portalRequests) ? value.portalRequests : []

  return {
    portalUploads: portalUploads
      .filter(isObject)
      .map((item) => ({
        id: String(item.id ?? crypto.randomUUID()),
        name: String(item.name ?? 'Document'),
        bucket: String(item.bucket ?? 'client-documents'),
        path: String(item.path ?? ''),
        contentType: String(item.contentType ?? 'application/octet-stream'),
        size: Number(item.size ?? 0),
        uploadedAt: String(item.uploadedAt ?? new Date().toISOString()),
        note: item.note ? String(item.note) : undefined,
      }))
      .filter((item) => item.path.length > 0),
    portalRequests: portalRequests
      .filter(isObject)
      .map((item) => ({
        id: String(item.id ?? crypto.randomUUID()),
        kind: item.kind === 'SIGNATURE' ? 'SIGNATURE' : 'DOCUMENT',
        note: String(item.note ?? ''),
        createdAt: String(item.createdAt ?? new Date().toISOString()),
      })),
  }
}

export function writePortalAttachmentState(
  current: unknown,
  patch: Partial<PortalAttachmentState>
): PortalAttachmentState {
  const base = readPortalAttachmentState(current)
  return {
    portalUploads: patch.portalUploads ?? base.portalUploads,
    portalRequests: patch.portalRequests ?? base.portalRequests,
  }
}

export function appendPortalUpload(
  current: unknown,
  upload: PortalUploadRecord
): PortalAttachmentState {
  const base = readPortalAttachmentState(current)
  return {
    portalUploads: [upload, ...base.portalUploads].slice(0, 24),
    portalRequests: base.portalRequests,
  }
}

export function appendPortalRequest(
  current: unknown,
  request: PortalRequestRecord
): PortalAttachmentState {
  const base = readPortalAttachmentState(current)
  return {
    portalUploads: base.portalUploads,
    portalRequests: [request, ...base.portalRequests].slice(0, 24),
  }
}

