'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface ClioOutboxStatus {
  connected: boolean
  pending: number
  inProgress: number
  failed: number
  oldestPendingAt: string | null
  lastDrainAt: string | null
  lastDrainResult: string | null
}

/** Compact relative time: "just now", "2m", "3h", "2d". */
function rel(iso: string | null): string {
  if (!iso) return 'never'
  const s = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000))
  if (s < 45) return 'just now'
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

/** "2d" style age (no "ago"), for the oldest-pending phrase. */
function age(iso: string | null): string {
  if (!iso) return ''
  const s = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000))
  if (s < 60) return `${s}s`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h`
  return `${Math.floor(h / 24)}d`
}

export function ClioOutboxCard() {
  const router = useRouter()
  const [status, setStatus] = useState<ClioOutboxStatus | null>(null)
  const [draining, setDraining] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/clio/drain')
      if (res.ok) setStatus(await res.json())
    } catch {
      /* leave card hidden if status can't load */
    }
  }, [])

  useEffect(() => { void Promise.resolve().then(load) }, [load])

  const drainNow = async () => {
    setDraining(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/clio/drain', { method: 'POST' })
      if (!res.ok) throw new Error('Drain failed')
      const data = await res.json()
      if (data.status) setStatus(data.status)
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Drain failed')
    } finally {
      setDraining(false)
    }
  }

  if (!status) return null

  const { connected, pending, inProgress, failed } = status
  const stats: { label: string; value: number; warn?: boolean }[] = [
    { label: 'Pending', value: pending },
    { label: 'In progress', value: inProgress },
    { label: 'Failed', value: failed, warn: failed > 0 },
  ]

  return (
    <section className="border border-cw-border bg-cw-panel" aria-label="Clio sync outbox">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-5 py-4 border-b border-cw-border">
        <div>
          <h2 className="font-display text-2xl text-cw-white">Clio Sync Outbox</h2>
          <div className="flex items-center gap-2 mt-1">
            <span className={`w-2 h-2 shrink-0 ${connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} aria-hidden="true" />
            <span className="font-mono text-xs text-cw-muted uppercase tracking-widest">
              {connected ? 'Connected' : 'Not connected'}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={drainNow}
          disabled={draining}
          aria-busy={draining}
          className="bg-cw-gold text-cw-black font-mono text-xs uppercase tracking-widest px-4 py-2 hover:bg-cw-gold-dim transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {draining ? 'Syncing…' : 'Drain now'}
        </button>
      </div>

      <div className="grid grid-cols-3 divide-x divide-cw-border border-b border-cw-border">
        {stats.map((s) => (
          <div key={s.label} className="p-5">
            <div className={`font-display text-3xl ${s.warn ? 'text-red-400' : 'text-cw-gold'}`}>
              {s.warn ? `⚠ ${s.value}` : s.value}
            </div>
            <div className="font-mono text-xs text-cw-muted uppercase tracking-widest mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="px-5 py-4 space-y-1">
        <p className="font-mono text-xs text-cw-muted uppercase tracking-widest">
          {pending === 0
            ? 'No leads waiting to sync'
            : `${pending} lead${pending === 1 ? '' : 's'} waiting${status.oldestPendingAt ? `, oldest ${age(status.oldestPendingAt)}` : ''}`}
        </p>
        {/* Batch D: announce the drain outcome (success result lands here) politely. */}
        <p className="font-mono text-xs text-cw-muted uppercase tracking-widest" aria-live="polite">
          Last drain: {rel(status.lastDrainAt)}{status.lastDrainResult ? ` — ${status.lastDrainResult}` : ''}
        </p>
        {failed > 0 && (
          <p className="font-mono text-xs text-red-400 uppercase tracking-widest">
            {failed} job{failed === 1 ? '' : 's'} failed — needs attention once Clio is live
          </p>
        )}
        {/* Batch D: drain failures are announced assertively, not color-only. */}
        {error && <p className="font-mono text-xs text-red-400 uppercase tracking-widest" role="alert">{error}</p>}
      </div>
    </section>
  )
}
