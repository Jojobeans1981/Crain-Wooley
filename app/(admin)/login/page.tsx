'use client'

import { useMemo, useState } from 'react'
import { createSupabaseBrowserClient } from '@/src/lib/supabase/client'

export default function AdminLoginPage() {
  const configured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
  const supabase = useMemo(() => (configured ? createSupabaseBrowserClient() : null), [configured])
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const origin = window.location.origin
      if (!supabase) throw new Error('Supabase not configured')
      const { error: signInError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${origin}/auth/callback`,
        },
      })
      if (signInError) throw signInError
      setSent(true)
    } catch {
      setError('Unable to send login link. Contact your administrator.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-vault-void text-vault-parchment px-6 md:px-12 py-16">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center gap-4 mb-10">
          <div className="w-[2px] h-8 bg-vault-gold" />
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-vault-gold">FutureEng</p>
            <h1 className="font-display text-3xl font-semibold text-vault-parchment">Crain &amp; Wooley</h1>
          </div>
        </div>

        <div className="bg-vault-chamber border border-vault-border p-8">
          <div className="font-mono text-xs uppercase tracking-widest text-vault-steel mb-2">Admin Access</div>
          <h2 className="font-display text-2xl font-semibold text-vault-parchment">Login</h2>
          <p className="text-base font-sans text-vault-parchment mt-2">
            Magic link sign-in. Admin accounts are pre-approved.
          </p>
          {!configured && (
            <div className="mt-6 border border-vault-warn/30 bg-vault-warn/10 p-4 font-mono text-xs text-vault-warn uppercase tracking-widest">
              Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.
            </div>
          )}

          <form onSubmit={onSubmit} className="mt-8 space-y-6">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-mono uppercase tracking-widest text-vault-steel">Email</label>
              <input
                className="bg-transparent border-b border-vault-border text-vault-parchment font-mono text-sm py-2 px-0 focus:outline-none focus:border-vault-gold transition-colors placeholder:text-vault-border"
                placeholder="you@crainwooley.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                required
                autoComplete="email"
              />
            </div>

            <button
              className="bg-vault-gold text-vault-void font-mono text-xs font-medium uppercase tracking-widest px-6 py-3 rounded-none hover:bg-vault-goldmute transition-colors w-full"
              disabled={loading || !configured}
              type="submit"
            >
              {loading ? 'Sending...' : 'Send Login Link'}
            </button>

            {sent && (
              <div className="border border-vault-border bg-vault-wall p-4 font-mono text-xs text-vault-parchment uppercase tracking-widest">
                Check your email for a login link.
              </div>
            )}
            {error && (
              <div className="border border-vault-warn/30 bg-vault-warn/10 p-4 font-mono text-xs text-vault-warn uppercase tracking-widest">
                {error}
              </div>
            )}
          </form>
        </div>
      </div>
    </main>
  )
}
