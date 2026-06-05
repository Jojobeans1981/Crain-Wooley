import { SiteHeader, SiteFooter, RevealScript } from '@/components/site/SiteChrome'

/**
 * Marketing layout — wraps the migrated legacy pages (catch-all). Same public
 * site chrome as the Learning Center. Route groups add no path segment, so the
 * catch-all inside still matches from the site root; the app's explicit routes
 * (/, /learn, /qualify, /dashboard, …) take precedence over it.
 */
export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="cw-page">
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
      <RevealScript />
    </div>
  )
}
