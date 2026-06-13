'use client'

import { useState } from 'react'

/**
 * Contact form — RENDER-ONLY this unit. Live submission (lead create → Clio Grow /
 * intake) is the separate client-track item, so the form does NOT post anywhere; on
 * submit it shows an honest "not yet connected" notice pointing to the working channels
 * (phone + the consultation scheduler). No data is sent, nothing is faked as received.
 */
export function ContactForm() {
  const [submitted, setSubmitted] = useState(false)
  return (
    <form
      className="cw-contact-form"
      onSubmit={(e) => { e.preventDefault(); setSubmitted(true) }}
      noValidate
    >
      <div className="cw-contact-row">
        <label className="cw-field">
          <span className="cw-field-label">First Name</span>
          <input className="cw-input" type="text" name="firstName" autoComplete="given-name" />
        </label>
        <label className="cw-field">
          <span className="cw-field-label">Last Name</span>
          <input className="cw-input" type="text" name="lastName" autoComplete="family-name" />
        </label>
      </div>
      <div className="cw-contact-row">
        <label className="cw-field">
          <span className="cw-field-label">Email</span>
          <input className="cw-input" type="email" name="email" autoComplete="email" />
        </label>
        <label className="cw-field">
          <span className="cw-field-label">Phone</span>
          <input className="cw-input" type="tel" name="phone" autoComplete="tel" />
        </label>
      </div>
      <label className="cw-field">
        <span className="cw-field-label">How can we help?</span>
        <textarea className="cw-input cw-textarea" name="message" rows={5} />
      </label>
      <button type="submit" className="cw-btn-gold cw-contact-submit">Send Message</button>
      {submitted && (
        <p className="cw-contact-notice" role="status">
          Online message delivery is being connected. To reach us now, call{' '}
          <a href="tel:+19729451610">(972) 945-1610</a> or{' '}
          <a href="/get-started">schedule a consultation</a>.
        </p>
      )}
    </form>
  )
}
