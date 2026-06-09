'use client'

import { useMemo, useState, type FormEvent } from 'react'

type RequestKind = 'DOCUMENT' | 'SIGNATURE'

export function PortalRequestForm({
  leadId,
  token,
}: {
  leadId: string
  token: string
}) {
  const [kind, setKind] = useState<RequestKind>('DOCUMENT')
  const [note, setNote] = useState('')
  const [status, setStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const canSubmit = useMemo(() => token.trim() && leadId.trim(), [token, leadId])

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setStatus(null)
    try {
      const res = await fetch('/api/portal/request-item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId, token, kind, note }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Request failed.')
      setStatus('Request sent to the firm.')
      setNote('')
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="cw-panel p-5 md:p-6 space-y-4">
      <div>
        <div className="cw-eyebrow mb-1">Firm Request</div>
        <h3 className="font-display text-xl text-cw-navy">Need a document or signature packet?</h3>
        <p className="text-sm text-cw-ink-soft mt-2">
          Tell the firm what you need and they can prepare the next step.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {([
          { id: 'DOCUMENT', label: 'Document upload' },
          { id: 'SIGNATURE', label: 'Signature packet' },
        ] as const).map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => setKind(option.id)}
            className={`border px-4 py-3 text-sm transition-colors ${
              kind === option.id
                ? 'border-cw-gold bg-cw-gold/[0.08] text-cw-navy'
                : 'border-cw-line text-cw-ink-soft hover:border-cw-gold'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <label className="block">
        <span className="block text-[11px] uppercase tracking-widest font-semibold text-cw-ink-mute mb-2">
          Note for the team
        </span>
        <textarea
          className="cw-input w-full min-h-28"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Tell the team what you need or which document is missing."
        />
      </label>

      <button
        type="submit"
        disabled={!canSubmit || loading}
        className="cw-btn-primary inline-flex items-center justify-center disabled:opacity-50"
      >
        {loading ? 'Sending...' : 'Send request'}
      </button>

      {status && <p className="text-sm text-cw-ink-soft">{status}</p>}
    </form>
  )
}

