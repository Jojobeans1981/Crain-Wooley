'use client'

import { useState, type FormEvent } from 'react'

export function PortalUploadForm({
  leadId,
  token,
}: {
  leadId: string
  token: string
}) {
  const [file, setFile] = useState<File | null>(null)
  const [note, setNote] = useState('')
  const [status, setStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!file) {
      setStatus('Choose a file first.')
      return
    }

    setLoading(true)
    setStatus(null)
    try {
      const fd = new FormData()
      fd.append('leadId', leadId)
      fd.append('token', token)
      fd.append('note', note)
      fd.append('file', file)

      const res = await fetch('/api/portal/upload', { method: 'POST', body: fd })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Upload failed.')

      setStatus('File uploaded successfully.')
      setFile(null)
      setNote('')
      window.location.reload()
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Upload failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} className="cw-panel p-5 md:p-6 space-y-4">
      <div>
        <div className="cw-eyebrow mb-1">Upload to Firm</div>
        <h3 className="font-display text-xl text-cw-navy">Send a document</h3>
        <p className="text-sm text-cw-ink-soft mt-2">
          Upload a signed form, statement, deed copy, or other document the firm requested.
        </p>
      </div>

      <label className="block">
        <span className="block text-[11px] uppercase tracking-widest font-semibold text-cw-ink-mute mb-2">
          File
        </span>
        <input
          type="file"
          className="cw-input w-full"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
      </label>

      <label className="block">
        <span className="block text-[11px] uppercase tracking-widest font-semibold text-cw-ink-mute mb-2">
          Note
        </span>
        <textarea
          className="cw-input w-full min-h-24"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Optional note for the firm"
        />
      </label>

      <button
        type="submit"
        disabled={loading || !file}
        className="cw-btn-primary inline-flex items-center justify-center disabled:opacity-50"
      >
        {loading ? 'Uploading...' : 'Upload document'}
      </button>

      {status && <p className="text-sm text-cw-ink-soft">{status}</p>}
    </form>
  )
}

