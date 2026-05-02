'use client'

import { useMemo, useState } from 'react'
import useSWR, { mutate } from 'swr'
import { ChannelBadge } from '@/components/ui/ChannelBadge'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { StatusDot, type MessageStatus } from '@/components/ui/StatusDot'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

type SequenceDetailPayload = {
  sequence: {
    id: string
    leadId: string
    channel: 'SMS' | 'EMAIL'
    step: number
    scheduledAt: string
    sentAt: string | null
    status: MessageStatus
    template: string
    attempts: number
    lastError: string | null
    lead: {
      id: string
      firstName: string
      lastName: string
      email: string
      phone: string
      practiceArea: string
      caseType: string
      status: string
      paymentStatus: string
      nurturePaused: boolean
    }
  }
  messages: Array<{
    id: string
    step: number
    channel: 'SMS' | 'EMAIL'
    status: MessageStatus
    scheduledAt: string
    sentAt: string | null
    attempts: number
    lastError: string | null
    template: string
  }>
}

function StatusBadge({ status }: { status: MessageStatus }) {
  const styles: Record<MessageStatus, string> = {
    PENDING: 'bg-vault-gold/10 text-vault-gold border border-vault-gold/30',
    SENT: 'bg-vault-safe/10 text-vault-safe border border-vault-safe/30',
    FAILED: 'bg-vault-warn/10 text-vault-warn border border-vault-warn/30',
    CANCELLED: 'bg-vault-steel/10 text-vault-steel border border-vault-border',
    SKIPPED: 'bg-vault-steel/10 text-vault-steel border border-vault-border',
  }
  return (
    <span className={`font-mono text-xs uppercase tracking-wider px-2 py-1 ${styles[status]}`}>{status}</span>
  )
}

export function SequenceDetail(props: { selectedSequenceId: string | null; canAdmin: boolean }) {
  const { data, isLoading } = useSWR<SequenceDetailPayload>(
    props.selectedSequenceId ? `/api/admin/sequences/${props.selectedSequenceId}` : null,
    fetcher
  )

  const [confirmPause, setConfirmPause] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [busy, setBusy] = useState<string | null>(null)

  const lead = data?.sequence.lead

  const header = useMemo(() => {
    if (!lead) return null
    return (
      <div className="border-b border-vault-border pb-6">
        <div className="flex items-start justify-between gap-6">
          <div>
            <div className="font-display text-2xl font-semibold text-vault-parchment">
              {lead.firstName} {lead.lastName}
            </div>
            <div className="font-mono text-xs text-vault-steel mt-2">{lead.email}</div>
            <div className="font-mono text-xs text-vault-steel mt-1">{lead.phone}</div>
            <div className="mt-3 flex items-center gap-2">
              <span className="font-mono text-[10px] uppercase tracking-widest text-vault-steel border border-vault-border px-2 py-1">
                {String(lead.caseType || lead.practiceArea).replace(/_/g, ' ')}
              </span>
              <span className="font-mono text-[10px] uppercase tracking-widest text-vault-steel border border-vault-border px-2 py-1">
                {String(lead.status).replace(/_/g, ' ')}
              </span>
            </div>
          </div>

          {props.canAdmin && (
            <div className="flex flex-col items-end gap-2">
              {lead.nurturePaused ? (
                <button
                  type="button"
                  className="bg-vault-gold text-vault-void font-mono text-xs font-medium uppercase tracking-widest px-6 py-3 rounded-none hover:bg-vault-goldmute transition-colors"
                  disabled={Boolean(busy)}
                  onClick={async () => {
                    if (!data?.sequence?.id) return
                    setBusy('resume')
                    await fetch(`/api/admin/sequences/${data.sequence.id}/resume`, { method: 'POST' })
                    await mutate(`/api/admin/sequences/${data.sequence.id}`)
                    await mutate((key) => typeof key === 'string' && key.startsWith('/api/admin/sequences'))
                    setBusy(null)
                  }}
                >
                  {busy === 'resume' ? 'Resuming...' : 'Resume Sequence'}
                </button>
              ) : (
                <button
                  type="button"
                  className="border border-vault-border text-vault-steel font-mono text-xs uppercase tracking-widest px-6 py-3 rounded-none hover:border-vault-gold hover:text-vault-gold transition-colors"
                  onClick={() => setConfirmPause(true)}
                  disabled={Boolean(busy)}
                >
                  Pause Sequence
                </button>
              )}
            </div>
          )}
        </div>

        {lead?.nurturePaused && (
          <div className="mt-4 border border-vault-warn/30 bg-vault-warn/10 p-3 font-mono text-xs text-vault-warn uppercase tracking-widest">
            Sequence paused. Future messages are skipped until resumed.
          </div>
        )}
      </div>
    )
  }, [lead, props.canAdmin, busy, data?.sequence?.id])

  if (!props.selectedSequenceId) {
    return (
      <div className="h-full flex items-center justify-center text-center p-8">
        <div className="font-mono text-xs text-vault-steel uppercase tracking-widest">Select a sequence</div>
      </div>
    )
  }

  if (isLoading || !data) {
    return (
      <div className="h-full flex items-center justify-center text-center p-8">
        <div className="font-mono text-xs text-vault-gold uppercase tracking-widest animate-pulse">
          Loading sequence...
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {header}

      {confirmPause && lead && (
        <div className="mt-6">
          <ConfirmDialog
            title="Pause Sequence"
            message="This will skip all queued messages for this lead until resumed."
            onCancel={() => setConfirmPause(false)}
            onConfirm={async () => {
              setConfirmPause(false)
              if (!data.sequence.id) return
              setBusy('pause')
              await fetch(`/api/admin/sequences/${data.sequence.id}/pause`, { method: 'POST' })
              await mutate(`/api/admin/sequences/${data.sequence.id}`)
              await mutate((key) => typeof key === 'string' && key.startsWith('/api/admin/sequences'))
              setBusy(null)
            }}
          />
        </div>
      )}

      <div className="mt-8">
        <div className="font-mono text-xs uppercase tracking-widest text-vault-steel">Message Timeline</div>
        <div className="mt-4 space-y-4">
          {data.messages.map((m) => {
            const expanded = expandedId === m.id
            return (
              <div key={m.id} className="border border-vault-border bg-vault-chamber p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="font-mono text-xs text-vault-steel uppercase tracking-widest">{`Day ${m.step}`}</div>
                    <ChannelBadge channel={m.channel} />
                    <StatusBadge status={m.status} />
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusDot status={m.status} />
                  </div>
                </div>

                <div className="mt-3 font-mono text-xs text-vault-steel">
                  {m.status === 'SENT' && m.sentAt ? `Sent: ${new Date(m.sentAt).toLocaleString()}` : null}
                  {m.status !== 'SENT' ? `Scheduled: ${new Date(m.scheduledAt).toLocaleString()}` : null}
                </div>

                <button
                  type="button"
                  className="mt-4 w-full text-left"
                  onClick={() => setExpandedId(expanded ? null : m.id)}
                >
                  <div className={`text-sm font-mono text-vault-parchment leading-relaxed ${expanded ? '' : 'line-clamp-3'}`}>
                    {m.template}
                  </div>
                  <div className="mt-2 font-mono text-[10px] text-vault-steel uppercase tracking-widest">
                    {expanded ? 'Collapse' : 'Expand'}
                  </div>
                </button>

                {m.status === 'FAILED' && (
                  <div className="mt-4 space-y-3">
                    <div className="border border-vault-warn/30 bg-vault-warn/10 p-3 font-mono text-xs text-vault-warn break-words">
                      {m.lastError || 'Unknown error'}
                    </div>
                    <div className="font-mono text-xs text-vault-steel uppercase tracking-widest">
                      Attempted {m.attempts} times
                    </div>
                    {props.canAdmin && (
                      <button
                        type="button"
                        disabled={busy === m.id}
                        className="bg-vault-gold text-vault-void font-mono text-xs font-medium uppercase tracking-widest px-5 py-2 rounded-none hover:bg-vault-goldmute transition-colors"
                        onClick={async () => {
                          setBusy(m.id)
                          await fetch(`/api/admin/sequences/${m.id}/retry`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ nurtureMessageId: m.id }),
                          })
                          await mutate(`/api/admin/sequences/${data.sequence.id}`)
                          await mutate((key) => typeof key === 'string' && key.startsWith('/api/admin/sequences'))
                          setBusy(null)
                        }}
                      >
                        {busy === m.id ? 'Retrying...' : 'Retry'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

