'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import type { Lead, LeadStatus } from '@/types'
import { SignOutButton } from '@/components/admin/SignOutButton'

const STATUS_COLORS: Record<LeadStatus, string> = {
  NEW: 'text-blue-400 border-blue-800',
  QUALIFIED: 'text-cw-gold border-cw-gold-dim',
  DISQUALIFIED: 'text-cw-muted border-cw-border',
  PAYMENT_PENDING: 'text-amber-400 border-amber-800',
  PAYMENT_COMPLETE: 'text-green-400 border-green-900',
  SCHEDULED: 'text-purple-400 border-purple-900',
  CONSULTED: 'text-cyan-400 border-cyan-900',
  HIRED: 'text-emerald-400 border-emerald-900',
  CLOSED_LOST: 'text-red-400 border-red-900',
}

const FUNNEL_STAGES = [
  { key: 'totalLeads', label: 'Total Leads' },
  { key: 'qualified', label: 'Qualified' },
  { key: 'paid', label: 'Paid' },
  { key: 'scheduled', label: 'Scheduled' },
  { key: 'hired', label: 'Hired' },
]

export default function DashboardPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [metrics, setMetrics] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<LeadStatus | 'ALL'>('ALL')
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const [leadsRes, metricsRes] = await Promise.all([
        fetch('/api/admin/leads'),
        fetch('/api/admin/metrics')
      ])

      if (!leadsRes.ok || !metricsRes.ok) throw new Error('Failed to fetch data')

      const leadsData = await leadsRes.json()
      const metricsData = await metricsRes.json()

      setLeads(leadsData.leads)
      setMetrics(metricsData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const filtered = filter === 'ALL' ? leads : leads.filter(l => l.status === filter)

  const handleStatusChange = async (leadId: string, status: LeadStatus) => {
    setUpdatingId(leadId)
    try {
      const res = await fetch(`/api/admin/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      if (!res.ok) throw new Error('Update failed')
      
      setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status } : l))
      // Refresh metrics
      const metricsRes = await fetch('/api/admin/metrics')
      if (metricsRes.ok) {
        setMetrics(await metricsRes.json())
      }
    } catch (err) {
      alert('Failed to update status')
    } finally {
      setUpdatingId(null)
    }
  }

  const handleHire = async (leadId: string) => {
    setUpdatingId(leadId)
    try {
      const res = await fetch('/api/admin/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId })
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Onboarding failed')
      }
      
      setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: 'HIRED' as LeadStatus, hired: true } : l))
      // Refresh metrics
      const metricsRes = await fetch('/api/admin/metrics')
      if (metricsRes.ok) {
        setMetrics(await metricsRes.json())
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to trigger onboarding')
    } finally {
      setUpdatingId(null)
    }
  }

  if (loading && !leads.length) {
    return (
      <div className="min-h-screen bg-cw-black flex items-center justify-center">
        <div className="font-mono text-xs text-cw-gold animate-pulse uppercase tracking-widest">
          Synchronizing Data...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-cw-black flex items-center justify-center">
        <div className="cw-panel p-8 text-center max-w-md">
          <div className="text-red-500 mb-4">⚠</div>
          <div className="font-mono text-xs text-cw-white uppercase tracking-widest mb-4">{error}</div>
          <button onClick={() => fetchData()} className="cw-button py-2">Retry</button>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-cw-black">
      {/* Header */}
      <header className="border-b border-cw-border px-8 py-5 flex items-center justify-between">
        <div>
          <span className="font-display text-xl text-cw-gold tracking-widest">CRAIN & WOOLEY</span>
          <span className="font-mono text-xs text-cw-muted ml-4 tracking-widest uppercase">Intake Command</span>
        </div>
        <div className="flex items-center gap-6">
          {process.env.NEXT_PUBLIC_DEMO_MODE === 'true' && (
            <Link href="/demo" className="font-mono text-[10px] text-cw-gold border border-cw-gold/30 px-2 py-1 hover:bg-cw-gold/10 transition-colors uppercase tracking-widest">
              Demo Control ⬢
            </Link>
          )}
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 animate-pulse" />
            <span className="font-mono text-xs text-cw-muted uppercase tracking-widest">System Active</span>
          </div>
          <SignOutButton className="font-mono text-[10px] text-cw-muted border border-cw-border px-2 py-1 hover:border-cw-gold hover:text-cw-gold transition-colors uppercase tracking-widest" />
        </div>
      </header>

      <div className="p-8 space-y-8">
        {/* Funnel Metrics */}
        {metrics && (
          <div>
            <h2 className="font-display text-3xl text-cw-white mb-4">Funnel Overview</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-0 border border-cw-border divide-x divide-cw-border">
              {FUNNEL_STAGES.map((stage, i) => {
                const val = metrics[stage.key] as number
                const pct = i === 0 ? 100 : Math.round((val / metrics.totalLeads) * 100)
                return (
                  <div key={stage.key} className="p-6 bg-cw-panel">
                    <div className="font-display text-4xl text-cw-gold">{val}</div>
                    <div className="font-mono text-xs text-cw-muted uppercase tracking-widest mt-1">{stage.label}</div>
                    <div className="mt-3 h-1 bg-cw-dark">
                      <div className="h-full bg-cw-gold transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="font-mono text-xs text-cw-muted mt-1">{pct}%</div>
                  </div>
                )
              })}
            </div>
            <div className="flex gap-6 mt-4">
              <div className="cw-panel p-4">
                <div className="font-mono text-xs text-cw-muted uppercase tracking-widest">Revenue Collected</div>
                <div className="font-display text-3xl text-cw-gold mt-1">${metrics.revenue.toLocaleString()}</div>
              </div>
              <div className="cw-panel p-4">
                <div className="font-mono text-xs text-cw-muted uppercase tracking-widest">Conversion Rate</div>
                <div className="font-display text-3xl text-cw-gold mt-1">{metrics.conversionRate}%</div>
              </div>
            </div>
          </div>
        )}

        {/* Lead Table */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-3xl text-cw-white">Lead Pipeline</h2>
            <select
              className="cw-select w-auto text-xs"
              value={filter}
              onChange={e => setFilter(e.target.value as LeadStatus | 'ALL')}
            >
              <option value="ALL">All Statuses</option>
              {Object.keys(STATUS_COLORS).map(s => (
                <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>

          <div className="cw-panel overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-cw-border">
                  {['Lead', 'Practice Area', 'Urgency', 'Status', 'Created', 'Actions'].map(h => (
                    <th key={h} className="font-mono text-xs text-cw-muted uppercase tracking-widest px-4 py-3 text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-cw-border">
                {filtered.map(lead => (
                  <tr key={lead.id} className="hover:bg-cw-dark transition-colors">
                    <td className="px-4 py-4">
                      <div className="text-cw-white font-medium">{lead.firstName} {lead.lastName}</div>
                      <div className="font-mono text-xs text-cw-muted">{lead.email}</div>
                    </td>
                    <td className="px-4 py-4 font-mono text-xs text-cw-muted uppercase">
                      {lead.practiceArea.replace(/_/g, ' ')}
                    </td>
                    <td className="px-4 py-4 font-mono text-xs text-cw-muted uppercase">
                      {lead.urgency.replace(/_/g, ' ')}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`font-mono text-xs border px-2 py-1 uppercase tracking-wide ${STATUS_COLORS[lead.status]}`}>
                        {lead.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-4 font-mono text-xs text-cw-muted">
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex gap-2">
                        {lead.status === 'QUALIFIED' && (
                          <span className="font-mono text-xs text-amber-400">Awaiting Payment</span>
                        )}
                        {lead.status === 'CONSULTED' && !lead.hired && (
                          <button
                            onClick={() => handleHire(lead.id)}
                            disabled={updatingId === lead.id}
                            className="font-mono text-xs border border-emerald-800 text-emerald-400 px-3 py-1 hover:bg-emerald-900/20 transition-colors disabled:opacity-40"
                          >
                            {updatingId === lead.id ? '...' : '→ Hire'}
                          </button>
                        )}
                        {lead.status === 'PAYMENT_COMPLETE' && (
                          <button
                            onClick={() => handleStatusChange(lead.id, 'SCHEDULED')}
                            disabled={updatingId === lead.id}
                            className="font-mono text-xs border border-purple-800 text-purple-400 px-3 py-1 hover:bg-purple-900/20 transition-colors disabled:opacity-40"
                          >
                            Mark Scheduled
                          </button>
                        )}
                        {lead.status === 'SCHEDULED' && (
                          <button
                            onClick={() => handleStatusChange(lead.id, 'CONSULTED')}
                            disabled={updatingId === lead.id}
                            className="font-mono text-xs border border-cyan-800 text-cyan-400 px-3 py-1 hover:bg-cyan-900/20 transition-colors disabled:opacity-40"
                          >
                            Mark Consulted
                          </button>
                        )}
                        {lead.hired && (
                          <span className="font-mono text-xs text-emerald-400">✓ Hired</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center py-12 text-cw-muted font-mono text-xs uppercase tracking-widest">
                No leads match this filter
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
