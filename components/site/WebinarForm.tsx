'use client'
import { useState } from 'react'

export function WebinarForm() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')
  const [error, setError] = useState('')
  const [form, setForm] = useState({ session: '', firstName: '', lastName: '', email: '', phone: '', consent: false })
  const upd = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: (e.target as HTMLInputElement).type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value }))

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setStatus('sending'); setError('')
    try {
      const r = await fetch('/api/marketing-lead', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ kind: 'webinar', ...form }) })
      const data = await r.json()
      if (!r.ok || !data.ok) throw new Error(data.error || 'Something went wrong.')
      setStatus('done')
    } catch (err) { setStatus('error'); setError(err instanceof Error ? err.message : 'Something went wrong.') }
  }

  if (status === 'done') return (
    <aside className="cw-webinar-form" role="status" aria-labelledby="reg-h">
      <svg className="cw-form-check" width="46" height="46" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="12" fill="#806848" />
        <path d="M7 12.4l3.2 3.2L17 9" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <h2 id="reg-h" className="cw-webinar-form-title">You’re registered!</h2>
      <p>Thanks, {form.firstName || 'there'} — we’ll email your webinar details shortly. Questions? Call <a href="tel:9729451610">(972) 945-1610</a>.</p>
    </aside>
  )

  return (
    <aside className="cw-webinar-form" aria-labelledby="reg-h">
      <h2 id="reg-h" className="cw-webinar-form-title">Register today!</h2>
      <form onSubmit={submit}>
        <label className="cw-field"><span>Session</span>
          <select name="session" required value={form.session} onChange={upd('session')}>
            <option value="" disabled>Select a session…</option>
            <option value="12pm">12:00 pm</option>
            <option value="630pm">6:30 pm</option>
          </select>
        </label>
        <div className="cw-field-row">
          <label className="cw-field"><span>First Name</span><input type="text" required autoComplete="given-name" value={form.firstName} onChange={upd('firstName')} /></label>
          <label className="cw-field"><span>Last Name</span><input type="text" required autoComplete="family-name" value={form.lastName} onChange={upd('lastName')} /></label>
        </div>
        <label className="cw-field"><span>Email</span><input type="email" required autoComplete="email" value={form.email} onChange={upd('email')} /></label>
        <label className="cw-field"><span>Phone Number</span><input type="tel" required autoComplete="tel" value={form.phone} onChange={upd('phone')} /></label>
        <label className="cw-field-check"><input type="checkbox" checked={form.consent} onChange={upd('consent')} /><span>I consent to receiving emails and/or text message reminders for this event.</span></label>
        <button type="submit" className="cw-btn-gold" disabled={status === 'sending'}>{status === 'sending' ? 'Registering…' : 'Register'}</button>
        {status === 'error' && <p className="cw-form-error" role="alert">{error}</p>}
      </form>
    </aside>
  )
}
