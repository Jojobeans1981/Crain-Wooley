import Link from 'next/link'

/**
 * Family F — 404 ON the closed marketing chrome. The catch-all [...slug] calls
 * notFound() for unmatched paths; this boundary lives inside (marketing) so it renders
 * within the marketing layout (header + footer) like the original's 404 does, with a
 * navy banner + branded copy. (The root app/not-found.tsx remains for truly-root misses.)
 */
export default function MarketingNotFound() {
  return (
    <>
      <header className="legacy-banner legacy-banner--navy">
        <div className="cw-container legacy-banner-inner">
          <h1 className="legacy-banner-title">Page Not Found</h1>
        </div>
      </header>
      <div className="cw-container cw-404">
        <p className="cw-404-code">Error 404</p>
        <p className="cw-404-lede">The page you&rsquo;re looking for may have moved. Let&rsquo;s get you back to planning with confidence.</p>
        <div className="cw-404-actions">
          <Link href="/" className="cw-btn-gold">Back to Home</Link>
          <Link href="/site-search" className="cw-btn-ghost">Search the Site</Link>
          <Link href="/contact-us" className="cw-btn-ghost">Contact Us</Link>
        </div>
      </div>
    </>
  )
}
