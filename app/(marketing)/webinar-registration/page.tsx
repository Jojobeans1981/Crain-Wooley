import Link from 'next/link'
import { pageMetadata } from '@/lib/seo'

/**
 * Webinar registration (closes the announcement-bar /webinar-registration 404).
 * Content ported from estateplanningdfw.law/webinar-registration. The live page
 * has a registration form; this is a FAITHFUL STATIC rendering of it — there is
 * deliberately NO submission endpoint wired here (see the TODO on the <form>).
 * Until it's connected, the visible notice + phone number is the working path.
 */
export const metadata = pageMetadata({
  title: 'Webinar Registration | Crain & Wooley',
  description:
    'Register for the Crain & Wooley estate planning webinar. Managing partner Justin Crain simplifies complex legal concepts so you can plan with confidence.',
  path: '/webinar-registration',
})

const LEARN = [
  ['Avoid Probate Nightmares', 'Keep your assets out of costly court delays.'],
  ['Protect Your Home & Savings', 'Strategies that safeguard your hard-earned legacy.'],
  ['Plan for Incapacity', 'Ensure your healthcare and finances are managed exactly how you want.'],
  ['Special Needs Planning', 'Provide for family members who rely on you.'],
  ['Prevent Family Disputes', 'Keep inheritances safe from divorce, creditors, and taxation.'],
]
const ATTEND = [
  'Learn what you would normally pay hundreds in attorney time to discover for free.',
  'This webinar is perfect for homeowners, parents, or anyone with assets.',
  'Understand estate planning strategies and how they apply to your life.',
]

export default function WebinarRegistrationPage() {
  return (
    <div className="cw-article-bg">
      <header className="legacy-banner">
        <div className="cw-container legacy-banner-inner">
          <nav aria-label="Breadcrumb" className="legacy-crumbs">
            <ol>
              <li><Link href="/">Home</Link></li>
              <li><span aria-current="page">Webinar Registration</span></li>
            </ol>
          </nav>
          <h1 className="legacy-banner-title">Webinar Registration</h1>
        </div>
      </header>

      <div className="cw-container legacy-body">
        <p className="learn-lede" style={{ maxWidth: 760 }}>
          Are you confident your loved ones would be taken care of if something happened tomorrow?
          Estate planning is easy to put off, but having a proper plan in place is one of the most
          important steps you can take to protect yourself and your family.
        </p>
        <p className="learn-p" style={{ maxWidth: 760 }}>
          Join our estate planning webinar as our managing partner, Justin Crain, simplifies complex
          legal concepts so you can plan with confidence. Please select between our 12 pm or 6:30 pm
          session in the dropdown of the registration form.
        </p>

        <div className="cw-webinar-grid">
          <div>
            <h2 className="legacy-h2">What You&rsquo;ll Learn (Without Legal Jargon)</h2>
            <ul className="learn-ul">
              {LEARN.map(([t, d]) => <li key={t}><strong>{t}</strong> &ndash; {d}</li>)}
            </ul>
            <h2 className="legacy-h2">Why You Should Attend</h2>
            <ul className="learn-ul">
              {ATTEND.map((t) => <li key={t}>{t}</li>)}
            </ul>
          </div>

          {/* Registration form — STATIC. TODO: wire to the real submission
              endpoint (Scorpion/CRM webhook). No endpoint is invented here; the
              form does not submit. */}
          <aside className="cw-webinar-form" aria-labelledby="reg-h">
            <h2 id="reg-h" className="cw-webinar-form-title">Register today!</h2>
            <p className="cw-webinar-notice" role="note">
              Online registration is being connected. To reserve your seat now, call{' '}
              <a href="tel:9729451610">(972) 945-1610</a>.
            </p>
            <form aria-describedby="reg-static">
              <label className="cw-field">
                <span>Session</span>
                <select name="session" defaultValue="" disabled>
                  <option value="" disabled>Select a session…</option>
                  <option value="12pm">12:00 pm</option>
                  <option value="630pm">6:30 pm</option>
                </select>
              </label>
              <div className="cw-field-row">
                <label className="cw-field"><span>First Name</span><input type="text" name="firstName" autoComplete="given-name" disabled /></label>
                <label className="cw-field"><span>Last Name</span><input type="text" name="lastName" autoComplete="family-name" disabled /></label>
              </div>
              <label className="cw-field"><span>Email</span><input type="email" name="email" autoComplete="email" disabled /></label>
              <label className="cw-field"><span>Phone Number</span><input type="tel" name="phone" autoComplete="tel" disabled /></label>
              <label className="cw-field-check">
                <input type="checkbox" name="consent" disabled />
                <span>I consent to receiving emails and/or text message reminders for this event.</span>
              </label>
              <button type="button" className="cw-btn-gold" disabled aria-disabled="true">Register</button>
              <p id="reg-static" className="cw-webinar-static-hint">Form not yet active &mdash; please call to register.</p>
            </form>
          </aside>
        </div>
      </div>
    </div>
  )
}
