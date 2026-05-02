'use client'

import { useEffect, useMemo, useState } from 'react'
import useSWR from 'swr'
import { SequenceList, type SequenceLeadRow } from '@/components/admin/ghost/SequenceList'
import { SequenceDetail } from '@/components/admin/ghost/SequenceDetail'
import { FailureTable } from '@/components/admin/ghost/FailureTable'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

type SequencesResponse = {
  leads: SequenceLeadRow[]
  counts: { total: number; queued: number; sent: number; failed: number; cancelled: number; skipped: number }
  page: number
  limit: number
  total: number
}

function StatPill(props: { label: string; value: number; tone: 'gold' | 'safe' | 'warn' | 'steel' }) {
  const toneClass =
    props.tone === 'gold'
      ? 'border-vault-gold/30 text-vault-gold bg-vault-gold/10'
      : props.tone === 'safe'
        ? 'border-vault-safe/30 text-vault-safe bg-vault-safe/10'
        : props.tone === 'warn'
          ? 'border-vault-warn/30 text-vault-warn bg-vault-warn/10'
          : 'border-vault-border text-vault-steel bg-vault-wall'
  return (
    <div className={`border px-3 py-2 ${toneClass}`}>
      <div className="font-mono text-[10px] uppercase tracking-widest">{props.label}</div>
      <div className="font-display text-2xl font-semibold text-vault-parchment mt-1">{props.value}</div>
    </div>
  )
}

export default function GhostAssistantPage() {
  const [tab, setTab] = useState<'sequences' | 'failures'>('sequences')
  const [status, setStatus] = useState<'ALL' | 'PENDING' | 'SENT' | 'FAILED' | 'CANCELLED'>('ALL')
  const [channel, setChannel] = useState<'ALL' | 'SMS' | 'EMAIL'>('ALL')
  const [q, setQ] = useState('')
  const [debouncedQ, setDebouncedQ] = useState('')
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null)
  const [selectedSequenceId, setSelectedSequenceId] = useState<string | null>(null)

  // Role: we don't have a dedicated admin session endpoint yet; middleware passes x-admin-role for API calls.
  // For UI gating we default to "admin-capable"; server still enforces via requireRole().
  const canAdmin = true
  const canRetryAll = false

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q.trim()), 300)
    return () => clearTimeout(t)
  }, [q])

  const query = useMemo(() => {
    const sp = new URLSearchParams()
    sp.set('status', status)
    sp.set('channel', channel)
    if (debouncedQ) sp.set('q', debouncedQ)
    sp.set('page', '1')
    sp.set('limit', '25')
    return sp.toString()
  }, [status, channel, debouncedQ])

  const { data, isLoading } = useSWR<SequencesResponse>(
    tab === 'sequences' ? `/api/admin/sequences?${query}` : null,
    fetcher
  )

  const counts = data?.counts ?? { total: 0, queued: 0, sent: 0, failed: 0, cancelled: 0, skipped: 0 }

  return (
    <main className="min-h-screen bg-vault-void text-vault-parchment">
      <div className="max-w-[1200px] mx-auto px-6 md:px-12 py-10">
        <div className="flex items-center justify-between gap-6">
          <div>
            <div className="font-display text-2xl font-semibold text-vault-parchment">Ghost Assistant</div>
            <div className="font-mono text-xs text-vault-steel uppercase tracking-widest mt-2">
              Automated nurture sequences
            </div>
          </div>
          <div className="flex items-center gap-[1px] bg-vault-border">
            <button
              type="button"
              onClick={() => setTab('sequences')}
              className={`px-4 py-3 font-mono text-xs uppercase tracking-widest ${
                tab === 'sequences' ? 'bg-vault-chamber text-vault-gold' : 'bg-vault-void text-vault-steel hover:text-vault-gold'
              }`}
            >
              Sequences
            </button>
            <button
              type="button"
              onClick={() => setTab('failures')}
              className={`px-4 py-3 font-mono text-xs uppercase tracking-widest ${
                tab === 'failures' ? 'bg-vault-chamber text-vault-gold' : 'bg-vault-void text-vault-steel hover:text-vault-gold'
              }`}
            >
              Failures
            </button>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-[1px] bg-vault-border">
          <div className="bg-vault-chamber p-4">
            <StatPill label="Active" value={counts.queued} tone="gold" />
          </div>
          <div className="bg-vault-chamber p-4">
            <StatPill label="Sent" value={counts.sent} tone="safe" />
          </div>
          <div className="bg-vault-chamber p-4">
            <StatPill label="Failed" value={counts.failed} tone="warn" />
          </div>
          <div className="bg-vault-chamber p-4">
            <StatPill label="Cancelled" value={counts.cancelled} tone="steel" />
          </div>
        </div>

        {tab === 'sequences' && (
          <>
            <div className="mt-8 border border-vault-border bg-vault-chamber p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-mono uppercase tracking-widest text-vault-steel">Status</label>
                  <select
                    className="bg-transparent border-b border-vault-border text-vault-parchment font-mono text-sm py-2 px-0 focus:outline-none focus:border-vault-gold transition-colors"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                  >
                    {['ALL', 'PENDING', 'SENT', 'FAILED', 'CANCELLED'].map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-mono uppercase tracking-widest text-vault-steel">Channel</label>
                  <select
                    className="bg-transparent border-b border-vault-border text-vault-parchment font-mono text-sm py-2 px-0 focus:outline-none focus:border-vault-gold transition-colors"
                    value={channel}
                    onChange={(e) => setChannel(e.target.value as any)}
                  >
                    {['ALL', 'SMS', 'EMAIL'].map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-mono uppercase tracking-widest text-vault-steel">Search</label>
                  <input
                    className="bg-transparent border-b border-vault-border text-vault-parchment font-mono text-sm py-2 px-0 focus:outline-none focus:border-vault-gold transition-colors placeholder:text-vault-border"
                    placeholder="Lead name or email"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-[1px] bg-vault-border min-h-[680px]">
              <div className="bg-vault-chamber">
                {isLoading && !data ? (
                  <div className="p-8 font-mono text-xs text-vault-gold uppercase tracking-widest animate-pulse">
                    Loading sequences...
                  </div>
                ) : (
                  <SequenceList
                    rows={data?.leads ?? []}
                    selectedLeadId={selectedLeadId}
                    onSelect={(leadId, sequenceId) => {
                      setSelectedLeadId(leadId)
                      setSelectedSequenceId(sequenceId ?? null)
                    }}
                  />
                )}
              </div>
              <div className="bg-vault-chamber">
                <SequenceDetail selectedSequenceId={selectedSequenceId} canAdmin={canAdmin} />
              </div>
            </div>
          </>
        )}

        {tab === 'failures' && <FailureTable canRetryAll={canRetryAll} />}
      </div>
    </main>
  )
}

