import type { Metadata } from 'next'
import { Cormorant_Garamond, Montserrat } from 'next/font/google'
import './globals.css'

const display = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-display',
})

const sans = Montserrat({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-sans',
})

const mono = Montserrat({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
})

export const metadata: Metadata = {
  title: 'Crain & Wooley — Estate Planning Attorneys | Dallas-Fort Worth, TX',
  description:
    'Protect your assets with our qualified Dallas-Fort Worth estate planning attorneys. We build customized wills and trusts. Schedule a confidential consultation today.',
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'LegalService',
  name: 'Crain & Wooley',
  description:
    'Estate planning, wills, trusts, probate, and elder law services for clients across the Dallas-Fort Worth area.',
  url: 'https://www.estateplanningdfw.law',
  telephone: '+1-972-945-1610',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '2805 Dallas Parkway, Suite 400',
    addressLocality: 'Plano',
    addressRegion: 'TX',
    postalCode: '75093',
    addressCountry: 'US',
  },
  openingHours: 'Mo-Fr 09:00-17:00',
  priceRange: '$$$',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const isDemo = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'

  return (
    <html lang="en" className={`${display.variable} ${sans.variable} ${mono.variable}`}>
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body className="min-h-screen bg-[#F7F7F7] text-cw-ink antialiased font-sans">
        {isDemo && (
          <div className="bg-cw-navy text-white py-1.5 px-4 text-center font-sans text-[11px] uppercase tracking-[0.18em] sticky top-0 w-full z-[100] font-semibold border-b border-cw-gold">
            Interactive Demo Mode — External APIs Simulated
          </div>
        )}
        {children}
      </body>
    </html>
  )
}
