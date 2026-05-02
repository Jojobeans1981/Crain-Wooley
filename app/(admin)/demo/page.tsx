'use client'
import { useState } from 'react'

export default function DemoControlPage() {
  const [leadId, setLeadId] = useState('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<string | null>(null)

  const simulatePayment = async () => {
    if (!leadId) return alert('Enter Lead ID')
    setLoading(true)
    try {
      // Simulate Stripe Webhook
      const res = await fetch('/api/stripe/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'stripe-signature': 'demo_signature' // The webhook will need to handle this
        },
        body: JSON.stringify({
          type: 'checkout.session.completed',
          data: {
            object: {
              metadata: { leadId }
            }
          }
        })
      })
      if (res.ok) setStatus('✅ Payment Simulated (Status -> PAYMENT_COMPLETE)')
      else setStatus('❌ Failed to simulate payment')
    } catch (err) {
      setStatus('❌ Error: ' + (err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const simulateBooking = async () => {
    if (!leadId) return alert('Enter Lead ID')
    setLoading(true)
    try {
      // Find lead email first for cal.com webhook simulation
      const leadRes = await fetch(`/api/leads`)
      const data = await leadRes.json()
      const lead = data.leads.find((l: any) => l.id === leadId)
      
      if (!lead) throw new Error('Lead not found')

      // Simulate Cal.com Webhook
      const res = await fetch('/api/cal/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          triggerEvent: 'BOOKING_CREATED',
          payload: {
            booking: {
              id: 'demo_booking_' + Date.now(),
              startTime: new Date(Date.now() + 86400000).toISOString(),
            },
            attendees: [{ email: lead.email }]
          }
        })
      })
      if (res.ok) setStatus('✅ Booking Simulated (Status -> SCHEDULED)')
      else setStatus('❌ Failed to simulate booking')
    } catch (err) {
      setStatus('❌ Error: ' + (err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-cw-black p-12">
      <div className="max-w-2xl mx-auto space-y-8">
        <header>
          <h1 className="font-display text-4xl text-cw-gold">Demo Control Panel</h1>
          <p className="text-cw-muted mt-2">Simulate system events without real API calls.</p>
        </header>

        <div className="cw-panel p-8 space-y-6">
          <div>
            <label className="cw-label">Target Lead ID</label>
            <input 
              className="cw-input" 
              placeholder="Copy ID from Dashboard" 
              value={leadId} 
              onChange={e => setLeadId(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button 
              className="cw-btn-primary" 
              onClick={simulatePayment}
              disabled={loading}
            >
              Simulate $300 Payment
            </button>
            <button 
              className="cw-btn-ghost" 
              onClick={simulateBooking}
              disabled={loading}
            >
              Simulate Cal.com Booking
            </button>
          </div>

          {status && (
            <div className="p-4 bg-cw-dark border border-cw-border font-mono text-xs text-cw-white">
              {status}
            </div>
          )}
        </div>

        <div className="cw-panel p-6 bg-amber-950/20 border-amber-900/50">
          <h3 className="font-mono text-xs text-amber-500 uppercase tracking-widest mb-2">Presentation Tips</h3>
          <ul className="text-sm text-cw-muted space-y-2 list-disc list-inside">
            <li>Open the <strong>Dashboard</strong> in one tab and this <strong>Control Panel</strong> in another.</li>
            <li>Submit a new lead through the website.</li>
            <li>Copy the ID, paste it here, and click simulate to see the dashboard update live.</li>
            <li>Use the <strong>Case Tracker</strong> link for that lead to show the client's perspective.</li>
          </ul>
        </div>
      </div>
    </main>
  )
}
