'use client'

import { useMemo, useState } from 'react'
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

type Template = {
  id: string
  day: number
  channel: 'SMS' | 'EMAIL'
  subject: string | null
  body: string
  active: boolean
}

function sampleRender(input: string) {
  const vars: Record<string, string> = {
    firstName: 'Alex',
    matterType: 'Estate Planning',
    firmName: 'Crain & Wooley',
    schedulingUrl: 'https://cal.com/crainwooley/consultation',
  }
  return input.replace(/\{\{(\w+)\}\}/g, (_, k) => vars[k] ?? `{{${k}}}`)
}

export default function TemplatesPage() {
  const { data, mutate, isLoading } = useSWR<{ templates: Template[] }>('/api/admin/templates', fetcher)
  const templates = data?.templates ?? []

  const [drafts, setDrafts] = useState<Record<string, Partial<Template>>>({})
  const [previewId, setPreviewId] = useState<string | null>(null)
  const [savingId, setSavingId] = useState<string | null>(null)

  const mergeTags = useMemo(
    () => ['{{firstName}}', '{{matterType}}', '{{firmName}}', '{{schedulingUrl}}'],
    []
  )

  if (isLoading && !data) {
    return (
      <main className="min-h-screen bg-vault-void px-6 md:px-12 py-16 text-vault-parchment">
        <div className="max-w-[1200px] mx-auto font-mono text-xs text-vault-gold uppercase tracking-widest animate-pulse">
          Loading templates...
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-vault-void px-6 md:px-12 py-12 text-vault-parchment">
      <div className="max-w-[1200px] mx-auto">
        <div className="flex items-center justify-between gap-6">
          <div>
            <div className="font-display text-2xl font-semibold text-vault-parchment">Templates</div>
            <div className="font-mono text-xs text-vault-steel uppercase tracking-widest mt-2">
              Ghost Assistant nurture content
            </div>
          </div>
          <a
            href="/ghost-assistant"
            className="border border-vault-border text-vault-steel font-mono text-xs uppercase tracking-widest px-4 py-3 rounded-none hover:border-vault-gold hover:text-vault-gold transition-colors"
          >
            Back
          </a>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-[1px] bg-vault-border">
          {templates.map((t) => {
            const draft = drafts[t.id] ?? {}
            const body = draft.body ?? t.body
            const subject = draft.subject ?? t.subject
            const active = typeof draft.active === 'boolean' ? draft.active : t.active
            const dirty = body !== t.body || subject !== t.subject || active !== t.active
            const smsLen = body.length

            return (
              <div key={t.id} className="bg-vault-chamber p-8">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-vault-steel uppercase tracking-widest">{`Day ${t.day}`}</span>
                    <span
                      className={
                        t.channel === 'SMS'
                          ? 'font-mono text-xs uppercase tracking-wider px-2 py-1 bg-vault-gold/10 text-vault-gold border border-vault-gold/30'
                          : 'font-mono text-xs uppercase tracking-wider px-2 py-1 bg-blue-900/20 text-blue-400 border border-blue-800/30'
                      }
                    >
                      {t.channel}
                    </span>
                    {dirty && <span className="w-2 h-2 bg-vault-gold" title="Unsaved changes" />}
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="font-mono text-xs uppercase tracking-widest text-vault-steel">Active</label>
                    <button
                      type="button"
                      className={`border border-vault-border px-3 py-2 font-mono text-xs uppercase tracking-widest ${
                        active ? 'text-vault-gold hover:border-vault-gold' : 'text-vault-steel hover:text-vault-gold'
                      }`}
                      onClick={() =>
                        setDrafts((d) => ({ ...d, [t.id]: { ...d[t.id], active: !active } }))
                      }
                    >
                      {active ? 'On' : 'Off'}
                    </button>
                  </div>
                </div>

                {t.channel === 'EMAIL' && (
                  <div className="mt-6 flex flex-col gap-1">
                    <label className="text-xs font-mono uppercase tracking-widest text-vault-steel">Subject</label>
                    <input
                      className="bg-transparent border-b border-vault-border text-vault-parchment font-mono text-sm py-2 px-0 focus:outline-none focus:border-vault-gold transition-colors placeholder:text-vault-border"
                      value={subject ?? ''}
                      onChange={(e) =>
                        setDrafts((d) => ({ ...d, [t.id]: { ...d[t.id], subject: e.target.value } }))
                      }
                      placeholder="Subject line"
                    />
                  </div>
                )}

                <div className="mt-6 flex flex-col gap-1">
                  <label className="text-xs font-mono uppercase tracking-widest text-vault-steel">Body</label>
                  <textarea
                    className="bg-transparent border border-vault-border text-vault-parchment font-mono text-sm p-3 focus:outline-none focus:border-vault-gold transition-colors min-h-[180px]"
                    value={body}
                    onChange={(e) =>
                      setDrafts((d) => ({ ...d, [t.id]: { ...d[t.id], body: e.target.value } }))
                    }
                  />
                  <div className="flex items-center justify-between mt-2">
                    <div
                      className={`font-mono text-xs ${
                        t.channel === 'SMS' && smsLen > 160 ? 'text-vault-warn' : 'text-vault-steel'
                      }`}
                    >
                      {t.channel === 'SMS' ? `${smsLen}/1600 chars` : `${smsLen} chars`}
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        className="border border-vault-border text-vault-steel font-mono text-xs uppercase tracking-widest px-4 py-2 rounded-none hover:border-vault-gold hover:text-vault-gold transition-colors"
                        onClick={() => setPreviewId(previewId === t.id ? null : t.id)}
                      >
                        Preview
                      </button>
                      <button
                        type="button"
                        disabled={savingId === t.id}
                        className="bg-vault-gold text-vault-void font-mono text-xs font-medium uppercase tracking-widest px-4 py-2 rounded-none hover:bg-vault-goldmute transition-colors disabled:opacity-60"
                        onClick={async () => {
                          setSavingId(t.id)
                          const res = await fetch(`/api/admin/templates/${t.id}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ subject, body, active }),
                          })
                          setSavingId(null)
                          if (res.ok) {
                            setDrafts((d) => {
                              const next = { ...d }
                              delete next[t.id]
                              return next
                            })
                            await mutate()
                          } else {
                            const j = await res.json().catch(() => ({}))
                            alert(j.error || 'Failed to save template')
                          }
                        }}
                      >
                        {savingId === t.id ? 'Saving...' : 'Save'}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-6 border-t border-vault-border pt-4">
                  <div className="font-mono text-xs uppercase tracking-widest text-vault-steel mb-2">
                    Available merge tags
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {mergeTags.map((tag) => (
                      <span
                        key={tag}
                        className="font-mono text-xs text-vault-steel border border-vault-border px-2 py-1"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {previewId === t.id && (
                  <div className="mt-6 border border-vault-border bg-vault-wall p-4">
                    <div className="font-mono text-xs uppercase tracking-widest text-vault-steel">Preview</div>
                    <pre className="mt-3 whitespace-pre-wrap font-mono text-sm text-vault-parchment leading-relaxed">
                      {sampleRender(
                        t.channel === 'EMAIL' && subject ? `Subject: ${subject}\n\n${body}` : body
                      )}
                    </pre>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </main>
  )
}

