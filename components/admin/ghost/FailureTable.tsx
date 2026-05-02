'use client'

import useSWR, { mutate } from 'swr'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function FailureTable({ canRetryAll }: { canRetryAll: boolean }) {
  const { data, isLoading } = useSWR<{ failures: any[] }>('/api/admin/sequences/failures', fetcher)

  const failures = data?.failures ?? []

  if (isLoading) {
    return (
      <div className="p-8 font-mono text-xs text-vault-gold uppercase tracking-widest animate-pulse">
        Loading failures...
      </div>
    )
  }

  if (!failures.length) {
    return (
      <div className="p-12 flex items-center justify-center text-center">
        <div className="font-mono text-xs uppercase tracking-widest text-vault-safe">
          No failed messages
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="font-display text-2xl font-semibold text-vault-parchment">Failures</div>
        {canRetryAll && (
          <button
            type="button"
            className="bg-vault-gold text-vault-void font-mono text-xs font-medium uppercase tracking-widest px-5 py-2 rounded-none hover:bg-vault-goldmute transition-colors"
            onClick={async () => {
              for (const f of failures) {
                await fetch(`/api/admin/sequences/${f.id}/retry`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ nurtureMessageId: f.id }),
                })
              }
              await mutate('/api/admin/sequences/failures')
              await mutate((key) => typeof key === 'string' && key.startsWith('/api/admin/sequences'))
            }}
          >
            Retry All Failed
          </button>
        )}
      </div>

      <div className="border border-vault-border bg-vault-chamber overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead>
            <tr className="border-b border-vault-border">
              {['Lead Name', 'Day', 'Channel', 'Last Error', 'Attempts', 'Failed At', 'Action'].map((col) => (
                <th
                  key={col}
                  className="text-left font-mono text-xs uppercase tracking-widest text-vault-steel py-3 px-4"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {failures.map((f) => (
              <tr key={f.id} className="border-b border-vault-border hover:bg-vault-wall transition-colors">
                <td className="font-mono text-sm text-vault-parchment py-4 px-4">
                  {f.lead?.firstName} {f.lead?.lastName}
                  <div className="font-mono text-xs text-vault-steel mt-1">{f.lead?.email}</div>
                </td>
                <td className="font-mono text-sm text-vault-steel py-4 px-4">{`Day ${f.step}`}</td>
                <td className="font-mono text-sm text-vault-steel py-4 px-4">{f.channel}</td>
                <td className="font-mono text-xs text-vault-warn py-4 px-4 max-w-[420px] break-words">
                  {f.lastError || 'Unknown error'}
                </td>
                <td className="font-mono text-sm text-vault-steel py-4 px-4">{f.attempts}</td>
                <td className="font-mono text-xs text-vault-steel py-4 px-4">
                  {new Date(f.updatedAt).toLocaleString()}
                </td>
                <td className="py-4 px-4">
                  <button
                    type="button"
                    className="font-mono text-xs text-vault-gold uppercase tracking-wider hover:underline"
                    onClick={async () => {
                      await fetch(`/api/admin/sequences/${f.id}/retry`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ nurtureMessageId: f.id }),
                      })
                      await mutate('/api/admin/sequences/failures')
                      await mutate((key) => typeof key === 'string' && key.startsWith('/api/admin/sequences'))
                    }}
                  >
                    Retry →
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

