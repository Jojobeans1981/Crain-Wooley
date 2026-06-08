'use client'
import { useState } from 'react'
const PDF = '/guides/free-estate-planning-guide.pdf'

export function GuideForm() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')
  const [error, setError] = useState('')
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', consent: false })
  const upd = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setStatus('sending'); setError('')
    try {
      const r = await fetch('/api/marketing-lead', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ kind: 'guide', ...form }) })
      const data = await r.json()
      if (!r.ok || !data.ok) throw new Error(data.error || 'Something went wrong.')
      setStatus('done')
      const a = document.createElement('a'); a.href = PDF; a.download = 'Crain-Wooley-Estate-Planning-Guide.pdf'; document.body.appendChild(a); a.click(); a.remove()
    } catch (err) { setStatus('error'); setError(err instanceof Error ? err.message : 'Something went wrong.') }
  }

  if (status === 'done') return (
    <aside className="cw-webinar-form" role="status" aria-labelledby="guide-h">
      <svg className="cw-form-check" width="46" height="46" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="12" fill="#806848" />
        <path d="M7 12.4l3.2 3.2L17 9" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <h2 id="guide-h" className="cw-webinar-form-title">Your guide is downloading</h2>
      <p>Thanks, {form.firstName || 'there'}! If it didn’t start, <a href={PDF} target="_blank" rel="noopener">download it here</a>.</p>
    </aside>
  )

  return (
    <aside className="cw-webinar-form" aria-labelledby="guide-h">
      <h2 id="guide-h" className="cw-webinar-form-title">Get the Free Guide</h2>
      <form onSubmit={submit}>
        <div className="cw-field-row">
          <label className="cw-field"><span>First Name</span><input type="text" required autoComplete="given-name" value={form.firstName} onChange={upd('firstName')} /></label>
          <label className="cw-field"><span>Last Name</span><input type="text" required autoComplete="family-name" value={form.lastName} onChange={upd('lastName')} /></label>
        </div>
        <label className="cw-field"><span>Email</span><input type="email" required autoComplete="email" value={form.email} onChange={upd('email')} /></label>
        <label className="cw-field-check"><input type="checkbox" checked={form.consent} onChange={upd('consent')} /><span>I agree to receive educational content, event invitations, legal updates, and occasional promotional communications from Crain &amp; Wooley. I understand I may unsubscribe at any time.</span></label>
        <button type="submit" className="cw-btn-gold" disabled={status === 'sending'}>{status === 'sending' ? 'Sending…' : 'Download the Guide'}</button>
        {status === 'error' && <p className="cw-form-error" role="alert">{error}</p>}
      </form>
    </aside>
  )
}
