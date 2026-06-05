import type { Metadata } from 'next'
import { Montserrat, JetBrains_Mono, Cormorant_Garamond } from 'next/font/google'
import './globals.css'

// Body + UI sans — Stage-1 brand token (matches the live Scorpion site's nav/body).
const sans = Montserrat({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
})

// Labels / data / kickers — cf.mono
const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
})

// Serif fallback for arno-pro (loaded via Typekit in <head>). cf.serif lists
// "arno-pro" first, then Cormorant Garamond — we bundle that fallback so heads
// stay styled even if the Typekit kit fails to load on a given domain.
const displayFallback = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-display-fallback',
})

// ── SEO / domain ──
// Canonical production host. The app will be served at this domain after DNS
// cutover; until then it lives on the Vercel URL and MUST stay out of search.
// Set NEXT_PUBLIC_SITE_INDEXABLE=true only in the production (live-domain)
// environment. While unset/false (Vercel staging), the whole site is noindex.
const SITE_URL = 'https://www.estateplanningdfw.law'
const SITE_INDEXABLE = process.env.NEXT_PUBLIC_SITE_INDEXABLE === 'true'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'Crain & Wooley — Estate Planning Attorneys | Dallas-Fort Worth, TX',
  description:
    'Protect your assets with our qualified Dallas-Fort Worth estate planning attorneys. We build customized wills and trusts. Schedule a confidential consultation today.',
  robots: SITE_INDEXABLE
    ? { index: true, follow: true }
    : { index: false, follow: false, nocache: true },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'LegalService',
  name: 'Crain & Wooley',
  description:
    'Estate planning, wills, trusts, probate, and elder law services for clients across the Dallas-Fort Worth area.',
  url: SITE_URL,
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
    <html
      lang="en"
      className={`${displayFallback.variable} ${sans.variable} ${mono.variable}`}
    >
      <head>
        {/* arno-pro (display serif) — Adobe Typekit, matches the approved intake design */}
        <link rel="preconnect" href="https://use.typekit.net" crossOrigin="" />
        <link rel="stylesheet" href="https://use.typekit.net/zjv2lcl.css" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body className="min-h-screen bg-cw-cream text-cw-ink antialiased font-sans">
        {isDemo && (
          <div className="bg-cw-navy text-cw-cream py-1.5 px-4 text-center font-mono text-[11px] uppercase tracking-[0.18em] sticky top-0 w-full z-[100] font-semibold border-b border-cw-gold">
            Interactive Demo Mode — External APIs Simulated
          </div>
        )}
        {children}
      </body>
    </html>
  )
}
