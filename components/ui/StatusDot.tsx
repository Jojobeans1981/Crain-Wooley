'use client'

import { clsx } from 'clsx'

export type MessageStatus = 'PENDING' | 'SENT' | 'FAILED' | 'CANCELLED' | 'SKIPPED'

const STATUS_STYLE: Record<MessageStatus, string> = {
  PENDING: 'bg-vault-border',
  SENT: 'bg-vault-gold',
  FAILED: 'bg-vault-warn',
  CANCELLED: 'bg-vault-steel',
  SKIPPED: 'bg-vault-steel',
}

export function StatusDot({ status, title }: { status: MessageStatus; title?: string }) {
  return (
    <div
      className={clsx('w-2 h-2', STATUS_STYLE[status])}
      title={title ?? status}
      aria-label={title ?? status}
    />
  )
}

