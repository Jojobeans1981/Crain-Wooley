'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import type { Lead, LeadStatus } from '@/types'
import { SignOutButton } from '@/components/admin/SignOutButton'

type AuditEventRow = {
  id: string
  createdAt: string
  type: string
  actor: string | null
  meta: any
}

const STATUS_BADGE: Record<LeadStatus, string> = {
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

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [selected, setSelected] = useState<Lead | null>(null)
  const [audit, setAudit] = useState<AuditEventRow[]>([])
  const [auditLoading, setAuditLoading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const fetchLeads = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/leads')
      if (!res.ok) throw new Error('Failed to fetch leads')
      const data = await res.json()
      setLeads(data.leads)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLeads()
  }, [])

  useEffect(() => {
    async function loadAudit() {
      if (!selected) return
      setAuditLoading(true)
      try {
        const res = await fetch(`/api/audit/lead/${selected.id}?limit=100`)
        const data = await res.json()
        setAudit(Array.isArray(data.events) ? data.events : [])
      } catch {
        setAudit([])
      } finally {
        setAuditLoading(false)
      }
    }
    loadAudit()
  }, [selected?.id])

  const handleStatusUpdate = async (leadId: string, status: LeadStatus) => {
    setUpdatingId(leadId)
    try {
      const res = await fetch(`/api/admin/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      if (!res.ok) throw new Error('Update failed')
      
      setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status } : l))
      setSelected(prev => prev?.id === leadId ? { ...prev, status } : prev)
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
      
      setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: 'HIRED' as LeadStatus, hired: true, hiredAt: new Date().toISOString() } : l))
      setSelected(prev => prev?.id === leadId ? { ...prev, status: 'HIRED' as LeadStatus, hired: true } : prev)
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
          Synchronizing Leads...
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-cw-black flex">
      {/* Sidebar lead list */}
      <aside className="w-80 border-r border-cw-border flex flex-col h-screen sticky top-0">
        <div className="border-b border-cw-border p-5">
          <span className="font-display text-xl text-cw-gold tracking-widest">CRAIN & WOOLEY</span>
          <div className="font-mono text-xs text-cw-muted uppercase tracking-widest mt-1">Lead Detail</div>
        </div>
        <div className="flex items-center justify-between px-4 py-3 border-b border-cw-border">
          <span className="font-mono text-xs text-cw-muted uppercase tracking-widest">All Leads</span>
          <span className="font-mono text-xs text-cw-gold">{leads.length}</span>
        </div>
        {error && (
          <div className="p-4 text-red-500 font-mono text-[10px] uppercase text-center border-b border-cw-border">
            {error}
          </div>
        )}
        <div className="flex-1 overflow-y-auto divide-y divide-cw-border">
          {leads.map(lead => (
            <button
              key={lead.id}
              onClick={() => setSelected(lead)}
              className={`w-full text-left p-4 hover:bg-cw-dark transition-colors ${selected?.id === lead.id ? 'bg-cw-dark border-l-2 border-l-cw-gold' : ''}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-cw-white text-sm font-medium">{lead.firstName} {lead.lastName}</div>
                  <div className="font-mono text-xs text-cw-muted mt-0.5">{lead.practiceArea.replace(/_/g, ' ')}</div>
                </div>
                <span className={`font-mono text-xs border px-1.5 py-0.5 uppercase shrink-0 ${STATUS_BADGE[lead.status]}`}>
                  {lead.status.replace(/_/g, ' ')}
                </span>
              </div>
              <div className="font-mono text-xs text-cw-muted mt-1">
                {new Date(lead.createdAt).toLocaleDateString()}
              </div>
            </button>
          ))}
        </div>
        <div className="border-t border-cw-border p-4 space-y-3">
          <a href="/demo" className="font-mono text-[10px] text-cw-gold border border-cw-gold/30 px-2 py-1 hover:bg-cw-gold/10 transition-colors uppercase tracking-widest block text-center">
            Demo Control ⬢
          </a>
          <a href="/dashboard" className="font-mono text-xs text-cw-muted hover:text-cw-white transition-colors block text-center">
            ← Back to Dashboard
          </a>
          <SignOutButton />
        </div>
      </aside>

      {/* Detail panel */}
      <div className="flex-1 p-8 overflow-y-auto">
        {!selected ? (
          <div className="flex items-center justify-center h-full text-center">
            <div>
              <div className="font-display text-6xl text-cw-border mb-4">◈</div>
              <p className="font-mono text-xs text-cw-muted uppercase tracking-widest">Select a lead to view details</p>
            </div>
          </div>
        ) : (
          <div className="max-w-2xl space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <h1 className="font-display text-5xl text-cw-white">
                  {selected.firstName} {selected.lastName}
                </h1>
                <div className="flex items-center gap-3 mt-2">
                  <span className={`font-mono text-xs border px-2 py-1 uppercase tracking-wide ${STATUS_BADGE[selected.status]}`}>
                    {selected.status.replace(/_/g, ' ')}
                  </span>
                  {selected.qualified
                    ? <span className="font-mono text-xs text-green-400">✓ Qualified</span>
                    : <span className="font-mono text-xs text-cw-muted">✗ Disqualified</span>
                  }
                </div>
              </div>
            </div>

            {/* Contact info */}
            <div className="cw-panel p-6 space-y-3">
              <div className="font-mono text-xs text-cw-gold uppercase tracking-widest mb-4">Contact</div>
              {[
                ['Email', selected.email],
                ['Phone', selected.phone],
                ['Created', new Date(selected.createdAt).toLocaleString()],
              ].map(([label, val]) => (
                <div key={label} className="flex gap-6 text-sm border-b border-cw-border pb-3 last:border-0 last:pb-0">
                  <span className="font-mono text-xs text-cw-muted uppercase tracking-widest w-20 shrink-0 pt-0.5">{label}</span>
                  <span className="text-cw-white">{val}</span>
                </div>
              ))}
            </div>

            {/* Case info */}
            <div className="cw-panel p-6 space-y-3">
              <div className="font-mono text-xs text-cw-gold uppercase tracking-widest mb-4">Case Details</div>
              {[
                ['Area', selected.practiceArea.replace(/_/g, ' ')],
                ['Type', selected.caseType],
                ['Urgency', selected.urgency.replace(/_/g, ' ')],
              ].map(([label, val]) => (
                <div key={label} className="flex gap-6 text-sm border-b border-cw-border pb-3 last:border-0 last:pb-0">
                  <span className="font-mono text-xs text-cw-muted uppercase tracking-widest w-20 shrink-0 pt-0.5">{label}</span>
                  <span className="text-cw-white">{val}</span>
                </div>
              ))}
              <div className="border-t border-cw-border pt-3">
                <div className="font-mono text-xs text-cw-muted uppercase tracking-widest mb-2">Description</div>
                <p className="text-cw-muted text-sm leading-relaxed">{selected.description}</p>
              </div>
              {selected.disqualifyReason && (
                <div className="border border-red-900 bg-red-900/10 p-3 mt-2">
                  <div className="font-mono text-xs text-red-400 uppercase tracking-widest mb-1">Disqualify Reason</div>
                  <p className="text-cw-muted text-xs">{selected.disqualifyReason}</p>
                </div>
              )}
            </div>

            {/* Payment */}
            <div className="cw-panel p-6">
              <div className="font-mono text-xs text-cw-gold uppercase tracking-widest mb-4">Payment</div>
              <div className="flex gap-6 text-sm">
                <span className="font-mono text-xs text-cw-muted uppercase tracking-widest w-20 shrink-0">Status</span>
                <span className={`font-mono text-xs ${selected.paymentStatus === 'PAID' ? 'text-green-400' : 'text-amber-400'}`}>
                  {selected.paymentStatus}
                </span>
              </div>
              {selected.paidAt && (
                <div className="flex gap-6 text-sm mt-3">
                  <span className="font-mono text-xs text-cw-muted uppercase tracking-widest w-20 shrink-0">Paid At</span>
                  <span className="text-cw-white text-sm">{new Date(selected.paidAt).toLocaleString()}</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="cw-panel p-6">
              <div className="font-mono text-xs text-cw-gold uppercase tracking-widest mb-4">Actions</div>
              <div className="flex flex-wrap gap-3">
                {selected.status === 'PAYMENT_COMPLETE' && (
                  <button
                    onClick={() => handleStatusUpdate(selected.id, 'SCHEDULED')}
                    disabled={updatingId === selected.id}
                    className="font-mono text-xs border border-purple-800 text-purple-400 px-4 py-2 hover:bg-purple-900/20 transition-colors disabled:opacity-40"
                  >
                    {updatingId === selected.id ? '...' : 'Mark Scheduled'}
                  </button>
                )}
                {selected.status === 'SCHEDULED' && (
                  <button
                    onClick={() => handleStatusUpdate(selected.id, 'CONSULTED')}
                    disabled={updatingId === selected.id}
                    className="font-mono text-xs border border-cyan-800 text-cyan-400 px-4 py-2 hover:bg-cyan-900/20 transition-colors disabled:opacity-40"
                  >
                    {updatingId === selected.id ? '...' : 'Mark Consulted'}
                  </button>
                )}
                {selected.status === 'CONSULTED' && !selected.hired && (
                  <button
                    onClick={() => handleHire(selected.id)}
                    disabled={updatingId === selected.id}
                    className="font-mono text-xs border border-emerald-800 text-emerald-400 px-4 py-2 hover:bg-emerald-900/20 transition-colors disabled:opacity-40"
                  >
                    {updatingId === selected.id ? '...' : '→ Trigger Hire & Onboarding'}
                  </button>
                )}
                {selected.hired && (
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400 text-lg">✓</span>
                    <span className="font-mono text-xs text-emerald-400 uppercase tracking-widest">Client Hired — Clio Onboarding Triggered</span>
                  </div>
                )}
                {['NEW', 'QUALIFIED', 'PAYMENT_PENDING'].includes(selected.status) && (
                  <button
                    onClick={() => handleStatusUpdate(selected.id, 'CLOSED_LOST')}
                    disabled={updatingId === selected.id}
                    className="font-mono text-xs border border-red-900 text-red-400 px-4 py-2 hover:bg-red-900/20 transition-colors disabled:opacity-40"
                  >
                    {updatingId === selected.id ? '...' : 'Close Lost'}
                  </button>
                )}
              </div>
            </div>

            {/* Timeline */}
            <div className="cw-panel p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="font-mono text-xs text-cw-gold uppercase tracking-widest">Timeline</div>
                <button
                  className="font-mono text-xs text-cw-muted uppercase tracking-widest hover:text-cw-gold transition-colors"
                  onClick={() => selected && setSelected({ ...selected })}
                  disabled={auditLoading}
                >
                  {auditLoading ? 'Loading' : 'Refresh'}
                </button>
              </div>

              {audit.length === 0 && !auditLoading ? (
                <div className="font-mono text-xs text-cw-muted uppercase tracking-widest">
                  No events yet
                </div>
              ) : (
                <div className="divide-y divide-cw-border">
                  {audit.map((evt) => (
                    <div key={evt.id} className="py-3">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="font-mono text-xs text-cw-white uppercase tracking-wider">
                            {evt.type.replace(/_/g, ' ')}
                          </div>
                          {evt.meta ? (
                            <div className="font-mono text-[10px] text-cw-muted mt-1 break-words">
                              {JSON.stringify(evt.meta)}
                            </div>
                          ) : null}
                        </div>
                        <div className="font-mono text-[10px] text-cw-muted uppercase tracking-widest shrink-0">
                          {new Date(evt.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
