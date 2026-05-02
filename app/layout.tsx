import type { Metadata } from 'next'
import { Cormorant_Garamond, IBM_Plex_Mono, IBM_Plex_Sans } from 'next/font/google'
import './globals.css'

const display = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '600'],
  variable: '--font-display',
})

const mono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
})

const sans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-sans',
})

export const metadata: Metadata = {
  title: 'Crain & Wooley — Automated Intake Engine',
  description:
    'Schedule your confidential legal consultation with Crain & Wooley. Estate Planning, Family Law, and more.',
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'LegalService',
  name: 'Crain & Wooley',
  description: 'Professional legal services specializing in Estate Planning and Family Law.',
  url: 'https://crainwooley.com', // Placeholder
  telephone: '+1-555-000-0000', // Placeholder
  address: {
    '@type': 'PostalAddress',
    streetAddress: '123 Law Lane', // Placeholder
    addressLocality: 'Plano',
    addressRegion: 'TX',
    postalCode: '75024',
    addressCountry: 'US',
  },
  openingHours: 'Mo-Fr 09:00-17:00',
  priceRange: '$$$',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const isDemo = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'

  return (
    <html lang="en" className={`${display.variable} ${mono.variable} ${sans.variable}`}>
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body className="min-h-screen bg-vault-void text-vault-parchment antialiased font-sans">
        {isDemo && (
          <div className="bg-vault-gold text-vault-void py-1 px-4 text-center font-mono text-[10px] uppercase tracking-[0.2em] sticky top-0 w-full z-[100] font-bold border-b border-vault-border">
            Interactive Demo Mode Active — External APIs Simulated
          </div>
        )}
        {children}
      </body>
    </html>
  )
}

