'use client'

import { StatusDot, type MessageStatus } from '@/components/ui/StatusDot'

export type SequenceLeadRow = {
  id: string
  firstName: string
  lastName: string
  email: string
  practiceArea: string
  caseType: string
  status: string
  nurturePaused: boolean
  sequences: Array<{
    id: string
    step: number
    channel: 'SMS' | 'EMAIL'
    status: MessageStatus
  }>
}

export function SequenceList(props: {
  rows: SequenceLeadRow[]
  selectedLeadId: string | null
  onSelect: (leadId: string, sequenceId?: string) => void
}) {
  if (!props.rows.length) {
    return (
      <div className="h-full flex items-center justify-center text-center p-8">
        <div className="font-mono text-xs text-vault-steel uppercase tracking-widest">
          No sequences match your filters
        </div>
      </div>
    )
  }

  return (
    <div className="divide-y divide-vault-border">
      {props.rows.map((lead) => {
        const selected = props.selectedLeadId === lead.id
        return (
          <button
            key={lead.id}
            type="button"
            onClick={() => props.onSelect(lead.id, lead.sequences[0]?.id)}
            className={[
              'w-full text-left p-4 bg-vault-chamber hover:bg-vault-wall transition-colors relative',
              selected ? 'border-l-2 border-l-vault-gold' : 'border-l-2 border-l-transparent',
            ].join(' ')}
          >
            {lead.nurturePaused && (
              <div className="absolute inset-0 bg-vault-warn/10 pointer-events-none" />
            )}
            <div className="relative">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-display text-sm font-semibold text-vault-parchment">
                    {lead.firstName} {lead.lastName}
                  </div>
                  <div className="font-mono text-xs text-vault-steel mt-1">{lead.email}</div>
                </div>
                <span className="font-mono text-[10px] uppercase tracking-widest text-vault-steel border border-vault-border px-2 py-1">
                  {String(lead.caseType || lead.practiceArea).replace(/_/g, ' ')}
                </span>
              </div>

              <div className="mt-3 flex items-center gap-2 flex-wrap">
                {lead.sequences.map((s) => (
                  <StatusDot key={s.id} status={s.status} title={`Step ${s.step} ${s.channel}: ${s.status}`} />
                ))}
                {lead.nurturePaused && (
                  <span className="font-mono text-[10px] uppercase tracking-widest text-vault-warn border border-vault-warn/30 bg-vault-warn/10 px-2 py-1 ml-2">
                    Paused
                  </span>
                )}
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}

