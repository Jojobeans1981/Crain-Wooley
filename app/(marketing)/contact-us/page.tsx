import type { Metadata } from 'next'
import { ContactForm } from '@/components/site/ContactForm'
import { Locations } from '@/components/site/home/sections'

export const metadata: Metadata = {
  title: 'Contact Us | Crain & Wooley',
  description: 'Contact the Dallas–Fort Worth estate planning attorneys at Crain & Wooley — call (972) 945-1610 or schedule a consultation at our Plano, Mansfield, or Fort Worth offices.',
  alternates: { canonical: '/contact-us' },
}

// Dedicated /contact-us (Family F). The original is a location/scheduling selector
// (no native contact form); we add a render-only contact form (submission wiring is the
// separate Clio/intake client-track) ABOVE the original's location selector, on the
// closed marketing chrome (header/navy banner/footer).
export default function ContactPage() {
  return (
    <>
      <header className="legacy-banner legacy-banner--navy">
        <div className="cw-container legacy-banner-inner">
          <h1 className="legacy-banner-title">Contact Us</h1>
        </div>
      </header>

      <div className="cw-container cw-contact-shell">
        <div className="cw-contact-intro">
          <h2 className="cw-contact-head">Send us a message</h2>
          <p className="cw-contact-lede">Tell us a little about what you need and we&rsquo;ll be in touch. Prefer to talk now? Call <a href="tel:+19729451610">(972) 945-1610</a>.</p>
        </div>
        <ContactForm />
      </div>

      <Locations />
    </>
  )
}
