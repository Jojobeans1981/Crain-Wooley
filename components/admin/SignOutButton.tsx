'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/src/lib/supabase/client'

export function SignOutButton({ className }: { className?: string }) {
  const supabase = useMemo(() => {
    try {
      return createSupabaseBrowserClient()
    } catch {
      return null
    }
  }, [])
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  return (
    <button
      type="button"
      disabled={loading}
      onClick={async () => {
        setLoading(true)
        try {
          // Best-effort audit log while a session still exists.
          await fetch('/api/admin/signout', { method: 'POST' })
        } catch {
          // ignore
        }
        try {
          if (supabase) await supabase.auth.signOut()
        } finally {
          router.push('/login')
          router.refresh()
          setLoading(false)
        }
      }}
      className={
        className ??
        'font-mono text-[10px] text-cw-muted border border-cw-border px-2 py-1 hover:border-cw-gold hover:text-cw-gold transition-colors uppercase tracking-widest w-full text-center'
      }
    >
      {loading ? 'Signing out...' : 'Sign Out'}
    </button>
  )
}
