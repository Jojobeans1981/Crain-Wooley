import { SiteHeader, SiteFooter, RevealScript } from '@/components/site/SiteChrome'

/** Learning Center layout — public education shell (warm-editorial design system). */
export default function LearnLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="cw-page">
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
      <RevealScript />
    </div>
  )
}
