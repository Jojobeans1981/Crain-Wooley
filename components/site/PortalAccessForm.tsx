'use client'

import { useMemo, useState, type FormEvent } from 'react'

export function PortalAccessForm({ leadId: initialLeadId = '' }: { leadId?: string }) {
  const [leadId, setLeadId] = useState(initialLeadId)
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const canSubmit = useMemo(() => leadId.trim() && email.trim(), [leadId, email])

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setStatus(null)
    try {
      const res = await fetch('/api/portal/request-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId: leadId.trim(), email: email.trim() }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'We could not send the link right now.')
      setStatus('If the details match our records, a secure portal link has been sent.')
      setEmail('')
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="cw-panel p-5 md:p-6 space-y-4">
      <div>
        <div className="cw-eyebrow mb-1">Secure Portal</div>
        <h2 className="font-display text-2xl text-cw-navy">Request your portal link</h2>
        <p className="text-sm text-cw-ink-soft mt-2">
          We will email a signed link to the address already on file for the lead.
        </p>
      </div>

      <label className="block">
        <span className="block text-[11px] uppercase tracking-widest font-semibold text-cw-ink-mute mb-2">
          Lead ID
        </span>
        <input
          className="cw-input w-full"
          value={leadId}
          onChange={(e) => setLeadId(e.target.value)}
          placeholder="cuid_..."
          autoComplete="off"
        />
      </label>

      <label className="block">
        <span className="block text-[11px] uppercase tracking-widest font-semibold text-cw-ink-mute mb-2">
          Email on file
        </span>
        <input
          className="cw-input w-full"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="client@example.com"
          type="email"
          autoComplete="email"
        />
      </label>

      <button
        type="submit"
        disabled={!canSubmit || loading}
        className="cw-btn-primary inline-flex items-center justify-center disabled:opacity-50"
      >
        {loading ? 'Sending...' : 'Send secure link'}
      </button>

      {status && <p className="text-sm text-cw-ink-soft">{status}</p>}
    </form>
  )
}
