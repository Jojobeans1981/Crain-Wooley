'use client'
import { useState } from 'react'
import Link from 'next/link'

type SequenceStatus = 'PENDING' | 'SENT' | 'FAILED' | 'CANCELLED'
type Channel = 'SMS' | 'EMAIL'

interface MockSequence {
  id: string
  leadName: string
  leadEmail: string
  channel: Channel
  step: number
  scheduledAt: string
  sentAt?: string
  status: SequenceStatus
  template: string
}

const STATUS_STYLE: Record<SequenceStatus, string> = {
  PENDING: 'text-amber-400 border-amber-800',
  SENT: 'text-green-400 border-green-900',
  FAILED: 'text-red-400 border-red-900',
  CANCELLED: 'text-cw-muted border-cw-border',
}

const MOCK_SEQUENCES: MockSequence[] = [
  { id: 's1', leadName: 'Angela Ross', leadEmail: 'angela@email.com', channel: 'EMAIL', step: 1, scheduledAt: new Date(Date.now() - 3600000).toISOString(), sentAt: new Date(Date.now() - 3598000).toISOString(), status: 'SENT', template: 'Hi Angela, thank you for reaching out to Crain & Wooley...' },
  { id: 's2', leadName: 'Angela Ross', leadEmail: 'angela@email.com', channel: 'SMS', step: 2, scheduledAt: new Date(Date.now() - 0).toISOString(), status: 'PENDING', template: 'Hi Angela, this is Crain & Wooley. We received your inquiry about Criminal Defense...' },
  { id: 's3', leadName: 'Angela Ross', leadEmail: 'angela@email.com', channel: 'EMAIL', step: 3, scheduledAt: new Date(Date.now() + 82800000).toISOString(), status: 'PENDING', template: 'Hi Angela, we noticed you haven\'t yet secured your consultation slot...' },
  { id: 's4', leadName: 'Sarah Lim', leadEmail: 'sarah@email.com', channel: 'EMAIL', step: 1, scheduledAt: new Date(Date.now() - 7200000).toISOString(), sentAt: new Date(Date.now() - 7190000).toISOString(), status: 'SENT', template: 'Hi Sarah, thank you for reaching out to Crain & Wooley...' },
  { id: 's5', leadName: 'Sarah Lim', leadEmail: 'sarah@email.com', channel: 'SMS', step: 2, scheduledAt: new Date(Date.now() - 3600000).toISOString(), sentAt: new Date(Date.now() - 3590000).toISOString(), status: 'SENT', template: 'Hi Sarah, this is Crain & Wooley...' },
  { id: 's6', leadName: 'Sarah Lim', leadEmail: 'sarah@email.com', channel: 'EMAIL', step: 3, scheduledAt: new Date(Date.now() + 75600000).toISOString(), status: 'PENDING', template: 'Hi Sarah, still thinking it over?...' },
  { id: 's7', leadName: 'James Torres', leadEmail: 'james@email.com', channel: 'EMAIL', step: 1, scheduledAt: new Date(Date.now() - 3600000).toISOString(), status: 'CANCELLED', template: 'Hi James, thank you for reaching out...' },
  { id: 's8', leadName: 'James Torres', leadEmail: 'james@email.com', channel: 'SMS', step: 2, scheduledAt: new Date(Date.now()).toISOString(), status: 'CANCELLED', template: 'Hi James, this is Crain & Wooley...' },
]

function formatTime(iso: string) {
  const d = new Date(iso)
  const now = Date.now()
  const diff = d.getTime() - now
  if (Math.abs(diff) < 60000) return 'now'
  if (diff < 0) {
    const m = Math.round(-diff / 60000)
    return m < 60 ? `${m}m ago` : `${Math.round(m / 60)}h ago`
  }
  const m = Math.round(diff / 60000)
  return m < 60 ? `in ${m}m` : `in ${Math.round(m / 60)}h`
}

export default function SequencesPage() {
  const [sequences] = useState<MockSequence[]>(MOCK_SEQUENCES)
  const [filter, setFilter] = useState<SequenceStatus | 'ALL'>('ALL')
  const [preview, setPreview] = useState<MockSequence | null>(null)

  const filtered = filter === 'ALL' ? sequences : sequences.filter(s => s.status === filter)

  const stats = {
    total: sequences.length,
    sent: sequences.filter(s => s.status === 'SENT').length,
    pending: sequences.filter(s => s.status === 'PENDING').length,
    failed: sequences.filter(s => s.status === 'FAILED').length,
    cancelled: sequences.filter(s => s.status === 'CANCELLED').length,
  }

  return (
    <main className="min-h-screen bg-cw-black">
      <header className="border-b border-cw-border px-8 py-5 flex items-center justify-between">
        <div>
          <span className="font-display text-xl text-cw-gold tracking-widest">CRAIN & WOOLEY</span>
          <span className="font-mono text-xs text-cw-muted ml-4 tracking-widest uppercase">Ghost Assistant</span>
        </div>
        <Link href="/dashboard" className="font-mono text-xs text-cw-muted hover:text-cw-white border border-cw-border px-3 py-1 transition-colors">
          ← Dashboard
        </Link>
      </header>

      <div className="p-8 space-y-8">
        {/* Stats */}
        <div>
          <h2 className="font-display text-3xl text-cw-white mb-4">Sequence Monitor</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-0 border border-cw-border divide-x divide-cw-border">
            {[
              { label: 'Total Jobs', val: stats.total, color: 'text-cw-white' },
              { label: 'Sent', val: stats.sent, color: 'text-green-400' },
              { label: 'Pending', val: stats.pending, color: 'text-amber-400' },
              { label: 'Failed', val: stats.failed, color: 'text-red-400' },
              { label: 'Cancelled', val: stats.cancelled, color: 'text-cw-muted' },
            ].map(item => (
              <div key={item.label} className="bg-cw-panel p-5 text-center">
                <div className={`font-display text-4xl ${item.color}`}>{item.val}</div>
                <div className="font-mono text-xs text-cw-muted uppercase tracking-widest mt-1">{item.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Cron info */}
        <div className="cw-panel p-5 flex items-center justify-between">
          <div>
            <div className="font-mono text-xs text-cw-gold uppercase tracking-widest mb-1">Cron Endpoint</div>
            <code className="font-mono text-xs text-cw-muted">POST /api/ghost/cron · Bearer CRON_SECRET</code>
          </div>
          <div className="text-right">
            <div className="font-mono text-xs text-cw-muted uppercase tracking-widest mb-1">Recommended Schedule</div>
            <code className="font-mono text-xs text-cw-white">*/5 * * * * (every 5 min)</code>
          </div>
        </div>

        {/* Table */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-2xl text-cw-white">All Jobs</h2>
            <select
              className="cw-select w-auto text-xs"
              value={filter}
              onChange={e => setFilter(e.target.value as SequenceStatus | 'ALL')}
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="SENT">Sent</option>
              <option value="FAILED">Failed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <div className="cw-panel overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-cw-border">
                  {['Lead', 'Channel', 'Step', 'Scheduled', 'Status', 'Preview'].map(h => (
                    <th key={h} className="font-mono text-xs text-cw-muted uppercase tracking-widest px-4 py-3 text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-cw-border">
                {filtered.map(seq => (
                  <tr key={seq.id} className="hover:bg-cw-dark transition-colors">
                    <td className="px-4 py-3">
                      <div className="text-cw-white text-sm">{seq.leadName}</div>
                      <div className="font-mono text-xs text-cw-muted">{seq.leadEmail}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-mono text-xs border px-2 py-1 ${seq.channel === 'SMS' ? 'text-purple-400 border-purple-900' : 'text-blue-400 border-blue-900'}`}>
                        {seq.channel}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-cw-muted">
                      {seq.step} / 6
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-cw-muted">
                      {formatTime(seq.scheduledAt)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-mono text-xs border px-2 py-1 uppercase tracking-wide ${STATUS_STYLE[seq.status]}`}>
                        {seq.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setPreview(preview?.id === seq.id ? null : seq)}
                        className="font-mono text-xs text-cw-muted hover:text-cw-white border border-cw-border px-2 py-1 transition-colors"
                      >
                        {preview?.id === seq.id ? 'Close' : 'View'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Template preview */}
            {preview && (
              <div className="border-t border-cw-gold bg-cw-dark p-6">
                <div className="font-mono text-xs text-cw-gold uppercase tracking-widest mb-3">
                  Template Preview — Step {preview.step} / {preview.channel}
                </div>
                <pre className="font-mono text-xs text-cw-muted whitespace-pre-wrap leading-relaxed">
                  {preview.template}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
