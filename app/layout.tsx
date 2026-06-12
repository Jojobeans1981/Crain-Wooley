import type { Metadata } from 'next'
import { Montserrat, Pinyon_Script, Cormorant_Garamond } from 'next/font/google'
import './globals.css'

// Display serif. The ORIGINAL (estateplanningdfw.law) renders headings in real
// Cormorant Garamond (narrow). It was never actually bundled here — --font-display
// referenced the family name with no font loaded, so headings fell through to a ~9%
// wider Hoefler/Times fallback (the rejected banner "heavier heading"). Load it for
// real and lead the display chain with it.
const cormorant = Cormorant_Garamond({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-cormorant', display: 'swap' })

// Cursive script for the faint handwriting watermark on the pillars band,
// matching the original's script-handwriting background.
const script = Pinyon_Script({ subsets: ['latin'], weight: '400', variable: '--font-script', display: 'swap' })

// Marketing body/UI font. Scoped to .cw-page (see globals.css) so intake/admin
// keep Inter; .variable only defines --font-marketing-sans, it changes nothing
// until referenced.
const montserrat = Montserrat({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-marketing-sans', display: 'swap' })

const fontVars = {
  '--font-display-fallback': 'var(--font-cormorant), "Cormorant Garamond", "Hoefler Text", "Times New Roman", serif',
  '--font-sans': 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  '--font-mono': '"JetBrains Mono", ui-monospace, Menlo, monospace',
} as React.CSSProperties

// â”€â”€ SEO / domain â”€â”€
// Canonical production host. The app will be served at this domain after DNS
// cutover; until then it lives on the Vercel URL and MUST stay out of search.
// Set NEXT_PUBLIC_SITE_INDEXABLE=true only in the production (live-domain)
// environment. While unset/false (Vercel staging), the whole site is noindex.
const SITE_URL = 'https://www.estateplanningdfw.law'
const SITE_INDEXABLE = process.env.NEXT_PUBLIC_SITE_INDEXABLE === 'true'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'Crain & Wooley â€” Estate Planning Attorneys | Dallas-Fort Worth, TX',
  description:
    'Protect your assets with our qualified Dallas-Fort Worth estate planning attorneys. We build customized wills and trusts. Schedule a confidential consultation today.',
  robots: SITE_INDEXABLE
    ? { index: true, follow: true }
    : { index: false, follow: false, nocache: true },
  // Global OG/Twitter defaults â€” every page emits a social card. Pages that set
  // their own openGraph (via lib/seo pageMetadata) override these per-page.
  openGraph: {
    type: 'website',
    siteName: 'Crain & Wooley',
    title: 'Crain & Wooley â€” Estate Planning Attorneys | Dallas-Fort Worth, TX',
    description:
      'Protect your assets with our qualified Dallas-Fort Worth estate planning attorneys. We build customized wills and trusts. Schedule a confidential consultation today.',
    images: [{ url: '/social-share.jpg', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Crain & Wooley â€” Estate Planning Attorneys | Dallas-Fort Worth, TX',
    description:
      'Protect your assets with our qualified Dallas-Fort Worth estate planning attorneys. We build customized wills and trusts. Schedule a confidential consultation today.',
    images: ['/social-share.jpg'],
  },
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
    <html lang="en" style={fontVars} className={`${montserrat.variable} ${script.variable} ${cormorant.variable}`}>
      <head>
        {/* arno-pro (display serif) â€” Adobe Typekit, matches the approved intake design */}
        <link rel="preconnect" href="https://use.typekit.net" crossOrigin="" />
        <link rel="stylesheet" href="https://use.typekit.net/zjv2lcl.css" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body className="min-h-screen bg-cw-cream text-cw-ink antialiased font-sans">
        {isDemo && (
          <div className="bg-cw-navy text-cw-cream py-1.5 px-4 text-center font-mono text-[11px] uppercase tracking-[0.18em] sticky top-0 w-full z-[100] font-semibold border-b border-cw-gold">
            Interactive Demo Mode â€” External APIs Simulated
          </div>
        )}
        {children}
      </body>
    </html>
  )
}
