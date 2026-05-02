import { clsx } from 'clsx'

export function ChannelBadge({ channel }: { channel: 'SMS' | 'EMAIL' }) {
  return (
    <span
      className={clsx(
        'font-mono text-xs uppercase tracking-wider px-2 py-1 border border-vault-border',
        channel === 'SMS'
          ? 'bg-vault-gold/10 text-vault-gold border-vault-gold/30'
          : 'bg-blue-900/20 text-blue-400 border-blue-800/30'
      )}
    >
      {channel}
    </span>
  )
}

